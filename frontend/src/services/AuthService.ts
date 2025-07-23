import axios from 'axios';

let accessToken: string | null = null;
let accessTokenExpiry: number | null = null; // Unix timestamp in seconds
const listeners: ((token: string | null) => void)[] = [];

function decodeJwt(token: string): { exp?: number } {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

const AuthService = {
  subscribe(listener: (token: string | null) => void) {
    listeners.push(listener);
    listener(accessToken);
  },

  unsubscribe(listener: (token: string | null) => void) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  },

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

  getAccessToken(): string | null {
    return accessToken;
  },

  removeAccessToken() {
    AuthService.setAccessToken(null);
  },

  isAuthenticated(): boolean {
    return accessToken !== null && (!accessTokenExpiry || Date.now() / 1000 < accessTokenExpiry);
  },

  async tryRefreshToken(): Promise<boolean> {
    if (accessToken && accessTokenExpiry && Date.now() / 1000 < accessTokenExpiry - 60) {
      return true;
    }
    try {
      const response = await axios.post("http://localhost:8000/refresh", null, {
        withCredentials: true,
      });
      const token = response.data.access_token;
      if (token) {
        AuthService.setAccessToken(token);
        return true;
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) { /* ignore */ }
    AuthService.removeAccessToken();
    return false;
  },

  async logout() {
    await axios.post("http://localhost:8000/logout", {}, {
      withCredentials: true,
    });
    AuthService.removeAccessToken();
  }
};

export default AuthService;