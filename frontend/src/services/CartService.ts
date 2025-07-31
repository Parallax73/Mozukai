import type { Product } from "../models/Product";
import AuthService from "./AuthService";
import axios from 'axios';
const backendURL = import.meta.env.VITE_BACKEND_URL;

const CartService = {
  

  /**
   * Retrieves the list of products in the user's cart.
   * Attempts to refresh the token if not available or expired.
   * 
   * @returns Array of Product objects currently in the cart, or empty array if unauthenticated.
   */
  async getProductsCart(): Promise<Product[]> {
    let token = AuthService.getAccessToken();

    // Attempt token refresh if no valid token present
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) {
        token = AuthService.getAccessToken();
      }
    }

    // Fetch cart products if authenticated
    if (token && AuthService.isAuthenticated()) {
      const url = `${backendURL}/cart/products`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      return response.data as Product[];
    }

    // Return empty array if not authenticated
    return [];
  },

  /**
   * Removes a product from the user's cart by product ID.
   * Requires valid authentication.
   * 
   * @param productId ID of the product to remove
   * @throws Error if user is not authenticated
   */
  async removeProductFromCart(productId: number): Promise<void> {
    let token = AuthService.getAccessToken();

    // Attempt token refresh if no valid token present
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) {
        token = AuthService.getAccessToken();
      }
    }

    // Reject if user not authenticated
    if (!token || !AuthService.isAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }

    // Call backend to remove product from cart
    const url = `${backendURL}/cart/remove/${productId}`;
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  },

  /**
   * Initiates a checkout session for the products in the cart.
   * Requires valid authentication and sends payment method, products count, and total amount.
   * 
   * @param method Payment method: 'card' or 'boleto'
   * @param products Array of products to purchase
   * @param total Total amount for the purchase
   * @returns URL string for the checkout page to redirect the user
   * @throws Error if user is not authenticated or URL is missing in response
   */
  async initiateCheckout(method: 'card' | 'boleto', products: Product[], total: number): Promise<string> {
    let token = AuthService.getAccessToken();

    // Attempt token refresh if no valid token present
    if (!token) {
      const refreshed = await AuthService.tryRefreshToken();
      if (refreshed) {
        token = AuthService.getAccessToken();
      }
    }

    // Reject if user not authenticated
    if (!token || !AuthService.isAuthenticated()) {
      throw new Error("Usuário não autenticado");
    }

    // Create checkout session on backend
    const response = await axios.post(
      `${backendURL}/create-checkout-session`,
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
