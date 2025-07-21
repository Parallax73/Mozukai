import axios from "axios";

const UserService = {
  baseUrl: 'http://localhost:8000',

  async registerUser(email: string, password: string) {
    const url = new URL(this.baseUrl + '/register');
    const data = {
      email,
      password
    };

    await axios.post(url.toString(), data);
  },

  async loginUser(email: string, password: string): Promise<string> {
    const url = new URL(this.baseUrl + '/login');
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(url.toString(), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });

    return response.data.access_token;
  },

  async refreshAccessToken(): Promise<string> {
    const url = new URL(this.baseUrl + '/refresh');
    const response = await axios.post(url.toString(), null, {
      withCredentials: true,
    });

    return response.data.access_token;
  },

  async logoutUser() {
    const url = new URL(this.baseUrl + '/logout');
    await axios.post(url.toString(), null, {
      withCredentials: true,
    });
  },
};

export default UserService;
