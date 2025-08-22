import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignTransactionButton from '../../components/signTransactionButton';
import { TxValidationState, VoteValidationState } from '../../components/types/types';
import { IWallet } from '@meshsdk/core';

// Mock the txUtils module - fix the path
jest.mock('../../utils/txUtils', () => ({
  signTransaction: jest.fn(),
  validateWitness: jest.fn(),
}));

const mockSignTransaction = jest.requireMock('../../utils/txUtils').signTransaction;
const mockValidateWitness = jest.requireMock('../../utils/txUtils').validateWitness;

describe('SignTransactionButton Component', () => {
  const mockWallet: IWallet = {
    getNetworkId: jest.fn(),
    getUsedAddresses: jest.fn(),
    getUnusedAddresses: jest.fn(),
    getChangeAddress: jest.fn(),
    getRewardAddresses: jest.fn(),
    signTx: jest.fn(),
    signData: jest.fn(),
    submitTx: jest.fn(),
    getCollateral: jest.fn(),
    experimental: {
      getCollateral: jest.fn()
    }
  } as unknown as IWallet;

  const mockTxValidationState: TxValidationState = {
    isPartOfSigners: true,
    hasNoCertificates: true,
    isSameNetwork: true,
    isInOutputPlutusData: true,
    isUnsignedTransaction: true,
  };

  // Fixed VoteValidationState to match the actual interface
  const mockVoteValidationState: VoteValidationState[] = [
    {
      isMetadataAnchorValid: true,
      hasICCCredentials: true,
    }
  ];

  const defaultProps = {
    wallet: mockWallet,
    unsignedTransactionHex: '84a400818258201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00',
    isVoteTransaction: true,
    txValidationState: mockTxValidationState,
    voteValidationState: mockVoteValidationState,
    acknowledgedTx: true,
    connected: true,
    govActionIDs: ['gov_action_123'],
    stakeCredentialHash: 'stake_hash_123',
    setMessage: jest.fn(),
    setSignature: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignTransaction.mockResolvedValue({
      signedTransactionObj: {},
      witnessHex: 'mock_witness_hex'
    });
    mockValidateWitness.mockResolvedValue(undefined);
  });

  describe('Button States', () => {
    it('renders sign transaction button when all conditions are met', () => {
      render(<SignTransactionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /sign transaction/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('disables button when wallet is not connected', () => {
      render(
        <SignTransactionButton 
          {...defaultProps} 
          connected={false} 
        />
      );

      const button = screen.getByRole('button', { name: /sign transaction/i });
      expect(button).toBeDisabled();
    });

    it('disables button when transaction is not acknowledged', () => {
      render(
        <SignTransactionButton 
          {...defaultProps} 
          acknowledgedTx={false} 
        />
      );

      const button = screen.getByRole('button', { name: /sign transaction/i });
      expect(button).toBeDisabled();
    });

    it('shows loading state when signing', async () => {
      mockSignTransaction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          signedTransactionObj: {},
          witnessHex: 'mock_witness_hex'
        }), 100))
      );

      render(<SignTransactionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /sign transaction/i });
      fireEvent.click(button);

      expect(screen.getByText('Signing...')).toBeInTheDocument();
      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText('Signing...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Warning Messages', () => {
    it('shows acknowledgment warning when transaction is not acknowledged', () => {
      render(
        <SignTransactionButton 
          {...defaultProps} 
          acknowledgedTx={false} 
        />
      );

      expect(screen.getByText('Please acknowledge the transaction details.')).toBeInTheDocument();
    });

    it('does not show acknowledgment warning when transaction is acknowledged', () => {
      render(<SignTransactionButton {...defaultProps} />);

      expect(screen.queryByText('Please acknowledge the transaction details.')).not.toBeInTheDocument();
    });

    it('shows wallet connection warning when wallet is not connected', () => {
      render(
        <SignTransactionButton 
          {...defaultProps} 
          connected={false} 
        />
      );

      expect(screen.getByText('Please connect a wallet to be able to sign')).toBeInTheDocument();
    });

    it('does not show wallet connection warning when wallet is connected', () => {
      render(<SignTransactionButton {...defaultProps} />);

      expect(screen.queryByText('Please connect a wallet to be able to sign')).not.toBeInTheDocument();
    });

    it('shows validation warning when there are validation issues', () => {
      const invalidTxValidationState: TxValidationState = {
        ...mockTxValidationState,
        isPartOfSigners: false,
      };

      render(
        <SignTransactionButton 
          {...defaultProps} 
          txValidationState={invalidTxValidationState}
        />
      );

      expect(screen.getByText('Please resolve all validation issues.')).toBeInTheDocument();
    });
  });

  describe('Transaction Signing Logic', () => {
    it('calls signTransaction and validateWitness on successful sign', async () => {
      render(<SignTransactionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /sign transaction/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignTransaction).toHaveBeenCalledWith(
          mockWallet,
          defaultProps.unsignedTransactionHex
        );
        expect(mockValidateWitness).toHaveBeenCalledWith(
          {},
          mockWallet,
          defaultProps.unsignedTransactionHex
        );
      });

      expect(defaultProps.setSignature).toHaveBeenCalledWith('mock_witness_hex');
      expect(defaultProps.setMessage).toHaveBeenCalledWith('Transaction signed successfully!');
    });

    it('shows validation alert when transaction validation fails', () => {
      const invalidTxValidationState: TxValidationState = {
        ...mockTxValidationState,
        isPartOfSigners: false,
      };

      render(
        <SignTransactionButton 
          {...defaultProps} 
          txValidationState={invalidTxValidationState}
        />
      );

      // Should show validation alert
      expect(screen.getByText('Please resolve all validation issues.')).toBeInTheDocument();
      
      // Button should be disabled
      const button = screen.getByRole('button', { name: /sign transaction/i });
      expect(button).toBeDisabled();
    });

    it('shows validation alert when vote validation fails for vote transactions', () => {
      const invalidVoteValidationState: VoteValidationState[] = [
        {
          isMetadataAnchorValid: false,
          hasICCCredentials: true,
        }
      ];

      render(
        <SignTransactionButton 
          {...defaultProps} 
          voteValidationState={invalidVoteValidationState}
        />
      );

      // Should show validation alert
      expect(screen.getByText('Please resolve all validation issues.')).toBeInTheDocument();
      
      // Button should be disabled
      const button = screen.getByRole('button', { name: /sign transaction/i });
      expect(button).toBeDisabled();
    });

    it('skips vote validation for non-vote transactions', async () => {
      const invalidVoteValidationState: VoteValidationState[] = [
        {
          isMetadataAnchorValid: false,
          hasICCCredentials: false,
        }
      ];

      render(
        <SignTransactionButton 
          {...defaultProps} 
          isVoteTransaction={false}
          voteValidationState={invalidVoteValidationState}
        />
      );

      const button = screen.getByRole('button', { name: /sign transaction/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignTransaction).toHaveBeenCalled();
      });

      expect(defaultProps.setMessage).toHaveBeenCalledWith('Transaction signed successfully!');
    });

    it('handles signing errors', async () => {
      const errorMessage = 'Signing failed';
      mockSignTransaction.mockRejectedValue(new Error(errorMessage));

      render(<SignTransactionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /sign transaction/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(defaultProps.setMessage).toHaveBeenCalledWith(
          expect.stringContaining('Transaction signing failed')
        );
      });
    });

    it('handles validation errors', async () => {
      const errorMessage = 'Validation failed';
      mockValidateWitness.mockRejectedValue(new Error(errorMessage));

      render(<SignTransactionButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /sign transaction/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(defaultProps.setMessage).toHaveBeenCalledWith(
          expect.stringContaining('Transaction signing failed')
        );
      });
    });
  });

  describe('Multiple Vote Validations', () => {
    it('handles multiple vote validation states correctly', async () => {
      const multipleVoteValidations: VoteValidationState[] = [
        { isMetadataAnchorValid: true, hasICCCredentials: true },
        { isMetadataAnchorValid: true, hasICCCredentials: true },
      ];

      render(
        <SignTransactionButton 
          {...defaultProps} 
          voteValidationState={multipleVoteValidations}
        />
      );

      const button = screen.getByRole('button', { name: /sign transaction/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignTransaction).toHaveBeenCalled();
      });
    });

    it('shows validation alert when any vote validation is false', () => {
      const multipleVoteValidations: VoteValidationState[] = [
        { isMetadataAnchorValid: true, hasICCCredentials: true },
        { isMetadataAnchorValid: false, hasICCCredentials: true },
      ];

      render(
        <SignTransactionButton 
          {...defaultProps} 
          voteValidationState={multipleVoteValidations}
        />
      );

      // Should show validation alert
      expect(screen.getByText('Please resolve all validation issues.')).toBeInTheDocument();
      
      // Button should be disabled
      const button = screen.getByRole('button', { name: /sign transaction/i });
      expect(button).toBeDisabled();
    });
  });
});