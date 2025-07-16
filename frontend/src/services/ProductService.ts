/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from '../models/Product';

const API_BASE_URL = 'http://localhost:8000';

export const ProductService = {
  getAllProducts: async (type?: 'bonsai' | 'pot' | 'accessory' | 'tools' | 'supply'): Promise<Product[]> => {
    try {
      const url = type ? `${API_BASE_URL}/products?type=${type}` : `${API_BASE_URL}/products`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item: any) =>
        new Product(item.id, item.name, item.price, item.description, item.sourceImage, item.sourceModel, item.type)
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return new Product(data.id, data.name, data.price, data.description, data.sourceImage, data.sourceModel, data.type);
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },
};