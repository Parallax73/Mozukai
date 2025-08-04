import axios from 'axios';
import type { Purchase } from '../models/Purchase';

const backendURL = import.meta.env.VITE_BACKEND_URL;

// Interface for count responses
interface CountResponse {
  count: number;
}

const DashboardService = {
  /**
   * Creates a new purchase with optional status and date.
   *
   * @param purchaseData The data to create the purchase (excluding id, status/date optional)
   * @returns The created Purchase object
   * @throws Error if creation fails
   */
  async createPurchase(
    purchaseData: Omit<Purchase, 'id' | 'date' | 'status'> & { status?: Purchase['status'], date?: Date }
  ): Promise<Purchase> {
    const url = new URL(backendURL + '/create-purchase');
    try {
      const response = await axios.post<Purchase>(url.toString(), purchaseData);
      return response.data;
    } catch (error) {
      throw formatAxiosError(error, 'Failed to create purchase');
    }
  },

  /**
   * Retrieves a list of purchases with optional filters.
   *
   * @param status Optional purchase status to filter
   * @param sort_date Order by date ('asc' or 'desc')
   * @param skip Number of purchases to skip
   * @param limit Maximum number of purchases to return
   * @returns Array of Purchase objects
   * @throws Error if fetching fails
   */
  async getPurchases(
    status?: Purchase['status'],
    sort_date: 'asc' | 'desc' = 'desc',
    skip = 0,
    limit = 100
  ): Promise<Purchase[]> {
    const url = new URL(backendURL + '/get-purchases');
    if (status) url.searchParams.append('status', status);
    url.searchParams.append('sort_date', sort_date);
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());

    try {
      const response = await axios.get<Purchase[]>(url.toString());
      return response.data;
    } catch (error) {
      throw formatAxiosError(error, 'Failed to get purchases');
    }
  },

  /**
   * Fetches a purchase by its ID.
   *
   * @param purchase_id ID of the purchase to retrieve
   * @returns The Purchase object
   * @throws Error if purchase not found or request fails
   */
  async getPurchaseById(purchase_id: number): Promise<Purchase> {
    const url = new URL(`${backendURL}/get-purchase/${purchase_id}`);
    try {
      const response = await axios.get<Purchase>(url.toString());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Purchase not found');
      }
      throw formatAxiosError(error, 'Failed to get purchase');
    }
  },

  /**
   * Fetches a purchase by the associated product ID.
   *
   * @param product_id Product ID associated with the purchase
   * @returns The Purchase object
   * @throws Error if not found or request fails
   */
  async getPurchaseByProductId(product_id: number): Promise<Purchase> {
    const url = new URL(`${backendURL}/get-purchase-by-product/${product_id}`);
    try {
      const response = await axios.get<Purchase>(url.toString());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`No purchase found for product ${product_id}`);
      }
      throw formatAxiosError(error, 'Failed to get purchase for product');
    }
  },

  /**
   * Retrieves the total number of users.
   * Falls back to alternative methods if the main endpoint fails.
   *
   * @returns User count (or 0 if all methods fail)
   */
  async getUserCount(): Promise<number> {
    try {
      const url = new URL(backendURL + '/users/count');
      const response = await axios.get<CountResponse>(url.toString());
      return response.data.count;
    } catch {
      console.warn('User count failed, using fallback');
      try {
        return await this.getUserCountFallback();
      } catch {
        console.warn('User count fallback failed, returning 0');
        return 0;
      }
    }
  },

  /**
   * Retrieves the total number of products.
   * Falls back to alternative methods if the main endpoint fails.
   *
   * @returns Product count (or 0 if all methods fail)
   */
  async getProductCount(): Promise<number> {
    try {
      const url = new URL(backendURL + '/products/count');
      const response = await axios.get<CountResponse>(url.toString());
      return response.data.count;
    } catch {
      console.warn('Product count endpoint failed, trying fallback');
      try {
        return await this.getProductCountFallback();
      } catch {
        console.warn('Product count fallback failed, returning 0');
        return 0;
      }
    }
  },

  /**
   * Retrieves the total number of purchases.
   * Falls back to alternative methods if the main endpoint fails.
   *
   * @returns Purchase count (or 0 if all methods fail)
   */
  async getPurchaseCount(): Promise<number> {
    try {
      const url = new URL(backendURL + '/purchase/count');
      const response = await axios.get<CountResponse>(url.toString());
      return response.data.count;
    } catch {
      console.warn('Purchase count endpoint failed, trying fallback');
      try {
        return await this.getPurchaseCountFallback();
      } catch {
        console.warn('Purchase count fallback failed, returning 0');
        return 0;
      }
    }
  },

  /**
   * Attempts to fetch user count from alternative endpoints.
   *
   * @returns User count or 0 if no fallback succeeds
   */
  async getUserCountFallback(): Promise<number> {
    const possibleEndpoints = ['/users', '/get-users'];
    for (const endpoint of possibleEndpoints) {
      try {
        const url = new URL(backendURL + endpoint);
        const response = await axios.get(url.toString());
        if (Array.isArray(response.data)) return response.data.length;
        if (response.data.users && Array.isArray(response.data.users)) {
          return response.data.users.length;
        }
      } catch {
        continue;
      }
    }
    return 0;
  },

  /**
   * Attempts to fetch product count from alternative endpoints.
   *
   * @returns Product count or 0 if no fallback succeeds
   */
  async getProductCountFallback(): Promise<number> {
    const possibleEndpoints = ['/products', '/get-products'];
    for (const endpoint of possibleEndpoints) {
      try {
        const url = new URL(backendURL + endpoint);
        const response = await axios.get(url.toString());
        if (Array.isArray(response.data)) return response.data.length;
        if (response.data.products && Array.isArray(response.data.products)) {
          return response.data.products.length;
        }
      } catch {
        continue;
      }
    }
    return 0;
  },

  /**
   * Attempts to get the number of purchases by fetching all of them.
   *
   * @returns Purchase count or 0 if the request fails
   */
  async getPurchaseCountFallback(): Promise<number> {
    try {
      const purchases = await this.getPurchases(undefined, 'desc', 0, 1000);
      return purchases.length;
    } catch {
      return 0;
    }
  }
};

/**
 * Helper function to format Axios errors with a readable message.
 *
 * @param error The error object caught
 * @param fallbackMessage Default message if no detail is available
 * @returns A formatted Error object
 */
function formatAxiosError(error: unknown, fallbackMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as any)?.detail;
    return new Error(detail || error.message || fallbackMessage);
  }
  return new Error(fallbackMessage);
}

export default DashboardService;
