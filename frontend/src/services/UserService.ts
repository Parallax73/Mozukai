import axios from "axios";
import AuthService from "./AuthService";

const UserService = {
  baseUrl: 'http://localhost:8000',

  async registerUser(email: string, password: string) {
    const url = new URL(this.baseUrl + '/register');
    const data = { email, password };
    await axios.post(url.toString(), data);
  },

  async loginUser(email: string, password: string, rememberMe = false): Promise<string> {
    const url = new URL(this.baseUrl + '/login');
    if (rememberMe) url.searchParams.set("rememberMe", "true");

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(url.toString(), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true, 
    });

    AuthService.setAccessToken(response.data.access_token);
    return response.data.access_token;
  },

  async refreshAccessToken(): Promise<string> {
    const url = new URL(this.baseUrl + '/refresh');
    const response = await axios.post(url.toString(), null, {
      withCredentials: true,
    });
    AuthService.setAccessToken(response.data.access_token);
    return response.data.access_token;
  },

  async logoutUser() {
    const url = new URL(this.baseUrl + '/logout');
    await axios.post(url.toString(), null, {
      withCredentials: true,
    });
    AuthService.removeAccessToken();
  },
};

export default UserService;