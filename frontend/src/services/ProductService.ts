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
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Error while fetching products ${response.status} ${response.statusText}`);
      }
      const data: Product[] = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unkown error while loading products');
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found.');
        }
        throw new Error(`Error while searching product: ${response.status} ${response.statusText}`);
      }
      const data: Product = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unkown error while searching products');
    }
  },
};

export default ProductService;
