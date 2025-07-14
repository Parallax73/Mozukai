/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from '../models/Product';

const API_BASE_URL = 'http://localhost:8000';

export const ProductService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item: any) =>
        new Product(item.id, item.name, item.price,item.description, item.sourceImage, item.sourceModel)
      );
    } catch (error) {
      console.error("Error fetching all products:", error);
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
      return new Product(data.id, data.name, data.price, data.description,data.sourceImage, data.sourceModel);
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },
};