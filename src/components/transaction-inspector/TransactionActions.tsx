// TransactionActions.tsx - Consolidated transaction actions components

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { VoteTransactionDetails } from "../../types/types";
import { TransactionProcessor } from "../../services/transactionProcessor";
import { TransactionSigner } from "../../services/transactionSigner";
import DownloadButton from "../shared/downloadFiles";
import SignTransactionButton from "./SignTransaction";
import txWitnessTemplate from "../../lib/templates/cardano-file-templates/txWitnessTemplate.json";

interface TransactionActionsProps {
  unsignedTransactionHex: string;
  isVoteTransaction: boolean;
  txValidationState: any;
  votingProcedureValidationState?: any;
  acknowledgedTx: boolean;
  connected: boolean;
  wallet: any;
  signature: string;
  voteDetails: VoteTransactionDetails[];
  stakeCredentialHash: string;
  onSign: (signature: string) => void;
  onMessageChange: (message: string) => void;
}

export const TransactionActions: React.FC<TransactionActionsProps> = ({
  unsignedTransactionHex,
  isVoteTransaction,
  txValidationState,
  votingProcedureValidationState,
  acknowledgedTx,
  connected,
  wallet,
  signature,
  voteDetails,
  stakeCredentialHash,
  onSign,
  onMessageChange
}) => {
  const copySignature = async () => {
    const success = await TransactionProcessor.copyToClipboard(signature);
    onMessageChange(success ? "Signature copied to clipboard!" : "Failed to copy signature");
  };

  const generateWitnessData = () => {
    const govId = voteDetails[0]?.govActionID;
    const filename = TransactionSigner.generateWitnessFilename(govId, stakeCredentialHash);
    const witnessData = TransactionSigner.generateWitnessTemplate(
      govId,
      stakeCredentialHash,
      signature,
      txWitnessTemplate
    );

    return {
      data: witnessData,
      filename,
      fileExtension: "witness"
    };
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Sign Transaction Section */}
      <SignTransactionButton
        wallet={wallet}
        unsignedTransactionHex={unsignedTransactionHex}
        isVoteTransaction={isVoteTransaction}
        txValidationState={txValidationState}
        votingProcedureValidationState={votingProcedureValidationState}
        acknowledgedTx={acknowledgedTx}
        connected={connected}
        setMessage={onMessageChange}
        setSignature={onSign}
      />

      {/* Signature Display */}
      {signature && (
        <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Signature
          </Typography>
          
          <Box
            sx={{
              backgroundColor: "#f8f9fa",
              p: 2,
              borderRadius: 1,
              cursor: "pointer",
              border: "1px solid",
              borderColor: "divider",
              '&:hover': {
                backgroundColor: "#f0f0f0"
              }
            }}
            onClick={copySignature}
          >
            <Typography component="pre" sx={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: "0.875rem"
            }}>
              {signature}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <DownloadButton {...generateWitnessData()} />
          </Box>
        </Paper>
      )}
    </Box>
  );
};
