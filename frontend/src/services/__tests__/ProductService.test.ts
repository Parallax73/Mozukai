import axios from 'axios';
import ProductService from '../ProductService';

// Mock axios for isolated unit tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProductService', () => {
  // Clear mocks after each test to avoid interference between tests
  afterEach(() => jest.clearAllMocks());

  it('fetches all products with filters', async () => {
    // Setup mock response for filtered product list
    const fakeProducts = [{ id: 1, name: 'Test Product' }];
    mockedAxios.get.mockResolvedValueOnce({ data: fakeProducts });

    // Call service and check that axios.get was called and data matches
    const result = await ProductService.getAllProducts('food', 'cat');
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(result).toEqual(fakeProducts);
  });

  it('fetches product by ID', async () => {
    // Setup mock response for single product fetch
    const fakeProduct = { id: 1, name: 'Test Product' };
    mockedAxios.get.mockResolvedValueOnce({ data: fakeProduct });

    // Call service and verify returned product matches mock
    const result = await ProductService.getProductById('1');
    expect(result).toEqual(fakeProduct);
  });

  it('throws error when product not found (404)', async () => {
    // Mock a 404 Not Found axios error response
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 404, statusText: 'Not Found' },
      isAxiosError: true,
    });

    // Expect the service to throw a specific error message on 404
    await expect(ProductService.getProductById('999')).rejects.toThrow('Product not found.');
  });

  it('throws error with status when other API error', async () => {
    // Mock a 500 Server Error axios response
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500, statusText: 'Server Error' },
      isAxiosError: true,
    });

    // Expect service to throw error including status code and text
    await expect(ProductService.getAllProducts()).rejects.toThrow('Error while fetching products 500 Server Error');
  });
});
