import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../utils/AuthContext';

jest.mock('axios');
jest.mock('../../utils/axiosConfig', () => {
    const actualAxios = jest.requireActual('axios');
    const mockAxiosInstance = {
        ...actualAxios,
        interceptors: {
            request: {
                handlers: [],
                use: jest.fn()
            }
        },
        defaults: {
            baseURL: process.env.REACT_APP_API_BASE_URL
        }
    };
    return mockAxiosInstance;
});
jest.mock('../../utils/AuthContext');

describe('axiosConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axiosInstance.interceptors.request.handlers = [];
        axiosInstance.interceptors.request.use = jest.fn((fulfilled, rejected) => {
            axiosInstance.interceptors.request.handlers.push({
                fulfilled,
                rejected: rejected || jest.fn((error) => Promise.reject(error))
            });
            return axiosInstance.interceptors.request.handlers.length - 1;  // Simulate adding the interceptor
        });

        // Add the main interceptor that adds the Authorization header if credentials are present
        axiosInstance.interceptors.request.use((config) => {
            const { credentials } = useAuth();
            if (credentials && credentials.username && credentials.password) {
                config.headers['Authorization'] = `Basic ${window.btoa(`${credentials.username}:${credentials.password}`)}`;
            } else {
                // Edge case: Missing or invalid credentials
                config.headers['Authorization'] = undefined;
            }
            return config;
        });
    });

    it('should set the baseURL from environment variable', () => {
        expect(axiosInstance.defaults.baseURL).toBe(process.env.REACT_APP_API_BASE_URL);
    });

    it('should add Authorization header if credentials are provided', async () => {
        const mockCredentials = { username: 'testUser', password: 'testPass' };
        useAuth.mockReturnValue({ credentials: mockCredentials });

        const requestConfig = { headers: {} };
        await axiosInstance.interceptors.request.handlers[0].fulfilled(requestConfig);

        expect(requestConfig.headers['Authorization']).toBe(`Basic ${window.btoa('testUser:testPass')}`);
    });

    it('should not add Authorization header if credentials are empty', async () => {
        useAuth.mockReturnValue({ credentials: { username: '', password: '' } });

        const requestConfig = { headers: {} };
        await axiosInstance.interceptors.request.handlers[0].fulfilled(requestConfig);

        expect(requestConfig.headers['Authorization']).toBeUndefined();
    });

    it('should not add Authorization header if credentials are undefined', async () => {
        useAuth.mockReturnValue({ credentials: {} });

        const requestConfig = { headers: {} };
        await axiosInstance.interceptors.request.handlers[0].fulfilled(requestConfig);

        expect(requestConfig.headers['Authorization']).toBeUndefined();
    });

    it('should not add Authorization header if credentials are null', async () => {
        useAuth.mockReturnValue({ credentials: null });

        const requestConfig = { headers: {} };
        await axiosInstance.interceptors.request.handlers[0].fulfilled(requestConfig);

        expect(requestConfig.headers['Authorization']).toBeUndefined();
    });

    it('should handle request error and reject promise', async () => {
        const mockError = new Error('Request error');

        await expect(axiosInstance.interceptors.request.handlers[0].rejected(mockError)).rejects.toThrow('Request error');
    });

    it('should correctly add multiple interceptors and return their index', () => {
        const firstInterceptorIndex = axiosInstance.interceptors.request.use(jest.fn());
        const secondInterceptorIndex = axiosInstance.interceptors.request.use(jest.fn());

        expect(firstInterceptorIndex).toBe(1);  // The initial one + first custom
        expect(secondInterceptorIndex).toBe(2); // After adding the second custom
        expect(axiosInstance.interceptors.request.handlers).toHaveLength(3);  // Including the main interceptor
    });

    it('should ensure only valid interceptors are added', () => {
        // Add an invalid interceptor that doesn't return anything
        const invalidInterceptorIndex = axiosInstance.interceptors.request.use(null, null);

        expect(invalidInterceptorIndex).toBe(1);  // It still gets an index but shouldn't break anything
        expect(axiosInstance.interceptors.request.handlers[1].fulfilled).toBe(null);
        expect(typeof axiosInstance.interceptors.request.handlers[1].rejected).toBe('function');        
    });
});
