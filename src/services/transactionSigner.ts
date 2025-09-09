// transactionSigner.ts - Transaction signing logic

import { signTransaction, validateWitness } from "../utils/cardano";
import { ValidationResult } from "../types/transaction";
import { TxValidationState, VotingProcedureValidationState } from "../types/types";

export interface SigningResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export class TransactionSigner {
  /**
   * Sign a transaction with validation checks
   */
  static async signTransaction(
    wallet: any,
    unsignedTransactionHex: string,
    validation: ValidationResult,
    acknowledgedTx: boolean
  ): Promise<SigningResult> {
    try {
      // Validate that all checks pass
      if (!this.validateBeforeSigning(validation, acknowledgedTx)) {
        return {
          success: false,
          error: this.getValidationErrorMessage(validation, acknowledgedTx)
        };
      }

      // Sign the transaction
      const { signedTransactionObj, witnessHex } = await signTransaction(wallet, unsignedTransactionHex);
      
      // Validate the witness
      await validateWitness(signedTransactionObj, wallet, unsignedTransactionHex);
      
      return {
        success: true,
        signature: witnessHex
      };
    } catch (error) {
      console.error("Error signing transaction:", error);
      return {
        success: false,
        error: `Transaction signing failed: ${error}`
      };
    }
  }

  /**
   * Validate that all conditions are met before signing
   */
  private static validateBeforeSigning(validation: ValidationResult, acknowledgedTx: boolean): boolean {
    // Check basic transaction validation
    const txValidationPassed = Object.values(validation.txValidation).every(Boolean);
    if (!txValidationPassed) {
      return false;
    }

    // Check vote validation if it's a vote transaction
    if (validation.voteValidation) {
      const voteValidationPassed = Object.values(validation.voteValidation).every(value => {
        if (Array.isArray(value)) {
          return value.flatMap(Object.values).every(Boolean);
        }
        return Boolean(value);
      });
      if (!voteValidationPassed) {
        return false;
      }
    }

    // Check hierarchy validation if it's a hierarchy transaction
    if (validation.hierarchyValidation) {
      if (!validation.hierarchyValidation.isAcknowledged) {
        return false;
      }
    }

    // Check acknowledgment
    if (!acknowledgedTx) {
      return false;
    }

    return true;
  }

  /**
   * Get appropriate error message for validation failures
   */
  private static getValidationErrorMessage(validation: ValidationResult, acknowledgedTx: boolean): string {
    const txValidationPassed = Object.values(validation.txValidation).every(Boolean);
    
    if (!txValidationPassed) {
      return "Ensure all transaction validations are successful before proceeding.";
    }

    if (validation.voteValidation) {
      const voteValidationPassed = Object.values(validation.voteValidation).every(value => {
        if (Array.isArray(value)) {
          return value.flatMap(Object.values).every(Boolean);
        }
        return Boolean(value);
      });
      if (!voteValidationPassed) {
        return "Ensure all voting procedure validations are successful before proceeding.";
      }
    }

    if (validation.hierarchyValidation && !validation.hierarchyValidation.isAcknowledged) {
      return "Please acknowledge the hierarchy transaction details.";
    }

    if (!acknowledgedTx) {
      return "Please acknowledge the transaction details.";
    }

    return "Unknown validation error.";
  }

  /**
   * Generate witness template for download
   */
  static generateWitnessTemplate(
    govActionID: string,
    voterKeyHash: string,
    signature: string,
    template: any
  ): any {
    return {
      ...template,
      govActionID,
      voterKeyHash,
      cborHex: signature,
    };
  }

  /**
   * Generate filename for witness download
   */
  static generateWitnessFilename(govActionID: string, voterKeyHash: string): string {
    const govIdShort = govActionID?.substring(0, 15) || "unknown";
    const voterShort = voterKeyHash?.substring(0, 6) || "unknown";
    return `${govIdShort}-vote-from-${voterShort}`;
  }
}
