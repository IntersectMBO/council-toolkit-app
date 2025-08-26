import { useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { deserializeAddress } from "@meshsdk/core";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import * as voteTxValidationUtils from "../utils/txValidationUtils";
import { decodeHexToTx, convertGAToBech, getCardanoScanURL } from "../utils/txUtils";
import { TxValidationState, VoteTransactionDetails, VoteValidationState } from "../components/types/types";
import { defaultTxValidationState, defaultVoteTransactionDetails, defaultVoteValidationState } from "../components/types/defaultStates";

export const useTransaction = () => {
  const { wallet, connected } = useWallet();
  const [stakeCredentialHash, setStakeCredentialHash] = useState<string>("");
  const [message, setMessage] = useState("");
  const [unsignedTransactionHex, setUnsignedTransactionHex] = useState("");
  const [unsignedTransaction, setUnsignedTransaction] = useState<CSL.Transaction | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [acknowledgedTxs, setAcknowledgedTxs] = useState<boolean>(false);
  const [isVoteTransaction, setIsVoteTransaction] = useState(false);
  
  // for all transactions
  const [txValidationState, setTxValidationState] = useState<TxValidationState>(defaultTxValidationState);
  // for vote transactions
  const [voteTransactionDetails, setVoteTransactionDetails] = useState<VoteTransactionDetails[]>([defaultVoteTransactionDetails]);
  // for vote transactions
  const [voteValidationState, setVoteValidationState] = useState<VoteValidationState[]>([defaultVoteValidationState]);

  const walletRef = useRef(wallet);

  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  const resetAllDetailsState = () => {
    setVoteTransactionDetails([defaultVoteTransactionDetails]);
  };

  const resetAllValidationState = () => {
    setTxValidationState((prev) => ({
      ...prev,
      ...defaultTxValidationState,
    }));
    setVoteValidationState([defaultVoteValidationState]);
  };

  const resetAllStates = useCallback(() => {
    setMessage("");
    setUnsignedTransactionHex("");
    setUnsignedTransaction(null);
    setSignature("");
    resetAllDetailsState();
    resetAllValidationState();
    setAcknowledgedTxs(false);
    setIsVoteTransaction(false);
  }, []);

  useEffect(() => {
    if (!connected) {
      console.log("RESETTING ALL STATES");
      resetAllStates();
    }
  }, [connected, resetAllStates]);

  const checkTransaction = useCallback(async () => {
    try {
      const unsignedTransaction = decodeHexToTx(unsignedTransactionHex);
      setUnsignedTransaction(unsignedTransaction);
      
      if (!unsignedTransaction) throw new Error("Invalid transaction format.");
      console.log("Unsigned transaction:", unsignedTransaction.to_hex());

      // for all transactions
      const transactionBody = unsignedTransaction.body();
      if (!transactionBody) throw new Error("Transaction body is null.");

      const baseTxValidationState: TxValidationState = {
        hasNoCertificates: !voteTxValidationUtils.hasCertificates(transactionBody),
        isUnsignedTransaction: voteTxValidationUtils.isUnsignedTransaction(unsignedTransaction)
      };

      // Get the key voting details of the transaction
      const transactionNetworkID = transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1") ? 0 : 1;
      const votingProcedures = transactionBody.to_js_value().voting_procedures;
      console.log("Voting Procedures:", votingProcedures);
      
      // if a vote transaction
      if (votingProcedures) {
        setIsVoteTransaction(true);
        console.log("Transaction is a vote transaction, applying vote validations");

        const votes = votingProcedures[0].votes;
        const voteValidations: VoteValidationState[] = [];
        const voteDetails: VoteTransactionDetails[] = [];
        
        for (const vote of votes) {
          console.log("Vote:", vote);

          const govActionID = convertGAToBech(vote.action_id.transaction_id, vote.action_id.index);
          const voteChoice = (vote.voting_procedure.vote === 'Yes' ? 'Constitutional' : vote.voting_procedure.vote === 'No' ? 'Unconstitutional' : 'Abstain');
          const metadataURL = vote.voting_procedure.anchor?.anchor_url ?? "unavailable";
          const metadataHash = vote.voting_procedure.anchor?.anchor_data_hash ?? "unavailable";     
   
          voteValidations.push({
            isMetadataAnchorValid: await voteTxValidationUtils.checkMetadataAnchor(metadataURL, metadataHash),
          });

          voteDetails.push({
            govActionID: govActionID,
            voteChoice: voteChoice,
            explorerLink: getCardanoScanURL(govActionID, transactionNetworkID),
            metadataAnchorURL: metadataURL,
            metadataAnchorHash: metadataHash,
            resetAckState: false,
          });
        }

        setVoteTransactionDetails(voteDetails);
        setVoteValidationState(voteValidations);
      } else if (!votingProcedures) {
        setIsVoteTransaction(false);
        console.log("Transaction is a hierarchy transaction");
      }

      if (connected) {
        const network = await walletRef.current.getNetworkId();
        const changeAddress = await walletRef.current.getChangeAddress();
        const stakeCred = deserializeAddress(changeAddress).stakeCredentialHash;
        setStakeCredentialHash(stakeCred);
        setTxValidationState({
          ...baseTxValidationState,
          isPartOfSigners: voteTxValidationUtils.isPartOfSigners(transactionBody, stakeCred),
          isSameNetwork: voteTxValidationUtils.isSameNetwork(transactionBody, network),
          isInOutputPlutusData: voteTxValidationUtils.isSignerInPlutusData(transactionBody, stakeCred),
        });
      } else {
        setTxValidationState({
          ...baseTxValidationState
        });
      }
    } catch (error) {
      console.error("Error validating transaction:", error);
      setMessage("Transaction validation failed. " + error);
      resetAllValidationState();
      resetAllDetailsState();
    }
  }, [unsignedTransactionHex, walletRef, connected]);

  useEffect(() => {
    if (unsignedTransactionHex) {
      checkTransaction();
    }
  }, [unsignedTransactionHex, checkTransaction]);

  const handleAcknowledgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setAcknowledgedTxs(checked);
  };

  return {
    // State
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
    
    // Actions
    setUnsignedTransactionHex,
    setSignature,
    setMessage,
    resetAllStates,
    resetAllDetailsState,
    resetAllValidationState,
    handleAcknowledgeChange,
  };
};
