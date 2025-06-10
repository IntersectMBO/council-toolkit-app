import { render, screen, act } from '@testing-library/react';
import Home from '../page';

// Mock MeshProvider
jest.mock('../../providers/meshProvider', () => ({
  MeshProviderApp: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock the components
jest.mock('../components/wallet', () => ({
  __esModule: true,
  default: () => <div data-testid="wallet">Mock Wallet</div>
}));

jest.mock('../components/transaction', () => ({
  __esModule: true,
  TransactionButton: () => <div data-testid="transaction-button">Mock Transaction Button</div>
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
    return <img src={src} alt={alt} {...props} data-testid="next-image" />
  }
}));

// Test for the home page
describe('Home Page', () => {
  beforeEach(() => {
    // Clear any mocked function calls between tests
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<Home />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders main components', async () => {
    render(<Home />);
    
    // Fast-forward timers to complete loading
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // Check for wallet component
    expect(screen.getByTestId('wallet')).toBeInTheDocument();
    
    // Check for transaction button
    expect(screen.getByTestId('transaction-button')).toBeInTheDocument();
    
    // Check for tabs
    expect(screen.getByText('Transaction Inspector')).toBeInTheDocument();
    expect(screen.getByText('Live Actions')).toBeInTheDocument();
    expect(screen.getByText('Rationale Generator')).toBeInTheDocument();
    
    // Check for images
    const images = screen.getAllByTestId('next-image');
    expect(images).toHaveLength(2); // Logo and GitHub icon
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });
});