// types/defaultStates.ts

import { TxValidationState, VoteTransactionDetails, VoteValidationState } from "./types";

export const defaultTxValidationState: TxValidationState = {
  isPartOfSigners: false,
  hasNoCertificates: false,
  isSameNetwork: false,
  isInOutputPlutusData: false,
  isUnsignedTransaction: false,
};

export const defaultVoteValidationState: VoteValidationState = {
    isMetadataAnchorValid: false,
    hasICCCredentials: false,
  };
  
export const defaultVoteTransactionDetails: VoteTransactionDetails = {
  govActionID: "",
  voteChoice: "",
  explorerLink: "",
  metadataAnchorURL: "",
  metadataAnchorHash: "",
  resetAckState: true,
};


