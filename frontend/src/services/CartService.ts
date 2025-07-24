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
  },

  async removeProductFromCart(productId: number): Promise<void> {
    let token = AuthService.getAccessToken();
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) {
        token = AuthService.getAccessToken();
      }
    }

    if (!token || !AuthService.isAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }

    const url = `${this.baseUrl}/cart/remove/${productId}`;
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  },

  async initiateCheckout(method: 'card' | 'boleto', products: Product[], total: number): Promise<string> {
  let token = AuthService.getAccessToken();
  if (!token) {
    const refreshed = await AuthService.tryRefreshToken();
    if (refreshed) {
      token = AuthService.getAccessToken();
    }
  }

  if (!token || !AuthService.isAuthenticated()) {
    throw new Error("Usuário não autenticado");
  }

  const response = await axios.post(
    `${this.baseUrl}/create-checkout-session`,
    {
      product_name: `Compra de ${products.length} item(ns)`,
      amount: total,
      payment_method: method,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );

  const url = response.data?.url;
  if (!url) throw new Error("URL de checkout não recebida");

  return url;
},

};


export default CartService;
