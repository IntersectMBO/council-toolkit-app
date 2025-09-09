// transactionProcessor.ts - Transaction parsing and processing logic

import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { decodeHexToTx, convertGAToBech, getCardanoScanURL } from "../utils/cardano";
import { ParsedTransaction, TransactionProcessorResult } from "../types/transaction";
import { VoteTransactionDetails, VotingProcedureValidationState } from "../types/types";
import * as voteTxValidationUtils from "../utils/validation";

export class TransactionProcessor {
  /**
   * Parse a hex-encoded transaction and extract key information
   */
  static async parseTransaction(hex: string): Promise<TransactionProcessorResult> {
    try {
      const unsignedTransaction = decodeHexToTx(hex);
      if (!unsignedTransaction) {
        return {
          success: false,
          error: "Invalid transaction format."
        };
      }

      const transactionHash = this.getTransactionHash(hex);
      const transactionBody = unsignedTransaction.body();
      
      if (!transactionBody) {
        return {
          success: false,
          error: "Transaction body is null."
        };
      }

      const isVoteTransaction = this.isVoteTransaction(transactionBody);
      
      const result: ParsedTransaction = {
        unsignedTransaction,
        transactionHash,
        transactionBody,
        isVoteTransaction
      };

      // Process vote-specific details if it's a vote transaction
      if (isVoteTransaction) {
        const voteData = await this.processVoteTransaction(transactionBody, transactionHash);
        result.voteDetails = voteData.voteDetails;
        result.voteValidation = voteData.voteValidation;
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("Error parsing transaction:", error);
      return {
        success: false,
        error: `Transaction parsing failed: ${error}`
      };
    }
  }

  /**
   * Check if a transaction is a vote transaction
   */
  static isVoteTransaction(transactionBody: any): boolean {
    const votingProcedures = transactionBody.to_js_value().voting_procedures;
    return !!votingProcedures;
  }

  /**
   * Get transaction hash from hex string
   */
  static getTransactionHash(hex: string): string {
    try {
      const fixedTx = CSL.FixedTransaction.from_hex(hex);
      return fixedTx.transaction_hash().to_hex();
    } catch (error) {
      console.error("Error getting transaction hash:", error);
      return "";
    }
  }

  /**
   * Process vote transaction details and validation
   */
  private static async processVoteTransaction(
    transactionBody: any, 
    transactionHash: string
  ): Promise<{
    voteDetails: VoteTransactionDetails[];
    voteValidation: VotingProcedureValidationState;
  }> {
    const votingProcedures = transactionBody.to_js_value().voting_procedures;
    const transactionNetworkID = transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1") ? 0 : 1;

    const voteValidation: VotingProcedureValidationState = {
      oneVotingProcedure: votingProcedures.length === 1,
      isSelectedMemberVoter: undefined, // Will be set later when member is selected
      votesValidation: []
    };

    const voteDetails: VoteTransactionDetails[] = [];

    // Process each vote in the first voting procedure
    const votes = votingProcedures[0].votes;
    for (const vote of votes) {
      const govActionID = convertGAToBech(vote.action_id.transaction_id, vote.action_id.index);
      const voteChoice = this.mapVoteChoice(vote.voting_procedure.vote);
      const metadataURL = vote.voting_procedure.anchor?.anchor_url ?? "unavailable";
      const metadataHash = vote.voting_procedure.anchor?.anchor_data_hash ?? "unavailable";

      // Validate metadata anchor
      const isMetadataAnchorValid = await voteTxValidationUtils.checkMetadataAnchor(metadataURL, metadataHash);
      
      voteValidation.votesValidation.push({
        isMetadataAnchorValid
      });

      voteDetails.push({
        govActionID,
        voteChoice,
        explorerLink: getCardanoScanURL(govActionID, transactionNetworkID),
        metadataAnchorURL: metadataURL,
        metadataAnchorHash: metadataHash,
        resetAckState: false
      });
    }

    return { voteDetails, voteValidation };
  }

  /**
   * Map vote choice from transaction format to display format
   */
  private static mapVoteChoice(vote: string): string {
    switch (vote) {
      case 'Yes':
        return 'Constitutional';
      case 'No':
        return 'Unconstitutional';
      default:
        return 'Abstain';
    }
  }

  /**
   * Get shareable URL for a transaction
   */
  static getShareableUrl(transactionHex: string): string {
    if (!transactionHex) return '';
    return `${window.location.origin}/tx#${transactionHex}`;
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }
}
