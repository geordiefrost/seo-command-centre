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
   * Authenticate using client credentials for server-to-server access
   */
  async authenticateWithClientCredentials(): Promise<void> {
    if (this.useMockData) {
      this.handleMockAuth();
      return;
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Google OAuth client ID and secret not configured');
    }

    try {
      // For Search Console API, we'll use the client credentials flow
      // This generates an access token for server-to-server communication
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: this.config.scopes.join(' ')
        })
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Store the access token
      localStorage.setItem('google_access_token', tokenData.access_token);
      
      // Set expiration time
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);
      localStorage.setItem('google_token_expires_at', expiresAt.toString());
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw new Error('Failed to authenticate with Google API');
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

    // Ensure we have a valid token
    if (!this.isAuthenticated()) {
      await this.authenticateWithClientCredentials();
    }

    const accessToken = this.getStoredAccessToken();
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, re-authenticate and retry
        await this.authenticateWithClientCredentials();
        return this.getSearchConsoleProperties(); // Retry
      }
      throw new Error(`Failed to fetch Search Console properties: ${response.statusText}`);
    }

    const data = await response.json();
    return data.siteEntry || [];
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
}

export default new GoogleOAuthService();