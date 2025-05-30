"use client";

import { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import { signTransaction, validateWitness } from "../utils/txUtils";
import { TxValidationState, VoteValidationState } from "./types/types";
import { IWallet } from "@meshsdk/core";

interface SignTransactionButtonProps {
  wallet: IWallet; 
  unsignedTransactionHex: string;
  isVoteTransaction: boolean;
  txValidationState: TxValidationState;
  voteValidationState: VoteValidationState;
  acknowledgedTx: boolean;
  voteTransactionDetails: {
    govActionID: string;
  };
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
  voteTransactionDetails,
  stakeCredentialHash,
  setMessage,
  setSignature,
}) => {
  const [loading, setLoading] = useState(false);

  const signTransactionWrapper = async () => {
    try {
        setLoading(true);
        const txValidationAllState = Object.values(txValidationState).every(Boolean);
        const voteValidationAllState = Object.values(voteValidationState).every(Boolean);

        console.log("Transaction Validation State: ", txValidationState);
        console.log("Vote Validation State: ", voteValidationState);

        if (!txValidationAllState) {
        throw new Error("Ensure all transaction validations are successful before proceeding.");
        }

        if (!voteValidationAllState && isVoteTransaction) {
        throw new Error("Ensure all vote validations are successful before proceeding.");
        }

        const {signedTransactionObj , witnessHex} =await signTransaction(wallet, unsignedTransactionHex);
        await validateWitness(signedTransactionObj, wallet, unsignedTransactionHex);
        setSignature(witnessHex);
        setMessage("Transaction signed successfully!");
        console.log("Witness (hex): ", witnessHex);
    } catch (error) {
      console.error("Error signing transaction:", error);
      setMessage("Transaction signing failed. " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    alignItems: { xs: "center", sm: "flex-end" },
    justifyContent: "flex-end",
    mt: 3,
    gap: 1, // Adds spacing between elements
  }}
>
  {!acknowledgedTx && (
    <Typography color="error" sx={{ mt: 1, textAlign: { xs: "center", sm: "right" } }}>
      ⚠️ You must acknowledge the transaction details before signing!
    </Typography>
  )}
  <Button
    id="sign-transaction"
    variant="contained"
    color="success"
    disabled={!acknowledgedTx || loading}
    onClick={signTransactionWrapper}
    sx={{
      whiteSpace: "nowrap",
      px: 3,
      width: { xs: "100%", sm: "auto" }, // Full width on mobile
    }}
  >
    {loading ? (
      "Signing..."
    ) : (
      <label>
        Sign <wbr /> Transaction
      </label>
    )}
  </Button>
</Box>

  );
};

export default SignTransactionButton;
