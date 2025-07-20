import axios from "axios";

const UserService = {
  baseUrl: 'http://localhost:8000',

  async registerUser(email: string, password: string){
      const url = new URL(this.baseUrl + '/register');
      const data = {
        'email' : email,
        'password' : password
      };

      try {
        await axios.post(url.toString(), data);
      } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unknown error');
    }
  },

  async loginUser(email: string, password: string): Promise<string> {
    const url = new URL(this.baseUrl + '/login');
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await axios.post(url.toString(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, 
      });

      return response.data.access_token;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unknown error');
    }
  },

  async logoutUser() {
    const url = new URL(this.baseUrl + '/logout');
    try {
      await axios.post(url.toString(), null, {
        withCredentials: true,
      });
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unknown error');
    }
  },
};

export default UserService;
