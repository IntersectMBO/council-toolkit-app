import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the components
jest.mock('../components/wallet', () => ({
  Wallet: () => <div data-testid="wallet">Mock Wallet</div>
}));

jest.mock('../components/transaction', () => ({
  TransactionButton: () => <div data-testid="transaction-button">Mock Transaction Button</div>
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
    return <img src={src} alt={alt} {...props} data-testid="next-image" />
  }
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders main components', () => {
    render(<Home />);
    
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