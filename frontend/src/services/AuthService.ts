import axios from 'axios';

let accessToken: string | null = null;
let accessTokenExpiry: number | null = null; 
const listeners: ((token: string | null) => void)[] = [];
const backendURL = process.env.REACT_APP_BACKEND_URL;


/**
 * Decodes a JWT token payload safely.
 * 
 * @param token JWT token string
 * @returns Decoded payload as object, or empty object on error
 */
function decodeJwt(token: string): { exp?: number } {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return {};
  }
}

const AuthService = {
  /**
   * Subscribes a listener callback to token changes.
   * Immediately calls the listener with current token.
   * 
   * @param listener Callback receiving current token or null
   */
  subscribe(listener: (token: string | null) => void) {
    listeners.push(listener);
    listener(accessToken);
  },

  /**
   * Unsubscribes a previously registered listener.
   * 
   * @param listener Listener callback to remove
   */
  unsubscribe(listener: (token: string | null) => void) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  },

  /**
   * Updates the current access token and expiry.
   * Notifies all listeners of the new token.
   * 
   * @param token New JWT access token or null to clear
   */
  setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
      const decoded = decodeJwt(token);
      accessTokenExpiry = decoded.exp ?? null;
    } else {
      accessTokenExpiry = null;
    }
    for (const listener of listeners) {
      listener(token);
    }
  },

  /**
   * Retrieves the current access token.
   * 
   * @returns Current JWT token or null
   */
  getAccessToken(): string | null {
    return accessToken;
  },

  /**
   * Clears the current access token and notifies listeners.
   */
  removeAccessToken() {
    AuthService.setAccessToken(null);
  },

  /**
   * Checks if the current token is valid and not expired.
   * 
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return accessToken !== null && (!accessTokenExpiry || Date.now() / 1000 < accessTokenExpiry);
  },

  /**
   * Attempts to refresh the access token using the refresh endpoint.
   * If token is still valid for more than 60 seconds, skips refresh.
   * 
   * @returns True if token is valid or successfully refreshed, false otherwise
   */
  async tryRefreshToken(): Promise<boolean> {
    if (accessToken && accessTokenExpiry && Date.now() / 1000 < accessTokenExpiry - 60) {
      return true;
    }
    try {
      const response = await axios.post(backendURL+"/refresh", null, {
        withCredentials: true,
      });
      const token = response.data.access_token;
      if (token) {
        AuthService.setAccessToken(token);
        return true;
      }
    } catch (error) {
      // Log the error for debugging but continue to remove token
      console.error("Failed to refresh token:", error);
    }
    AuthService.removeAccessToken();
    return false;
  },

  /**
   * Logs out the user by calling the backend logout endpoint
   * and clearing the stored access token.
   */
  async logout() {
    try {
      await axios.post(backendURL+"/logout", {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout request failed:", error);
      // We still remove the token locally even if logout API fails
    }
    AuthService.removeAccessToken();
  }
};

export default AuthService;
