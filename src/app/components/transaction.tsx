"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { deserializeAddress } from "@meshsdk/core";
import { Button, TextField, Box, Typography, Container } from "@mui/material";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import ReactJsonPretty from "react-json-pretty";
import * as voteTxValidationUtils from "../utils/txValidationUtils";
import { TransactionChecks } from "./txValidationChecks";
import { VoteTransactionChecks } from "./voteValidationChecks";
import { decodeHexToTx, convertGAToBech, getCardanoScanURL } from "../utils/txUtils";
import { VotingDetails } from "./votingDetails";
import { HierarchyDetails } from "./hierarchyDetails";
import DownloadButton from "./molecules/downloadFiles";
import FileUploader from "./molecules/fileUploader";
import {TxValidationState,VoteTransactionDetails,VoteValidationState} from "./types/types";
import {defaultTxValidationState,defaultVoteTransactionDetails,defaultVoteValidationState} from "./types/defaultStates";
import SignTransactionButton from "./signTransactionButton";

export const TransactionButton = () => {
  const { wallet, connected } = useWallet();
  const [stakeCredentialHash, setStakeCredentialHash] = useState<string>("");
  const [message, setMessage] = useState("");
  const [unsignedTransactionHex, setUnsignedTransactionHex] = useState("");
  const [unsignedTransaction, setUnsignedTransaction] = useState<CSL.Transaction | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [acknowledgedTx, setAcknowledgedTx] = useState(false);
  const [isVoteTransaction, setIsVoteTransaction] = useState(false);
  // for all transactions
  const [txValidationState, setTxValidationState] = useState<TxValidationState>(defaultTxValidationState);
  // for vote transactions
  const [voteTransactionDetails, setVoteTransactionDetails] = useState<VoteTransactionDetails>(defaultVoteTransactionDetails);
  // for vote transactions
  const [voteValidationState, setVoteValidationState] = useState<VoteValidationState>(defaultVoteValidationState);

  // add other transactions validations and details here

  const resetAllDetailsState = () => {
    setVoteTransactionDetails(defaultVoteTransactionDetails);
    // add hierarchy details reset here
    // add other transaction details reset here
  }

  const resetAllValidationState = () => {
    setTxValidationState((prev) => ({
      ...prev,
      defaultTxValidationState,
    }));
    setVoteValidationState((prev) => ({
      ...prev,
      defaultVoteValidationState,
    }));
    // add other transactions validations here
  };

  const resetAllStates = useCallback(() => {
    setMessage("");
    setUnsignedTransactionHex("");
    setUnsignedTransaction(null);
    setSignature("");
    resetAllDetailsState();
    resetAllValidationState();
    setAcknowledgedTx(false);
    setIsVoteTransaction(false);
  }, []);
  
  const walletRef = useRef(wallet);

  useEffect(() => {
    walletRef.current = wallet; // Always keep the latest wallet, but without causing re-renders
  }, [wallet]);
  
  useEffect(() => {
    if (!connected) {
      resetAllStates();
      setMessage("Please connect your wallet first.");
    }
    else {
      setMessage(`Connected to wallet`);
    }
  }, [connected, resetAllStates]);

  const checkTransaction = useCallback(async () => {
    // if wallet not connected and we try to check transaction, set message
    // and return
    if (!connected) {
      return setMessage("Please connect your wallet first.");
    }
    try {
      const network = await walletRef.current.getNetworkId();
      const unsignedTransaction = decodeHexToTx(unsignedTransactionHex);
      setUnsignedTransaction(unsignedTransaction);
      if (!unsignedTransaction) throw new Error("Invalid transaction format.");

      const changeAddress = await walletRef.current.getChangeAddress();
      const stakeCred = deserializeAddress(changeAddress).stakeCredentialHash;
      setStakeCredentialHash(stakeCred);

      console.log("Connected wallet network ID:", network);
      console.log("Unsigned transaction:", unsignedTransaction.to_hex());
      console.log("Connected wallet's stake credential (used as voting key):", stakeCred);

      // Transaction Validation Checks

      // for all transactions
      const transactionBody = unsignedTransaction.body();
      if (!transactionBody) throw new Error("Transaction body is null.");

      setTxValidationState({
        isPartOfSigners: voteTxValidationUtils.isPartOfSigners(transactionBody, stakeCred),
        hasNoCertificates: !voteTxValidationUtils.hasCertificates(transactionBody),
        isSameNetwork: voteTxValidationUtils.isSameNetwork(transactionBody, network),
        isInOutputPlutusData: voteTxValidationUtils.isSignerInPlutusData(transactionBody, stakeCred),
        isUnsignedTransaction: voteTxValidationUtils.isUnsignedTransaction(unsignedTransaction),
      });

      // todo add logic to work out which type of transaction is being signed
      // then from detected transaction, apply the correct validation checks

      // for now; if vote then assume its a vote tx
      // if not vote assume its a hierarchy tx

      const votingProcedures = transactionBody.to_js_value().voting_procedures;

      // if a vote transaction
      if (votingProcedures){

        setIsVoteTransaction(true);

        console.log("Transaction is a vote transaction, applying vote validations");

        // todo: change logic to reference voting procedures
        const votes = votingProcedures[0].votes;

        // apply validation logic
        const hasOneVote = voteTxValidationUtils.hasOneVoteOnTransaction(transactionBody);
        const vote = votingProcedures[0].votes[0].voting_procedure.vote;
        if(!votes[0].voting_procedure.anchor) throw new Error("Vote has no anchor.");
        const voteMetadataURL = votes[0].voting_procedure.anchor.anchor_url;
        const voteMetadataHash = votes[0].voting_procedure.anchor.anchor_data_hash;

        setVoteValidationState({
          isOneVote: voteTxValidationUtils.hasOneVoteOnTransaction(transactionBody),
          isMetadataAnchorValid: await voteTxValidationUtils.checkMetadataAnchor(voteMetadataURL,voteMetadataHash),
          hasICCCredentials: voteTxValidationUtils.hasValidICCCredentials(transactionBody, network),
        });

        // Get the key voting details of the transaction

        const transactionNetworkID = transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1") ? 0 : 1;
        if (votes && hasOneVote) {
          
          const govActionID = convertGAToBech(votes[0].action_id.transaction_id, votes[0].action_id.index);
          if(!votes[0].voting_procedure.anchor) throw new Error("Vote has no anchor.");

          setVoteTransactionDetails({
            govActionID: govActionID,
            voteChoice: vote === 'Yes' ? 'Constitutional' : vote === 'No' ? 'Unconstitutional' : 'Abstain',
            explorerLink: getCardanoScanURL(govActionID,transactionNetworkID),
            metadataAnchorURL: voteMetadataURL,
            metadataAnchorHash: voteMetadataHash,
            resetAckState: false,
          });
        }

      // for now assume its a joining hierarchy transaction
      } else if (!votingProcedures) {

        setIsVoteTransaction(false);
        console.log("Transaction is a vote transaction, applying vote validations");

        // todo: add hierarchy details
        // todo: add hierarchy validation checks

      }
    }
    catch (error) {
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
  useEffect(() => {
    if (signature || unsignedTransaction) {
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
  }, [signature, unsignedTransaction]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Transaction Input & Button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          type="string"
          label="Enter Hex Encoded Transaction"
          variant="outlined"
          fullWidth
          value={unsignedTransactionHex}
          onChange={(e) => {
            setUnsignedTransactionHex(e.target.value);
            resetAllValidationState();
            resetAllDetailsState();
            setSignature("");
          }}
        />
        <FileUploader setUnsignedTransactionHex={(hex) => { setUnsignedTransactionHex(hex); setSignature(""); resetAllDetailsState();}} setMessage={setMessage} />
      </Box>

    {/* Transaction Details for all transactions*/}
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mt: 2, mb:2 }}  bgcolor={"#e0e0e0"}>
        Transaction Validation Checks
      </Typography>
      {unsignedTransaction && (
        <TransactionChecks {...txValidationState} />
      )}

      {/* Vote Transaction Validations */}
      {unsignedTransaction && isVoteTransaction && (
        <>
          <Typography variant="h6" sx={{ mt: 2 ,mb: 2 }} bgcolor={"#e0e0e0"}>
            Vote Validation Checks
          </Typography>
          <VoteTransactionChecks {...voteValidationState} />
        </>
      )}

      {/* Vote Details */}
      {unsignedTransaction && isVoteTransaction && (
        <>
          <Typography variant="h6" sx={{ mt: 2 ,mb: 2 } } bgcolor={"#e0e0e0"}>
            Vote Details
          </Typography>
          <VotingDetails
            govActionID={voteTransactionDetails.govActionID}
            voteChoice={voteTransactionDetails.voteChoice}
            explorerLink={voteTransactionDetails.explorerLink}
            metadataAnchorURL={voteTransactionDetails.metadataAnchorURL}
            metadataAnchorHash={voteTransactionDetails.metadataAnchorHash}
            onAcknowledgeChange={setAcknowledgedTx}
            resetAckState={voteTransactionDetails.resetAckState}
          />
        </>
      )}
      {/* Hierarchy Details */}
      {unsignedTransaction && !isVoteTransaction && (
        <>
          <Typography variant="h6" sx={{  mt: 2 ,mb: 2 }} bgcolor={"#e0e0e0"}>
            Hierarchy Details
          </Typography>
          <HierarchyDetails
            onAcknowledgeChange={setAcknowledgedTx}
          />
        </>
      )}
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            padding: 2,
            borderRadius: 1,
            maxHeight: "400px",
            overflowY: "auto",
            marginTop: 2,
            boxShadow: 1,
          }}
        >
          {unsignedTransactionHex && (
            <ReactJsonPretty
              data={unsignedTransaction ? unsignedTransaction.to_json() : {}}
            />
          )}
        </Box>
      </Box>

      {/* Sign Button - Aligned to Right */}
      <SignTransactionButton {...{ wallet, unsignedTransactionHex, isVoteTransaction, txValidationState, voteValidationState, acknowledgedTx, voteTransactionDetails, stakeCredentialHash, setMessage, setSignature }} />

      {/* Signature Display */}
      {signature && (
        <Box id="signature" sx={{ mt: 3 }}>
          <Typography variant="h6">Signature</Typography>
          <Box
            sx={{
              backgroundColor: "#e8f5e9",
              padding: 2,
              borderRadius: 1,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              boxShadow: 2,
              maxHeight: "250px",
              overflowY: "auto",
            }}
            onClick={() => {
              navigator.clipboard.writeText(signature);
              setMessage("Signature copied to clipboard!");
            }}
          >
            <Typography component="pre">{signature}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <DownloadButton signature={signature} govActionID={voteTransactionDetails.govActionID} voterKeyHash={stakeCredentialHash} />
          </Box>
        </Box>
      )}

      {/* Error Message Display */}
      {message && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
     
    </Container>
  );
};
