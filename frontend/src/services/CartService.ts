import type { Product } from "../models/Product";
import AuthService from "./AuthService";
import axios from 'axios';

const CartService = {
    baseUrl: 'http://localhost:8000',

async getProductsCart(): Promise<Product[]> {
  try {
    const token = AuthService.getAccessToken();
    if (token != null && AuthService.isAuthenticated()) {
      const url = new URL(this.baseUrl + '/get_products/' + token);
      const response = await axios.get(url.toString());
      return response.data as Product[];
    }
    
    return [];
    
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`Error while fetching products ${err.response.status} ${err.response.statusText}`);
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Unknown error while loading products');
  }
}
}

export default CartService;