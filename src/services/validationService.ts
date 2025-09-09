// validationService.ts - Transaction validation logic

import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { deserializeAddress } from "@meshsdk/core";
import * as voteTxValidationUtils from "../utils/validation";
import { ValidationResult, HierarchyValidationState } from "../types/transaction";
import { TxValidationState, VotingProcedureValidationState } from "../types/types";

export class ValidationService {
  /**
   * Validate a transaction with all available validations
   */
  static async validateTransaction(
    transactionBody: any,
    unsignedTransaction: CSL.Transaction,
    wallet?: any,
    selectedMember?: any
  ): Promise<ValidationResult> {
    const txValidation = await this.validateTransactionChecks(transactionBody, unsignedTransaction, wallet);
    const voteValidation = this.isVoteTransaction(transactionBody) 
      ? await this.validateVoteTransaction(transactionBody, selectedMember)
      : undefined;
    const hierarchyValidation = !this.isVoteTransaction(transactionBody)
      ? this.validateHierarchyTransaction()
      : undefined;

    const isAllValid = this.calculateOverallValidation(txValidation, voteValidation, hierarchyValidation);

    return {
      txValidation,
      voteValidation,
      hierarchyValidation,
      isAllValid
    };
  }

  /**
   * Validate basic transaction checks
   */
  private static async validateTransactionChecks(
    transactionBody: any,
    unsignedTransaction: CSL.Transaction,
    wallet?: any
  ): Promise<TxValidationState> {
    const baseValidation: TxValidationState = {
      hasNoCertificates: !voteTxValidationUtils.hasCertificates(transactionBody),
      isUnsignedTransaction: voteTxValidationUtils.isUnsignedTransaction(unsignedTransaction)
    };

    if (wallet) {
      try {
        const network = await wallet.getNetworkId();
        const changeAddress = await wallet.getChangeAddress();
        const stakeCred = deserializeAddress(changeAddress).stakeCredentialHash;

        return {
          ...baseValidation,
          isPartOfSigners: voteTxValidationUtils.isPartOfSigners(transactionBody, stakeCred),
          isSameNetwork: voteTxValidationUtils.isSameNetwork(transactionBody, network),
          isInOutputPlutusData: voteTxValidationUtils.isSignerInPlutusData(transactionBody, stakeCred),
        };
      } catch (error) {
        console.error("Error validating wallet checks:", error);
        return baseValidation;
      }
    }

    return baseValidation;
  }

  /**
   * Validate vote transaction specific checks
   */
  private static async validateVoteTransaction(
    transactionBody: any,
    selectedMember?: any
  ): Promise<VotingProcedureValidationState> {
    const votingProcedures = transactionBody.to_js_value().voting_procedures;
    
    const voteValidation: VotingProcedureValidationState = {
      oneVotingProcedure: votingProcedures.length === 1,
      isSelectedMemberVoter: undefined,
      votesValidation: []
    };

    // Check if selected member is the voter
    if (selectedMember && votingProcedures.length > 0) {
      voteValidation.isSelectedMemberVoter = voteTxValidationUtils.isSelectedMemberVoter(
        votingProcedures[0], 
        selectedMember.hotCredential
      );
    }

    // Validate each vote's metadata anchor
    const votes = votingProcedures[0].votes;
    for (const vote of votes) {
      const metadataURL = vote.voting_procedure.anchor?.anchor_url ?? "unavailable";
      const metadataHash = vote.voting_procedure.anchor?.anchor_data_hash ?? "unavailable";
      
      const isMetadataAnchorValid = await voteTxValidationUtils.checkMetadataAnchor(metadataURL, metadataHash);
      
      voteValidation.votesValidation.push({
        isMetadataAnchorValid
      });
    }

    return voteValidation;
  }

  /**
   * Validate hierarchy transaction (placeholder for future implementation)
   */
  private static validateHierarchyTransaction(): HierarchyValidationState {
    return {
      isAcknowledged: false
    };
  }

  /**
   * Check if transaction is a vote transaction
   */
  private static isVoteTransaction(transactionBody: any): boolean {
    const votingProcedures = transactionBody.to_js_value().voting_procedures;
    return !!votingProcedures;
  }

  /**
   * Calculate overall validation state
   */
  private static calculateOverallValidation(
    txValidation: TxValidationState,
    voteValidation?: VotingProcedureValidationState,
    hierarchyValidation?: HierarchyValidationState
  ): boolean {
    const txValidationPassed = Object.values(txValidation).every(Boolean);
    
    if (voteValidation) {
      const voteValidationPassed = Object.values(voteValidation).every(value => {
        if (Array.isArray(value)) {
          return value.flatMap(Object.values).every(Boolean);
        }
        return Boolean(value);
      });
      return txValidationPassed && voteValidationPassed;
    }
    
    if (hierarchyValidation) {
      return txValidationPassed && hierarchyValidation.isAcknowledged;
    }
    
    return txValidationPassed;
  }

  /**
   * Check if all validations are ready for signing
   */
  static canSign(
    txValidation: TxValidationState,
    voteValidation?: VotingProcedureValidationState,
    hierarchyValidation?: HierarchyValidationState,
    acknowledgedTx: boolean = false
  ): boolean {
    const validationPassed = this.calculateOverallValidation(txValidation, voteValidation, hierarchyValidation);
    return validationPassed && acknowledgedTx;
  }
}
