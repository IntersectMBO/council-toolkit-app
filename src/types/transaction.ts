// transaction.ts - Enhanced transaction-related types

import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { TxValidationState, VoteTransactionDetails, VotingProcedureValidationState } from "./types";

export interface TransactionState {
  unsignedTransaction: CSL.Transaction | null;
  transactionHash: string;
  isVoteTransaction: boolean;
  voteDetails: VoteTransactionDetails[];
  signature: string;
  unsignedTransactionHex: string;
}

export interface ValidationState {
  txValidation: TxValidationState;
  voteValidation?: VotingProcedureValidationState;
  hierarchyValidation?: HierarchyValidationState;
  isAllValid: boolean;
}

export interface UIState {
  message: string;
  loading: boolean;
  acknowledgedTxs: boolean;
}

export interface ParsedTransaction {
  unsignedTransaction: CSL.Transaction;
  transactionHash: string;
  transactionBody: any;
  isVoteTransaction: boolean;
  voteDetails?: VoteTransactionDetails[];
  voteValidation?: VotingProcedureValidationState;
}

export interface HierarchyValidationState {
  isAcknowledged: boolean;
}

export interface TransactionProcessorResult {
  success: boolean;
  data?: ParsedTransaction;
  error?: string;
}

export interface ValidationResult {
  txValidation: TxValidationState;
  voteValidation?: VotingProcedureValidationState;
  hierarchyValidation?: HierarchyValidationState;
  isAllValid: boolean;
}

export interface TransactionInspectorProps {
  pendingTransactionHex?: string | null;
  resetPendingTransaction: () => void;
}

export interface TransactionInputFormProps {
  onTransactionProcess: (hex: string) => void;
  pendingTransactionHex?: string | null;
  resetPendingTransaction: () => void;
  message: string;
  onMessageChange: (message: string) => void;
}

export interface ValidationSectionProps {
  validation: ValidationState;
  isVoteTransaction: boolean;
}

export interface DetailsSectionProps {
  transaction: TransactionState;
  validation: ValidationState;
  isVoteTransaction: boolean;
  connected: boolean;
  onAcknowledgeChange: (checked: boolean) => void;
}

export interface ActionsSectionProps {
  transaction: TransactionState;
  validation: ValidationState;
  connected: boolean;
  wallet: any;
  onSign: (signature: string) => void;
  onMessageChange: (message: string) => void;
}
