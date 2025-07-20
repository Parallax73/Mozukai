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
  }
};

export default AuthService;
