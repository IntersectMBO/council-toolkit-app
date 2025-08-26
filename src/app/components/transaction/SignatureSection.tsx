"use client";

import { Box, Typography, Paper } from "@mui/material";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { VoteTransactionDetails } from "../types/types";
import SignTransactionButton from "./signTransactionButton";
import DownloadButton from "../common/downloadFiles";

interface SignatureSectionProps {
  wallet: any;
  unsignedTransactionHex: string;
  isVoteTransaction: boolean;
  txValidationState: any;
  voteValidationState: any[];
  acknowledgedTx: boolean;
  connected: boolean;
  govActionIDs: string[];
  stakeCredentialHash: string;
  setMessage: (message: string) => void;
  setSignature: (signature: string) => void;
  signature: string;
  voteTransactionDetails: VoteTransactionDetails[];
}

export const SignatureSection = ({
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
  signature,
  voteTransactionDetails,
}: SignatureSectionProps) => {
  const handleCopySignature = () => {
    navigator.clipboard.writeText(signature);
    setMessage("Signature copied to clipboard!");
  };

  return (
    <>
      {/* Sign Transaction Section */}
      <Box sx={{ mt: 4 }}>
        <SignTransactionButton 
          {...{ 
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
            setSignature 
          }} 
        />
      </Box>

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
            onClick={handleCopySignature}
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
            <DownloadButton 
              signature={signature} 
              govActionID={voteTransactionDetails.map((detail: VoteTransactionDetails) => detail.govActionID)[0]} 
              voterKeyHash={stakeCredentialHash} 
            />
          </Box>
        </Paper>
      )}
    </>
  );
};
