import { useEffect } from "react";
import { VoteTransactionDetails, VoteValidationState } from "../components/types/types";

export const useVoteValidation = (
  unsignedTransaction: any,
  isVoteTransaction: boolean,
  connected: boolean,
  setVoteTransactionDetails: (details: VoteTransactionDetails[]) => void,
  setVoteValidationState: (state: VoteValidationState[]) => void
) => {
  useEffect(() => {
    if (unsignedTransaction) {
      const transactionElement = document.getElementById("sign-transaction");
      const signatureElement = document.getElementById("signature");
      if (signatureElement) {
        signatureElement.scrollIntoView({
          behavior: "smooth",
        });
      } else if (transactionElement) {
        transactionElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [unsignedTransaction]);

  return {
    // This hook can be extended with more vote-specific logic in the future
  };
};
