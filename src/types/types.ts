// types.ts

export interface TxValidationState {
  isPartOfSigners?: boolean;
  hasNoCertificates: boolean;
  isSameNetwork?: boolean;
  isInOutputPlutusData?: boolean;
  isUnsignedTransaction: boolean;
}
  
export interface VoteTransactionDetails {
  govActionID: string;
  voteChoice: string;
  explorerLink: string;
  metadataAnchorURL: string;
  metadataAnchorHash: string;
  resetAckState: boolean;
}

export interface VotingProcedureValidationState {
  oneVotingProcedure: boolean;
  isSelectedMemberVoter?: boolean;  // made optional to handle cases where no member is selected
  votesValidation: VoteValidationState[];
}

export interface VoteValidationState {
  isMetadataAnchorValid: boolean;
}

export interface CCMember {
  id: string;
  name: string;
  coldCredential: string;
  hotCredential: string;
  network: string;
}
