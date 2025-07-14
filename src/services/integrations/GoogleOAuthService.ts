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
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
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
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'OAUTH_SUCCESS') {
            console.log('OAuth completed successfully');
            window.removeEventListener('message', messageHandler);
            resolve();
          } else if (event.data.type === 'OAUTH_ERROR') {
            console.error('OAuth error:', event.data.error);
            window.removeEventListener('message', messageHandler);
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageHandler);

        // Fallback: check if window is closed (user cancelled)
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('OAuth flow was cancelled'));
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!authWindow.closed) {
            authWindow.close();
          }
          reject(new Error('OAuth flow timed out'));
        }, 300000);
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
    
    // Store tokens in localStorage
    localStorage.setItem('google_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('google_refresh_token', tokens.refresh_token);
    }

    return tokens;
  }

  /**
   * Get Search Console properties for authenticated user
   */
  async getSearchConsoleProperties(): Promise<SearchConsoleProperty[]> {
    if (this.useMockData) {
      return this.getMockProperties();
    }

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
          // Token expired, clear it
          this.signOut();
          throw new Error('Access token expired. Please re-authenticate with Google.');
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

    // Default date range: last 90 days
    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 90);
      
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
          this.signOut();
          throw new Error('Access token expired. Please re-authenticate with Google.');
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
      // Token expired, clear it
      this.signOut();
      return false;
    }
    
    return true;
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
      throw new Error('Failed to refresh access token');
    }

    const tokens = await response.json();
    localStorage.setItem('google_access_token', tokens.access_token);
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