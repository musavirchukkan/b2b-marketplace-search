import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '/',
            query: {},
            asPath: '/',
            push: jest.fn(),
            pop: jest.fn(),
            reload: jest.fn(),
            back: jest.fn(),
            prefetch: jest.fn(),
            beforePopState: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn(),
            },
        };
    },
}));

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock fetch globally
global.fetch = jest.fn();

// Cleanup after each test
afterEach(() => {
    jest.clearAllMocks();
});