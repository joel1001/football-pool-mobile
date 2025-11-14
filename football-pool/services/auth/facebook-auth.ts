import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';

WebBrowser.maybeCompleteAuthSession();

export const FACEBOOK_APP_ID = '764260709993014';

export const useFacebookAuth = () => {
  const redirectUri = `fb${FACEBOOK_APP_ID}://authorize`;
    
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: redirectUri,
    scopes: ['public_profile', 'email'],
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

