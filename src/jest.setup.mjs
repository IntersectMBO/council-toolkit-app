import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Next.js Request and Headers
global.Request = class {
  constructor(input, init) {
    return { input, init };
  }
};

global.Headers = class {
  constructor(init) {
    return { ...init };
  }
};

// Mock Next.js server components and APIs
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
    redirect: jest.fn(),
  },
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Map()),
  cookies: jest.fn(() => new Map()),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt || ''} {...props} data-testid="next-image" />;
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Suppress console errors/warnings in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}; 