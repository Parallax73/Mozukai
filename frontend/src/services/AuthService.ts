import axios from 'axios';

let accessToken: string | null = null;
const listeners: ((token: string | null) => void)[] = [];

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
    return accessToken !== null;
  },

  async tryRefreshToken(): Promise<boolean> {
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
    } catch (e) { /* empty */ }
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