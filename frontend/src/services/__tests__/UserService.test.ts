import axios from 'axios';
import UserService from '../UserService';
import AuthService from '../AuthService';

// Mock axios and AuthService for isolated testing
jest.mock('axios');
jest.mock('../AuthService');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserService', () => {
  // Clear mocks after each test to prevent state leaks
  afterEach(() => jest.clearAllMocks());

  it('registers a user', async () => {
    // Mock successful registration response
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    // Expect registration to resolve without errors and axios.post to be called correctly
    await expect(UserService.registerUser('test@example.com', 'password')).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/register'),
      { email: 'test@example.com', password: 'password' }
    );
  });

  it('logs in user and stores token', async () => {
    // Mock login response with access token
    const fakeToken = 'access-token-123';
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: fakeToken },
    });

    // Login user, verify token returned and stored via AuthService
    const result = await UserService.loginUser('test@example.com', 'password');
    expect(result).toBe(fakeToken);
    expect(AuthService.setAccessToken).toHaveBeenCalledWith(fakeToken);
  });

  it('refreshes access token', async () => {
    // Mock token refresh response
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: 'new-token' } });

    // Refresh token and verify new token returned and stored
    const result = await UserService.refreshAccessToken();
    expect(result).toBe('new-token');
    expect(AuthService.setAccessToken).toHaveBeenCalledWith('new-token');
  });

  it('logs out user and removes token', async () => {
    // Mock logout response
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    // Call logout and verify token removed via AuthService
    await UserService.logoutUser();
    expect(AuthService.removeAccessToken).toHaveBeenCalled();
  });
});
