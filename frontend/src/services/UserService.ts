import axios from "axios";
import AuthService from "./AuthService";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserService = {
  

  /**
   * Registers a new user with email and password.
   * 
   * @param email User's email address
   * @param password User's password
   */
  async registerUser(email: string, password: string) {
    const url = new URL(backendURL + '/register');
    const data = { email, password };
    await axios.post(url.toString(), data);
  },

  /**
   * Logs in a user with email and password.
   * Supports optional "remember me" to issue longer refresh token.
   * Saves the access token via AuthService.
   * 
   * @param email User's email address
   * @param password User's password
   * @param rememberMe Optional flag to enable long refresh token (default false)
   * @returns The access token string
   */
  async loginUser(email: string, password: string, rememberMe = false): Promise<string> {
    const url = new URL(backendURL + '/login');
    if (rememberMe) url.searchParams.set("rememberMe", "true");

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(url.toString(), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true, 
    });

    // Save the access token in AuthService for future requests
    AuthService.setAccessToken(response.data.access_token);
    return response.data.access_token;
  },

  /**
   * Refreshes the access token using the refresh token stored in cookies.
   * Updates AuthService with new access token.
   * 
   * @returns The new access token string
   */
  async refreshAccessToken(): Promise<string> {
    const url = new URL(backendURL + '/refresh');
    const response = await axios.post(url.toString(), null, {
      withCredentials: true,
    });

    AuthService.setAccessToken(response.data.access_token);
    return response.data.access_token;
  },

  /**
   * Logs out the current user by calling backend logout and removing token locally.
   */
  async logoutUser() {
    const url = new URL(backendURL + '/logout');
    await axios.post(url.toString(), null, {
      withCredentials: true,
    });

    // Clear local access token
    AuthService.removeAccessToken();
  },
};

export default UserService;
