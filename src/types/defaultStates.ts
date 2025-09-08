// types/defaultStates.ts

import { TxValidationState, VoteTransactionDetails, VoteValidationState, VotingProcedureValidationState } from "./types";

export const defaultTxValidationState: TxValidationState = {
  isPartOfSigners: false,
  hasNoCertificates: false,
  isSameNetwork: false,
  isInOutputPlutusData: false,
  isUnsignedTransaction: false,
};

export const defaultVotingProcedureValidationState: VotingProcedureValidationState = {
  oneVotingProcedure: false,
  isSelectedMemberVoter: false,
  votesValidation: [{isMetadataAnchorValid : false}],
};

export const defaultVoteValidationState: VoteValidationState = {
  isMetadataAnchorValid: false,
};

export const defaultVoteTransactionDetails: VoteTransactionDetails = {
  govActionID: "",
  voteChoice: "",
  explorerLink: "",
  metadataAnchorURL: "",
  metadataAnchorHash: "",
  resetAckState: true,
};


