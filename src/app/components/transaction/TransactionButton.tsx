"use client";

import { Container, Box, Paper, Typography } from "@mui/material";
import { useTransaction } from "../../hooks/useTransaction";
import { TransactionInput } from "./TransactionInput";
import { TransactionValidation } from "./TransactionValidation";
import { VoteDetails } from "./VoteDetails";
import { TransactionJSON } from "./TransactionJSON";
import { SignatureSection } from "./SignatureSection";
import { HierarchyDetails } from "./hierarchyDetails";

export const TransactionButton = () => {
  const {
    stakeCredentialHash,
    message,
    unsignedTransactionHex,
    unsignedTransaction,
    signature,
    acknowledgedTxs,
    isVoteTransaction,
    txValidationState,
    voteTransactionDetails,
    voteValidationState,
    connected,
    setUnsignedTransactionHex,
    setSignature,
    setMessage,
    resetAllStates,
    resetAllDetailsState,
    resetAllValidationState,
    handleAcknowledgeChange,
  } = useTransaction();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Transaction Input Section */}
      <TransactionInput
        unsignedTransactionHex={unsignedTransactionHex}
        setUnsignedTransactionHex={setUnsignedTransactionHex}
        setMessage={setMessage}
        resetAllValidationState={resetAllValidationState}
        resetAllDetailsState={resetAllDetailsState}
        setSignature={setSignature}
      />

      {/* Validation and Details Sections */}
      {unsignedTransaction && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Transaction Validation Section */}
          <TransactionValidation
            txValidationState={txValidationState}
            isVoteTransaction={isVoteTransaction}
            voteValidationState={voteValidationState}
          />

          {/* Vote Details Section */}
          <VoteDetails
            isVoteTransaction={isVoteTransaction}
            voteTransactionDetails={voteTransactionDetails}
            connected={connected}
            acknowledgedTxs={acknowledgedTxs}
            onAcknowledgeChange={handleAcknowledgeChange}
          />

          {/* Hierarchy Details Section */}
          {!isVoteTransaction && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Hierarchy Details
              </Typography>
              <HierarchyDetails
                onAcknowledgeChange={(checked) => {
                  // Create a synthetic event-like object
                  const syntheticEvent = { target: { checked } } as React.ChangeEvent<HTMLInputElement>;
                  handleAcknowledgeChange(syntheticEvent);
                }}
              />
            </Paper>
          )}

          {/* Transaction JSON View */}
          <TransactionJSON
            unsignedTransaction={unsignedTransaction}
            unsignedTransactionHex={unsignedTransactionHex}
            setMessage={setMessage}
          />
        </Box>
      )}

      {/* Signature Section */}
      <SignatureSection
        wallet={null} // This will be passed from the parent
        unsignedTransactionHex={unsignedTransactionHex}
        isVoteTransaction={isVoteTransaction}
        txValidationState={txValidationState}
        voteValidationState={voteValidationState}
        acknowledgedTx={acknowledgedTxs}
        connected={connected}
        govActionIDs={voteTransactionDetails.map((detail) => detail.govActionID)}
        stakeCredentialHash={stakeCredentialHash}
        setMessage={setMessage}
        setSignature={setSignature}
        signature={signature}
        voteTransactionDetails={voteTransactionDetails}
      />

      {/* Error Message Display */}
      {message && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mt: 3, 
            borderRadius: 2,
            backgroundColor: "#ffebee",
            borderLeft: "4px solid #f44336"
          }}
        >
          <Typography color="error">
            {message}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
