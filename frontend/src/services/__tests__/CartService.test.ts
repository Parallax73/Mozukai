import axios from 'axios';
import CartService from '../CartService';
import AuthService from '../AuthService';

// Mock axios and AuthService modules for isolated testing
jest.mock('axios');
jest.mock('../AuthService');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CartService', () => {
  // Reset mocks and set default AuthService mock behavior before each test
  beforeEach(() => {
    jest.resetAllMocks();
    (AuthService.getAccessToken as jest.Mock).mockReturnValue('fake-token');
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
  });

  it('fetches cart products if authenticated', async () => {
    // Mock successful API response returning products list
    mockedAxios.get.mockResolvedValue({
      data: [{ id: 1, name: 'Test Product' }],
    });

    // Call method and expect returned products to match mocked data
    const result = await CartService.getProductsCart();
    expect(result).toEqual([{ id: 1, name: 'Test Product' }]);
  });

  it('returns empty array if not authenticated', async () => {
    // Mock AuthService to simulate unauthenticated user
    (AuthService.getAccessToken as jest.Mock).mockReturnValue(null);
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

    // Call method and expect empty cart array returned
    const result = await CartService.getProductsCart();
    expect(result).toEqual([]);
  });

  it('throws if checkout URL is not received', async () => {
    // Mock checkout API response with missing url
    mockedAxios.post.mockResolvedValue({ data: {} });

    // Call initiateCheckout and expect it to throw specific error message
    await expect(
      CartService.initiateCheckout('card', [], 10)
    ).rejects.toThrow("URL de checkout não recebida");
  });
});
