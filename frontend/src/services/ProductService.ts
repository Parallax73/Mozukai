import axios from 'axios';
import { Product } from '../models/Product';

const ProductService = {
  baseUrl: 'http://localhost:8000',

  async getAllProducts(productType?: string, searchTerm?: string): Promise<Product[]> {
    const url = new URL(this.baseUrl + '/products');
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
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(`Error while fetching products ${err.response.status} ${err.response.statusText}`);
      }
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unkown error while loading products');
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${this.baseUrl}/products/${id}`);
      return response.data as Product;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          throw new Error('Product not found.');
        }
        throw new Error(`Error while searching product: ${err.response.status} ${err.response.statusText}`);
      }
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unkown error while searching products');
    }
  },
};

export default ProductService;
