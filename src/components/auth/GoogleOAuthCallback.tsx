import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleOAuthService from '../../services/integrations/GoogleOAuthService';

export const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        
        // Get the authorization code from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('OAuth callback params:', { code: !!code, state, error });

        if (error) {
          console.error('OAuth error:', error);
          // Close popup and notify parent of error
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'OAUTH_ERROR', 
              error: error 
            }, window.location.origin);
            window.close();
          } else {
            navigate('/');
          }
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'OAUTH_ERROR', 
              error: 'No authorization code received' 
            }, window.location.origin);
            window.close();
          } else {
            navigate('/');
          }
          return;
        }

        // Exchange code for tokens
        const tokens = await GoogleOAuthService.handleCallback(code);
        console.log('OAuth tokens received:', { 
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token 
        });

        // Close popup and notify parent of success
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_SUCCESS', 
            tokens: tokens 
          }, window.location.origin);
          window.close();
        } else {
          // If not in popup, redirect to main app
          navigate('/');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_ERROR', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }, window.location.origin);
          window.close();
        } else {
          navigate('/');
        }
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Google authentication...</p>
      </div>
    </div>
  );
};