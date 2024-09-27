import axios from 'axios';
import axiosInstance from '../../utils/axiosConfig';

jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('axiosInstance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('adds Authorization header when token is present in localStorage', async () => {
    // Mock localStorage to return a token
    localStorage.setItem('token', 'my-secret-token');

    // Mock the axios request function
    axios.create.mockReturnValue({
      interceptors: {
        request: {
          use: (onSuccess) => {
            const config = { headers: {} };
            const modifiedConfig = onSuccess(config); // Call the interceptor function
            expect(modifiedConfig.headers.Authorization).toBe('Token my-secret-token');
          },
        },
      },
    });

    // Trigger the interceptor
    axiosInstance.get('/some-endpoint');

    // Verify that axios was called
    expect(axios.create).toHaveBeenCalled();
  });

  it('does not add Authorization header when no token is present in localStorage', async () => {
    // Mock axios.create to test the interceptor
    axios.create.mockReturnValue({
      interceptors: {
        request: {
          use: (onSuccess) => {
            const config = { headers: {} };
            const modifiedConfig = onSuccess(config); // Call the interceptor function
            expect(modifiedConfig.headers.Authorization).toBeUndefined();
          },
        },
      },
    });

    // Trigger the interceptor
    axiosInstance.get('/some-endpoint');

    // Verify that axios was called
    expect(axios.create).toHaveBeenCalled();
  });
});
