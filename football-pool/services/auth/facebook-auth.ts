import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';

// Completes the WebBrowser session
WebBrowser.maybeCompleteAuthSession();

// Facebook App ID - This should be configured in your Facebook Developer Console
export const FACEBOOK_APP_ID = '764260709993014';

export const useFacebookAuth = () => {
  // Use Facebook's native redirect scheme (works with HTTPS enforcement)
  const redirectUri = `fb${FACEBOOK_APP_ID}://authorize`;
  
  // Debug: Log the redirect URI to verify it matches Facebook config
  console.log('📱 Facebook Redirect URI:', redirectUri);
  console.log('🔑 Facebook App ID:', FACEBOOK_APP_ID);
  
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: redirectUri,
    scopes: ['public_profile', 'email'], // Request email permission
  });

  return { request, response, promptAsync };
};

export const getFacebookUserData = async (token: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.type(large)`
    );
    return await response.json();
  } catch (error) {
    console.warn('Error fetching Facebook user data:', error);
    throw error;
  }
};

