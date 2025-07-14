// Google OAuth Service for Search Console integration
// This service handles Google OAuth authentication and Search Console API calls

interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface SearchConsoleProperty {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser';
  verified: boolean;
}

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GSCKeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  searchVolume?: number;
  difficulty?: number;
  source: 'gsc';
  intent?: 'informational' | 'navigational' | 'transactional' | 'commercial';
}

class GoogleOAuthService {
  private config: GoogleAuthConfig;
  private useMockData = import.meta.env.VITE_MOCK_MODE === 'true';

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`,
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    };
  }

  /**
   * Initiate Google OAuth authorization flow
   */
  async initiateOAuth(): Promise<void> {
    if (this.useMockData) {
      this.handleMockAuth();
      return;
    }

    if (!this.config.clientId) {
      const error = 'Google OAuth client ID not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.';
      console.error(error);
      throw new Error(error);
    }

    try {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.config.clientId);
      authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', this.config.scopes.join(' '));
      authUrl.searchParams.set('access_type', 'offline'); // Required for refresh tokens
      authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token
      authUrl.searchParams.set('state', 'search-console-auth');

      console.log('Initiating Google OAuth flow:', {
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        scopes: this.config.scopes
      });

      // Open OAuth flow in new window
      const authWindow = window.open(
        authUrl.toString(),
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!authWindow) {
        throw new Error('Failed to open OAuth popup. Please check popup blockers.');
      }

      // Wait for OAuth completion via postMessage
      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'OAUTH_SUCCESS') {
            console.log('OAuth completed successfully');
            if (!isResolved) {
              isResolved = true;
              window.removeEventListener('message', messageHandler);
              cleanup();
              resolve();
            }
          } else if (event.data.type === 'OAUTH_ERROR') {
            console.error('OAuth error:', event.data.error);
            if (!isResolved) {
              isResolved = true;
              window.removeEventListener('message', messageHandler);
              cleanup();
              reject(new Error(event.data.error));
            }
          }
        };

        window.addEventListener('message', messageHandler);

        // Fallback: detect window closure without using window.closed (COOP-safe)
        let windowCheckInterval: NodeJS.Timeout | undefined;
        let timeoutHandle: NodeJS.Timeout;
        
        const cleanup = () => {
          if (windowCheckInterval) clearInterval(windowCheckInterval);
          if (timeoutHandle) clearTimeout(timeoutHandle);
          try {
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          } catch (e) {
            // Ignore COOP-related errors when closing window
            console.log('Unable to close auth window due to COOP policy');
          }
        };

        // Use focus events to detect window state instead of window.closed
        const handleWindowFocus = () => {
          // When main window regains focus, check if auth is still pending
          setTimeout(() => {
            if (!isResolved) {
              console.log('Main window focused but OAuth not completed, assuming cancelled');
              if (!isResolved) {
                isResolved = true;
                window.removeEventListener('message', messageHandler);
                window.removeEventListener('focus', handleWindowFocus);
                cleanup();
                reject(new Error('OAuth flow was cancelled'));
              }
            }
          }, 1000); // Give time for postMessage to arrive
        };

        window.addEventListener('focus', handleWindowFocus);

        // Timeout after 5 minutes
        timeoutHandle = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            window.removeEventListener('message', messageHandler);
            window.removeEventListener('focus', handleWindowFocus);
            cleanup();
            reject(new Error('OAuth flow timed out'));
          }
        }, 300000);

        // If window fails to open
        if (!authWindow) {
          if (!isResolved) {
            isResolved = true;
            window.removeEventListener('message', messageHandler);
            window.removeEventListener('focus', handleWindowFocus);
            cleanup();
            reject(new Error('Failed to open OAuth window'));
          }
        }
      });
    } catch (error) {
      console.error('Google OAuth initiation failed:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(authCode: string): Promise<GoogleTokens> {
    if (this.useMockData) {
      return this.getMockTokens();
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    
    console.log('OAuth tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    });
    
    // Store tokens in localStorage
    localStorage.setItem('google_access_token', tokens.access_token);
    
    if (tokens.refresh_token) {
      localStorage.setItem('google_refresh_token', tokens.refresh_token);
      console.log('Refresh token stored successfully');
    } else {
      console.warn('No refresh token received - user may need to re-authenticate more frequently');
    }

    // Store expiration time (default 1 hour if not provided)
    const expiresIn = tokens.expires_in || 3600; // Default to 1 hour
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem('google_token_expires_at', expiresAt.toString());
    
    console.log('Token will expire at:', new Date(expiresAt).toISOString());

    return tokens;
  }

  /**
   * Get Search Console properties for authenticated user
   */
  async getSearchConsoleProperties(): Promise<SearchConsoleProperty[]> {
    if (this.useMockData) {
      return this.getMockProperties();
    }

    // Ensure we have a valid token before making API calls
    await this.ensureValidToken();

    const accessToken = this.getStoredAccessToken();
    if (!accessToken) {
      const error = 'No access token available. Please authenticate with Google first.';
      console.error(error);
      throw new Error(error);
    }

    try {
      console.log('Fetching Google Search Console properties...');
      
      const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GSC API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          // Try to refresh token
          try {
            console.log('Attempting to refresh access token...');
            await this.refreshAccessToken();
            
            // Retry the request with new token
            const newToken = this.getStoredAccessToken();
            if (newToken) {
              const retryResponse = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData.siteEntry || [];
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // Token refresh failed, clear tokens and require re-auth
          this.signOut();
          throw new Error('Access token expired and refresh failed. Please re-authenticate with Google.');
        }
        
        throw new Error(`GSC API Error (${response.status}): ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('GSC Properties Response:', data);
      
