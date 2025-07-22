import type { Product } from "../models/Product";
import AuthService from "./AuthService";
import axios from 'axios';

const CartService = {
  baseUrl: 'http://localhost:8000',

  async getProductsCart(): Promise<Product[]> {
    let token = AuthService.getAccessToken();
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) {
        token = AuthService.getAccessToken();
      }
    }

    if (token && AuthService.isAuthenticated()) {
     const url = `${this.baseUrl}/cart/products`;
     const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
      return response.data as Product[];
    }

    return [];
  }
};

export default CartService;