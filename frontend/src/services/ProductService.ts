import axios from 'axios';
import { Product } from '../models/Product';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const ProductService = {
  

  /**
   * Fetches a list of products from the backend API.
   * Supports optional filtering by product type and search term.
   * 
   * @param productType Optional string to filter products by type
   * @param searchTerm Optional string to search products by name
   * @returns Promise resolving to an array of Product objects
   * @throws Error with descriptive message if fetching fails
   */
  async getAllProducts(productType?: string, searchTerm?: string): Promise<Product[]> {
    const url = new URL(backendURL + '/products');

    // Add query parameters if provided
    if (productType) {
      url.searchParams.append('type', productType);
    }
    if (searchTerm) {
      url.searchParams.append('name', searchTerm);
    }

    try {
      const response = await axios.get(url.toString());
      return response.data as Product[];
    } catch (err) {
      // Handle axios errors with response details
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(`Error while fetching products ${err.response.status} ${err.response.statusText}`);
      }
      // Rethrow known Error instances
      if (err instanceof Error) {
        throw err;
      }
      // Throw generic error if unknown issue occurs
      throw new Error('Unknown error while loading products');
    }
  },

  /**
   * Fetches a single product by its ID.
   * 
   * @param id Product ID as string
   * @returns Promise resolving to the Product object
   * @throws Error with descriptive message if product not found or fetching fails
   */
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${backendURL}/products/${id}`);
      return response.data as Product;
    } catch (err) {
      // Handle 404 not found with specific message
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          throw new Error('Product not found.');
        }
        throw new Error(`Error while searching product: ${err.response.status} ${err.response.statusText}`);
      }
      // Rethrow known Error instances
      if (err instanceof Error) {
        throw err;
      }
      // Throw generic error if unknown issue occurs
      throw new Error('Unknown error while searching products');
    }
  },
};

export default ProductService;
