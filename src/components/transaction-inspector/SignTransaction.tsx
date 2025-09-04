"use client";

import { useState } from "react";
import { 
  Button, 
  Box, 
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { signTransaction, validateWitness } from "../../utils/cardano";
import { TxValidationState, VoteValidationState } from "../../types/types";
import { IWallet } from "@meshsdk/core";

interface SignTransactionButtonProps {
  wallet: IWallet; 
  unsignedTransactionHex: string;
  isVoteTransaction: boolean;
  txValidationState: TxValidationState;
  voteValidationState: VoteValidationState[];
  acknowledgedTx: boolean;
  connected: boolean;
  govActionIDs: string[];
  stakeCredentialHash: string;
  setMessage: (msg: string) => void;
  setSignature: (sig: string) => void;
}

const SignTransactionButton: React.FC<SignTransactionButtonProps> = ({
  wallet,
  unsignedTransactionHex,
  isVoteTransaction,
  txValidationState,
  voteValidationState,
  acknowledgedTx,
  connected,
  govActionIDs,
  stakeCredentialHash,
  setMessage,
  setSignature,
}) => {
  const [loading, setLoading] = useState(false);
  console.log("acknowledged transaction state:", acknowledgedTx);
  const theme = useTheme();
  
  const signTransactionWrapper = async () => {
    try {
      setLoading(true);
      const txValidationAllState = Object.values(txValidationState).every(Boolean);
      const voteValidationAllState = voteValidationState.flatMap(Object.values).every(Boolean);

      if (!txValidationAllState) {
        throw new Error("Ensure all transaction validations are successful before proceeding.");
      }

      if (!voteValidationAllState && isVoteTransaction) {
        throw new Error("Ensure all vote validations are successful before proceeding.");
      }

      const {signedTransactionObj , witnessHex} = await signTransaction(wallet, unsignedTransactionHex);
      await validateWitness(signedTransactionObj, wallet, unsignedTransactionHex);
      setSignature(witnessHex);
      setMessage("Transaction signed successfully!");
    } catch (error) {
      console.error("Error signing transaction:", error);
      setMessage("Transaction signing failed. " + error);
    } finally {
      setLoading(false);
    }
  };

  const canSign = acknowledgedTx && connected && 
    Object.values(txValidationState).every(Boolean) && 
    (isVoteTransaction ? voteValidationState.flatMap(Object.values).every(Boolean) : true);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Simple Error Message */}
      {!canSign && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2,
            borderRadius: 2
          }}
        >
          {!connected && "Please connect a wallet to be able to sign"}
          {connected && !acknowledgedTx && "Please acknowledge the transaction details."}
          {connected && acknowledgedTx && "Please resolve all validation issues."}
        </Alert>
      )}

      {/* Sign Transaction Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center'
      }}>
        <Button
          id="sign-transaction"
          variant="contained"
          disabled={!canSign || loading}
          onClick={signTransactionWrapper}
          sx={{
            background: canSign 
              ? 'linear-gradient(135deg, #1976d2, #2196f3)'
              : 'linear-gradient(135deg, #9e9e9e, #bdbdbd)',
            color: 'white',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            minHeight: 48,
            boxShadow: canSign 
              ? '0 4px 12px rgba(25, 118, 210, 0.3)'
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: canSign 
                ? 'linear-gradient(135deg, #1565c0, #1976d2)'
                : 'linear-gradient(135deg, #9e9e9e, #bdbdbd)',
              boxShadow: canSign 
                ? '0 6px 16px rgba(25, 118, 210, 0.4)'
                : '0 2px 4px rgba(0, 0, 0, 0.1)',
              transform: canSign ? 'translateY(-1px)' : 'none'
            }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              Signing...
            </Box>
          ) : (
            'Sign Transaction'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default SignTransactionButton;
