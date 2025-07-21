const AuthService = {
  accessToken: null as string | null,

  setAccessToken(token: string) {
    this.accessToken = token;
  },

  getAccessToken(): string | null {
    return this.accessToken;
  },

  removeAccessToken() {
    this.accessToken = null;
  },

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  },

  async tryRefreshToken(): Promise<boolean> {
    try {
      const token = await import('./UserService').then(m => m.default.refreshAccessToken());
      if (token) {
        this.setAccessToken(token);
        return true;
      }
    } catch {
      // refresh failed
    }
    return false;
  }
};

export default AuthService;
