// TransactionInspector.tsx - Refactored main transaction inspector component with consolidated structure

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Box } from "@mui/material";
import { useWallet } from "@meshsdk/react";
import { useMember } from "../member-selector/memberSelector";
import { TransactionState, ValidationState, UIState } from "../../types/transaction";
import { TransactionProcessor } from "../../services/transactionProcessor";
import { ValidationService } from "../../services/validationService";
import { defaultTxValidationState, defaultVoteTransactionDetails, defaultVotingProcedureValidationState } from "../../types/defaultStates";

// Import consolidated components
import { TransactionInput } from "./TransactionInput";
import { TransactionValidation } from "./TransactionValidation";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionActions } from "./TransactionActions";

interface TransactionInspectorProps {
  pendingTransactionHex?: string | null;
  resetPendingTransaction: () => void;
}

// Initial state values
const initialTransactionState: TransactionState = {
  unsignedTransaction: null,
  transactionHash: "",
  isVoteTransaction: false,
  voteDetails: [defaultVoteTransactionDetails],
  signature: "",
  unsignedTransactionHex: ""
};

const initialValidationState: ValidationState = {
  txValidation: defaultTxValidationState,
  isAllValid: false
};

const initialUIState: UIState = {
  message: "",
  loading: false,
  acknowledgedTxs: false
};

export const TransactionInspector: React.FC<TransactionInspectorProps> = ({
  pendingTransactionHex,
  resetPendingTransaction
}) => {
  const { wallet, connected } = useWallet();
  const { selectedCCMember } = useMember();
  
  // State management
  const [transaction, setTransaction] = useState<TransactionState>(initialTransactionState);
  const [validation, setValidation] = useState<ValidationState>(initialValidationState);
  const [ui, setUI] = useState<UIState>(initialUIState);
  const [stakeCredentialHash, setStakeCredentialHash] = useState<string>("");

  // Reset functions
  const resetAllStates = useCallback(() => {
    setTransaction(initialTransactionState);
    setValidation(initialValidationState);
    setUI(initialUIState);
    setStakeCredentialHash("");
  }, []);

  const resetValidationState = useCallback(() => {
    setValidation(initialValidationState);
  }, []);

  const resetDetailsState = useCallback(() => {
    setTransaction(prev => ({
      ...prev,
      voteDetails: [defaultVoteTransactionDetails],
      transactionHash: "",
      signature: ""
    }));
  }, []);

  // Process transaction
  const processTransaction = useCallback(async (hex: string) => {
    try {
      setUI(prev => ({ ...prev, loading: true, message: "" }));
      
      // Parse transaction
      const parseResult = await TransactionProcessor.parseTransaction(hex);
      if (!parseResult.success || !parseResult.data) {
        throw new Error(parseResult.error || "Failed to parse transaction");
      }

      const parsedTransaction = parseResult.data;
      
      // Validate transaction
      const validationResult = await ValidationService.validateTransaction(
        parsedTransaction.transactionBody,
        parsedTransaction.unsignedTransaction,
        wallet,
        selectedCCMember
      );

      // Update state
      setTransaction({
        unsignedTransaction: parsedTransaction.unsignedTransaction,
        transactionHash: parsedTransaction.transactionHash,
        isVoteTransaction: parsedTransaction.isVoteTransaction,
        voteDetails: parsedTransaction.voteDetails || [defaultVoteTransactionDetails],
        signature: "",
        unsignedTransactionHex: hex
      });

      setValidation(validationResult);

      // Set stake credential hash if wallet is connected
      if (connected && wallet) {
        try {
          const changeAddress = await wallet.getChangeAddress();
          // Note: This is a simplified approach - in reality you'd need to deserialize the address
          setStakeCredentialHash(changeAddress || "");
        } catch (error) {
          console.error("Error getting stake credential:", error);
        }
      }

      setUI(prev => ({ ...prev, loading: false, message: "Transaction processed successfully!" }));
    } catch (error) {
      console.error("Error processing transaction:", error);
      setUI(prev => ({ 
        ...prev, 
        loading: false, 
        message: `Transaction processing failed: ${error}` 
      }));
      resetValidationState();
      resetDetailsState();
    }
  }, [wallet, selectedCCMember, connected, resetValidationState, resetDetailsState]);

  // Handle transaction signing
  const handleSign = useCallback(async (signature: string) => {
    setTransaction(prev => ({ ...prev, signature }));
  }, []);

  // Handle message changes
  const handleMessageChange = useCallback((message: string) => {
    setUI(prev => ({ ...prev, message }));
  }, []);

  // Handle acknowledgment changes
  const handleAcknowledgeChange = useCallback((checked: boolean) => {
    setUI(prev => ({ ...prev, acknowledgedTxs: checked }));
  }, []);

  // Reset states when wallet disconnects
  useEffect(() => {
    if (!connected) {
      resetAllStates();
    }
  }, [connected, resetAllStates]);

  // Auto-scroll to signature when it's generated
  useEffect(() => {
    if (transaction.signature || transaction.unsignedTransaction) {
      const signatureElement = document.getElementById("signature");
      const transactionElement = document.getElementById("sign-transaction");
      
      if (signatureElement) {
        signatureElement.scrollIntoView({ behavior: "smooth" });
      } else if (transactionElement) {
        transactionElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [transaction.signature, transaction.unsignedTransaction]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Transaction Input Section */}
      <TransactionInput
        onTransactionProcess={processTransaction}
        pendingTransactionHex={pendingTransactionHex}
        resetPendingTransaction={resetPendingTransaction}
        message={ui.message}
        onMessageChange={handleMessageChange}
        transactionHash={transaction.transactionHash}
      />

      {/* Validation and Details Sections */}
      {transaction.unsignedTransaction && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Transaction Validation */}
          <TransactionValidation
            txValidation={validation.txValidation}
            voteValidation={validation.voteValidation}
            hierarchyValidation={validation.hierarchyValidation}
            isVoteTransaction={transaction.isVoteTransaction}
          />

          {/* Transaction Details */}
          <TransactionDetails
            unsignedTransaction={transaction.unsignedTransaction}
            unsignedTransactionHex={transaction.unsignedTransactionHex}
            voteDetails={transaction.voteDetails}
            isVoteTransaction={transaction.isVoteTransaction}
            connected={connected}
            onAcknowledgeChange={handleAcknowledgeChange}
            onMessageChange={handleMessageChange}
          />

          {/* Transaction Actions */}
          <TransactionActions
            unsignedTransactionHex={transaction.unsignedTransactionHex}
            isVoteTransaction={transaction.isVoteTransaction}
            txValidationState={validation.txValidation}
            votingProcedureValidationState={validation.voteValidation}
            acknowledgedTx={ui.acknowledgedTxs}
            connected={connected}
            wallet={wallet}
            signature={transaction.signature}
            voteDetails={transaction.voteDetails}
            stakeCredentialHash={stakeCredentialHash}
            onSign={handleSign}
            onMessageChange={handleMessageChange}
          />
        </Box>
      )}
    </Container>
  );
};