      return data.siteEntry || [];
    } catch (error) {
      console.error('Error fetching GSC properties:', error);
      throw error;
    }
  }

  /**
   * Find matching Search Console property for a domain
   */
  async findPropertyForDomain(domain: string): Promise<string | null> {
    try {
      // Ensure we have a valid token before making API calls
      await this.ensureValidToken();
      
      const properties = await this.getSearchConsoleProperties();
      
      // Try to find exact match first
      let match = properties.find(prop => {
        const propUrl = new URL(prop.siteUrl);
        return propUrl.hostname === domain || propUrl.hostname === `www.${domain}`;
      });

      // If no exact match, try with different protocols
      if (!match) {
        const variations = [
          `https://${domain}/`,
          `https://www.${domain}/`,
          `http://${domain}/`,
          `http://www.${domain}/`,
          `sc-domain:${domain}`
        ];

        match = properties.find(prop => 
          variations.some(variation => prop.siteUrl === variation)
        );
      }

      return match ? match.siteUrl : null;
    } catch (error) {
      console.error('Error finding Search Console property:', error);
      return null;
    }
  }

  /**
   * Validate if a GSC property format will return data
   */
  async validatePropertyFormat(propertyUrl: string): Promise<boolean> {
    try {
      await this.ensureValidToken();
      
      console.log('Validating GSC property format:', propertyUrl);
      
      // Try a simple query to see if property returns data
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getStoredAccessToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: '2025-07-10', // Recent date
            endDate: '2025-07-14',
            dimensions: ['query'],
            rowLimit: 1
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const hasData = data.rows && data.rows.length > 0;
        console.log('Property validation result:', { propertyUrl, hasData, responseType: data.responseAggregationType });
        return hasData;
      }
      
      return false;
    } catch (error) {
      console.warn('Property validation failed:', propertyUrl, error);
      return false;
    }
  }

  /**
   * Detect and normalize GSC property format
   * Returns the best-matching property format for a given domain
   */
  async detectPrimaryProperty(domain: string): Promise<{
    primaryProperty: string | null;
    allMatches: SearchConsoleProperty[];
    recommendedFormat: 'domain' | 'url' | 'sc-domain';
    validatedProperty?: string;
  }> {
    try {
      // Ensure we have a valid token before making API calls
      await this.ensureValidToken();
      
      const properties = await this.getSearchConsoleProperties();
      
      // Clean domain input
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
      
      // Find all matching properties for this domain
      const allMatches = properties.filter(prop => {
        const siteUrl = prop.siteUrl.toLowerCase();
        
        // Check for domain-based matches
        if (siteUrl.includes(cleanDomain.toLowerCase())) {
          return true;
        }
        
        // Check for www variant matches
        if (siteUrl.includes(`www.${cleanDomain.toLowerCase()}`)) {
          return true;
        }
        
        return false;
      });
      
      if (allMatches.length === 0) {
        return {
          primaryProperty: null,
          allMatches: [],
          recommendedFormat: 'domain'
        };
      }
      
      // Prioritize property types by data completeness
      // 1. sc-domain (usually has the most complete data)
      // 2. https://domain/ (verified site)
      // 3. https://www.domain/ (www variant)
      // 4. http://domain/ (less secure)
      
      let primaryProperty: SearchConsoleProperty | null = null;
      let recommendedFormat: 'domain' | 'url' | 'sc-domain' = 'domain';
      
      // Check for sc-domain first (most comprehensive)
      const scDomainProperty = allMatches.find(prop => 
        prop.siteUrl.startsWith('sc-domain:')
      );
      
      if (scDomainProperty) {
        primaryProperty = scDomainProperty;
        recommendedFormat = 'sc-domain';
      } else {
        // Check for HTTPS properties next
        const httpsProperty = allMatches.find(prop => 
          prop.siteUrl.startsWith('https://') && 
          !prop.siteUrl.includes('www.')
        );
        
        if (httpsProperty) {
          primaryProperty = httpsProperty;
          recommendedFormat = 'url';
        } else {
          // Check for HTTPS www variant
          const httpsWwwProperty = allMatches.find(prop => 
            prop.siteUrl.startsWith('https://www.')
          );
          
          if (httpsWwwProperty) {
            primaryProperty = httpsWwwProperty;
            recommendedFormat = 'url';
          } else {
            // Fallback to any available property
            primaryProperty = allMatches[0];
            recommendedFormat = primaryProperty.siteUrl.startsWith('sc-domain:') ? 'sc-domain' : 'url';
          }
        }
      }
      
      console.log('GSC Property Detection Results:', {
        domain: cleanDomain,
        totalMatches: allMatches.length,
        primaryProperty: primaryProperty?.siteUrl,
        recommendedFormat,
        allProperties: allMatches.map(p => p.siteUrl)
      });
      
      // Validate the selected property to ensure it returns data
      let validatedProperty: string | undefined;
      if (primaryProperty) {
        console.log('Validating selected property for data availability...');
        const isValid = await this.validatePropertyFormat(primaryProperty.siteUrl);
        
        if (isValid) {
          validatedProperty = primaryProperty.siteUrl;
          console.log('Selected property validated successfully:', validatedProperty);
        } else {
          // Try other matching properties if primary doesn't have data
          console.log('Primary property has no data, trying alternative formats...');
          
          for (const property of allMatches) {
            if (property.siteUrl !== primaryProperty.siteUrl) {
              const isValid = await this.validatePropertyFormat(property.siteUrl);
              if (isValid) {
                validatedProperty = property.siteUrl;
                console.log('Found alternative property with data:', validatedProperty);
                break;
              }
            }
          }
          
          if (!validatedProperty) {
            console.warn('No matching properties have data available');
            validatedProperty = primaryProperty.siteUrl; // Use original as fallback
          }
        }
      }
      
      return {
        primaryProperty: validatedProperty || primaryProperty?.siteUrl || null,
        allMatches,
        recommendedFormat,
        validatedProperty
      };
      
    } catch (error) {
      console.error('Error detecting GSC property format:', error);
      return {
        primaryProperty: null,
        allMatches: [],
        recommendedFormat: 'domain',
        validatedProperty: undefined
      };
    }
  }

  /**
   * Get keyword performance data from Google Search Console
   */
  async getSearchConsoleKeywords(
    siteUrl?: string, 
    startDate?: string, 
    endDate?: string,
    rowLimit: number = 25
  ): Promise<GSCKeywordData[]> {
    if (this.useMockData) {
      return this.getMockGSCKeywords();
    }

    // Ensure we have a valid token before making API calls
    await this.ensureValidToken();

    const accessToken = this.getStoredAccessToken();
    if (!accessToken) {
      throw new Error('No access token available. Please authenticate with Google first.');
    }

    // If no siteUrl provided, get the first available property
    if (!siteUrl) {
      const properties = await this.getSearchConsoleProperties();
      if (properties.length === 0) {
        throw new Error('No Search Console properties found for this account.');
      }
      siteUrl = properties[0].siteUrl;
    }

    // Default date range: last 12 months (365 days)
    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 365);
      
      endDate = end.toISOString().split('T')[0];
      startDate = start.toISOString().split('T')[0];
    }

    try {
      console.log('Fetching GSC keyword data...', { siteUrl, startDate, endDate });
      
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions: ['query'],
            rowLimit,
            startRow: 0
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GSC Search Analytics API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          // Try to refresh token
          try {
            console.log('Attempting to refresh access token for GSC Search Analytics...');
            await this.refreshAccessToken();
            
            // Retry the request with new token
            const newToken = this.getStoredAccessToken();
            if (newToken) {
              const retryResponse = await fetch(
                `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    rowLimit,
                    startRow: 0
                  }),
                }
              );
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                // Transform GSC data to our format
                return (retryData.rows || []).map((row: any) => ({
                  keyword: row.keys[0],
                  clicks: Math.round(row.clicks || 0),
                  impressions: Math.round(row.impressions || 0),
                  ctr: Math.round((row.ctr || 0) * 100 * 100) / 100, // Convert to percentage with 2 decimals
                  position: Math.round((row.position || 0) * 10) / 10, // Round to 1 decimal
                  source: 'gsc' as const,
                  intent: this.determineSearchIntent(row.keys[0])
                }));
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed for GSC Search Analytics:', refreshError);
          }
          
          // Token refresh failed, clear tokens and require re-auth
          this.signOut();
          throw new Error('Access token expired and refresh failed. Please re-authenticate with Google.');
        }
        
        throw new Error(`GSC Search Analytics API Error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log('GSC Search Analytics Response:', data);
      
      // Transform GSC data to our format
      return (data.rows || []).map((row: any) => ({
        keyword: row.keys[0],
        clicks: Math.round(row.clicks || 0),
        impressions: Math.round(row.impressions || 0),
        ctr: Math.round((row.ctr || 0) * 100 * 100) / 100, // Convert to percentage with 2 decimals
        position: Math.round((row.position || 0) * 10) / 10, // Round to 1 decimal
        source: 'gsc' as const,
        intent: this.determineSearchIntent(row.keys[0])
      }));
      
    } catch (error) {
      console.error('Error fetching GSC keyword data:', error);
      throw error;
    }
  }

  /**
   * Determine search intent based on keyword patterns
   */
  private determineSearchIntent(keyword: string): 'informational' | 'navigational' | 'transactional' | 'commercial' {
    const lowerKeyword = keyword.toLowerCase();
    
    // Transactional keywords
    if (/\b(buy|purchase|order|checkout|cart|price|cost|shop|store)\b/.test(lowerKeyword)) {
      return 'transactional';
    }
    
    // Commercial keywords
    if (/\b(best|top|review|compare|vs|versus|alternative|cheap|deal|discount)\b/.test(lowerKeyword)) {
      return 'commercial';
    }
    
    // Navigational keywords
    if (/\b(login|sign in|contact|about|home|website|official|app)\b/.test(lowerKeyword)) {
      return 'navigational';
    }
    
    // Default to informational
    return 'informational';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (this.useMockData) {
      return localStorage.getItem('mock_google_auth') === 'true';
    }
    
    const token = this.getStoredAccessToken();
    if (!token) return false;
    
    // Check if token is expired
    const expiresAt = localStorage.getItem('google_token_expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      // Token expired, but we might be able to refresh if we have a refresh token
      const hasRefreshToken = !!localStorage.getItem('google_refresh_token');
      if (hasRefreshToken) {
        console.log('Access token expired, but refresh token available');
        return true; // Still consider authenticated if we have a refresh token
      } else {
        console.log('Access token expired and no refresh token available');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get authentication status details
   */
  getAuthenticationStatus(): {
    isAuthenticated: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenExpired: boolean;
    expiresAt: Date | null;
    timeUntilExpiry: number | null;
  } {
    const accessToken = this.getStoredAccessToken();
    const refreshToken = localStorage.getItem('google_refresh_token');
    const expiresAtStr = localStorage.getItem('google_token_expires_at');
    
    const expiresAt = expiresAtStr ? new Date(parseInt(expiresAtStr)) : null;
    const tokenExpired = expiresAt ? Date.now() > expiresAt.getTime() : false;
    const timeUntilExpiry = expiresAt ? expiresAt.getTime() - Date.now() : null;
    
    return {
      isAuthenticated: this.isAuthenticated(),
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      tokenExpired,
      expiresAt,
      timeUntilExpiry
    };
  }

  /**
   * Check if token is expiring soon (within 5 minutes)
   */
  private isTokenExpiring(): boolean {
    const expiresAt = localStorage.getItem('google_token_expires_at');
    if (!expiresAt) return true; // No expiry info, assume expiring
    
    const expirationTime = parseInt(expiresAt);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const isExpiring = Date.now() > (expirationTime - fiveMinutes);
    
    if (isExpiring) {
      console.log('Token expiring soon, will refresh proactively');
    }
    
    return isExpiring;
  }

  /**
   * Ensure we have a valid, non-expiring token
   */
  private async ensureValidToken(): Promise<void> {
    const hasRefreshToken = !!localStorage.getItem('google_refresh_token');
    
    if (!hasRefreshToken) {
      throw new Error('No refresh token available. Please re-authenticate with Google.');
    }

    if (this.isTokenExpiring()) {
      console.log('Proactively refreshing token before API call');
      await this.refreshAccessToken();
    }
  }

  /**
   * Sign out and clear tokens
   */
  signOut(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expires_at');
    localStorage.removeItem('mock_google_auth');
  }

  /**
   * Get stored access token
   */
  private getStoredAccessToken(): string | null {
    return localStorage.getItem('google_access_token');
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    const refreshToken = localStorage.getItem('google_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('Refreshing Google access token...');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to refresh access token: ${response.status} ${response.statusText}`);
    }

    const tokens = await response.json();
    console.log('Token refresh successful');
    
    localStorage.setItem('google_access_token', tokens.access_token);
    
    // Update expiration time if provided
    if (tokens.expires_in) {
      const expiresAt = Date.now() + (tokens.expires_in * 1000);
      localStorage.setItem('google_token_expires_at', expiresAt.toString());
    }
  }

  /**
   * Mock authentication for development
   */
  private handleMockAuth(): void {
    localStorage.setItem('mock_google_auth', 'true');
    // Set mock token expiration
    const expiresAt = Date.now() + (3600 * 1000); // 1 hour
    localStorage.setItem('google_token_expires_at', expiresAt.toString());
  }

  /**
   * Get mock tokens for development
   */
  private getMockTokens(): GoogleTokens {
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: this.config.scopes.join(' ')
    };
  }

  /**
   * Get mock Search Console properties for development
   */
  private getMockProperties(): SearchConsoleProperty[] {
    return [
      {
        siteUrl: 'https://example.com/',
        permissionLevel: 'siteOwner',
        verified: true
      },
      {
        siteUrl: 'https://www.example.com/',
        permissionLevel: 'siteOwner',
        verified: true
      },
      {
        siteUrl: 'sc-domain:example.com',
        permissionLevel: 'siteOwner',
        verified: true
      },
      {
        siteUrl: 'https://demo-site.com/',
        permissionLevel: 'siteFullUser',
        verified: true
      }
    ];
  }

  /**
   * Get mock GSC keyword data for development
   */
  private getMockGSCKeywords(): GSCKeywordData[] {
    return [
      {
        keyword: 'digital marketing services',
        clicks: 245,
        impressions: 3420,
        ctr: 7.16,
        position: 4.2,
        source: 'gsc',
        intent: 'commercial'
      },
      {
        keyword: 'seo optimization tips',
        clicks: 189,
        impressions: 2890,
        ctr: 6.54,
        position: 3.8,
        source: 'gsc',
        intent: 'informational'
      },
      {
        keyword: 'content marketing strategy',
        clicks: 156,
        impressions: 2240,
        ctr: 6.96,
        position: 5.1,
        source: 'gsc',
        intent: 'informational'
      },
      {
        keyword: 'best marketing tools',
        clicks: 134,
        impressions: 1890,
        ctr: 7.09,
        position: 4.6,
        source: 'gsc',
        intent: 'commercial'
      },
      {
        keyword: 'social media management',
        clicks: 98,
        impressions: 1560,
        ctr: 6.28,
        position: 6.2,
        source: 'gsc',
        intent: 'commercial'
      },
      {
        keyword: 'how to improve website ranking',
        clicks: 87,
        impressions: 1340,
        ctr: 6.49,
        position: 5.8,
        source: 'gsc',
        intent: 'informational'
      },
      {
        keyword: 'google ads management',
        clicks: 76,
        impressions: 1120,
        ctr: 6.79,
        position: 4.9,
        source: 'gsc',
        intent: 'commercial'
      },
      {
        keyword: 'email marketing automation',
        clicks: 65,
        impressions: 980,
        ctr: 6.63,
        position: 5.4,
        source: 'gsc',
        intent: 'commercial'
      }
    ];
  }
}

export default new GoogleOAuthService();