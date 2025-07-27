import axios from 'axios';
import AuthService from '../AuthService';

// Mock axios to control its behavior in tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  // Cleanup after each test to ensure test isolation
  afterEach(() => {
    AuthService.removeAccessToken(); // Clear token
    jest.clearAllMocks(); // Reset mocks
  });

  it('should set and get access token', () => {
    // Test setting and retrieving the access token
    AuthService.setAccessToken('abc123');
    expect(AuthService.getAccessToken()).toBe('abc123');
  });

  it('should remove access token', () => {
    // Test removing the access token
    AuthService.setAccessToken('abc123');
    AuthService.removeAccessToken();
    expect(AuthService.getAccessToken()).toBe(null);
  });

  it('should identify authenticated if token not expired', () => {
    // Create a token with expiration 60 seconds in the future
    const futureExp = Math.floor(Date.now() / 1000) + 60;
    const payload = { exp: futureExp };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    
    AuthService.setAccessToken(token);

    // Should be authenticated because token is not expired
    expect(AuthService.isAuthenticated()).toBe(true);
  });

  it('should refresh token successfully', async () => {
    // Mock successful refresh token API response
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'new-token' } });

    // Attempt to refresh token and verify it returns true
    const result = await AuthService.tryRefreshToken();

    expect(result).toBe(true);
    expect(AuthService.getAccessToken()).toBe('new-token');
  });

  it('should return false if refresh token fails', async () => {
    // Mock failed refresh token API response
    mockedAxios.post.mockRejectedValueOnce(new Error('fail'));

    // Attempt to refresh token and verify it returns false
    const result = await AuthService.tryRefreshToken();

    expect(result).toBe(false);
    expect(AuthService.getAccessToken()).toBe(null);
  });

  it('should logout and remove token', async () => {
    // Mock successful logout API response
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    AuthService.setAccessToken('abc123');
    await AuthService.logout();

    // After logout, access token should be removed
    expect(AuthService.getAccessToken()).toBe(null);
  });
});
