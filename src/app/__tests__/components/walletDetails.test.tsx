import { render, screen } from '@testing-library/react';
import { WalletDetails } from '../../components/walletDetails';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
    return <img src={src} alt={alt} {...props} data-testid="wallet-icon" />
  }
}));

describe('WalletDetails Component', () => {
  const defaultProps = {
    stakeCred: 'stake1u9abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    walletNetwork: 'Mainnet',
    walletIcon: '/images/wallet-icon.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render wallet icon when not provided', () => {
    render(
      <WalletDetails 
        {...defaultProps} 
        walletIcon={null} 
      />
    );

    expect(screen.queryByTestId('wallet-icon')).not.toBeInTheDocument();
  });

  it('handles all null/empty values correctly', () => {
    render(
      <WalletDetails 
        stakeCred={null}
        walletNetwork={null}
        walletIcon={null}
      />
    );

    const notAvailableElements = screen.getAllByText('Not Available');
    expect(notAvailableElements).toHaveLength(2); // Both fields should show "Not Available"
    expect(screen.queryByTestId('wallet-icon')).not.toBeInTheDocument();
  });
});