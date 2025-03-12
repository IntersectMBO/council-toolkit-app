"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { deserializeAddress } from "@meshsdk/core";
import { Button, TextField, Box, Typography, Container } from "@mui/material";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import ReactJsonPretty from "react-json-pretty";
import * as voteTxValidationUtils from "../utils/txValidationUtils";
import { TransactionChecks } from "./voteValidationChecks";
import {decodeHextoTx,convertGAToBech,getCardanoScanURL} from "../utils/txUtils";
import { VotingDetails } from "./votingDetails";
import DownloadButton from "./downloadFiles";
import FileUploader from "./fileUploader";

export const TransactionButton = () => {
  const [message, setMessage] = useState("");
  const [unsignedTransactionHex, setUnsignedTransactionHex] = useState("");
  const [unsignedTransaction, setUnsignedTransaction] = useState<CSL.Transaction | null>(null);
  const { wallet, connected, name, connect, disconnect } = useWallet();
  const [signature, setSignature] = useState<string>("");
  const [voteChoice, setVoteChoice] = useState<string>("");
  const [govActionID, setGovActionID] = useState<string>("");
  const [cardanoscan, setCardanoscan] = useState<string>("");
  const [metadataAnchorURL, setMetadataAnchorURL] = useState<string>("");
  const [metadataAnchorHash, setMetadataAnchorHash] = useState<string>("");
  const [stakeCredentialHash, setStakeCredentialHash] = useState<string>("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [validationState, setValidationState] = useState({
    isPartOfSigners: false,
    isOneVote: false,
    hasCertificates: true,
    isSameNetwork: false,
    hasICCCredentials: false,
    isInOutputPlutusData: false,
    isMetadataAnchorValid: false,
    isUnsignedTransaction: false,
  });
  const resetValidationState = () => {
    setValidationState((prev) => ({
      ...prev,
      isPartOfSigners: false,
      isOneVote: false,
      hasCertificates: true,
      isSameNetwork: false,
      hasICCCredentials: false,
      isInOutputPlutusData: false,
      isMetadataAnchorValid: false,
      isUnsignedTransaction: false,
    }));
  };

  const resetAllStates = useCallback(() => {
    setMessage("");
    setUnsignedTransactionHex("");
    setUnsignedTransaction(null);
    setSignature("");
    setVoteChoice("");
    setGovActionID("");
    setCardanoscan("");
    setMetadataAnchorURL("");
    setMetadataAnchorHash("");
    resetValidationState();
    setIsAcknowledged(false);
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
  }, [connected,resetAllStates]);

  const checkTransaction = useCallback(async () => {
    if (!connected) {
      resetValidationState();
      setVoteChoice("");
      setGovActionID("");
      return;
    }
    try {
      const network = await walletRef.current.getNetworkId();
      const unsignedTransaction = decodeHextoTx(unsignedTransactionHex);
      setUnsignedTransaction(unsignedTransaction);
      if (!unsignedTransaction) throw new Error("Invalid transaction format.");

      const changeAddress = await walletRef.current.getChangeAddress();
      const stakeCred = deserializeAddress(changeAddress).stakeCredentialHash;
      setStakeCredentialHash(stakeCred);

      console.log("Connected wallet network ID:", network);
      console.log("Unsigned transaction:", unsignedTransaction.to_hex());
      console.log("Connected wallet's stake credential (used as voting key):", stakeCred);

      // Transaction Validation Checks

      const transactionBody = unsignedTransaction.body();
      if (!transactionBody) throw new Error("Transaction body is null.");

      // todo add logic to work out which type of transaction is being signed
      // then from detected transaction, apply the correct validation checks

      // for now lets just apply voting validation checks, when there is a vote
      // else assume its a joining hierarchy transaction

      const votingProcedures = transactionBody.to_js_value().voting_procedures;

      // is a vote transaction
      if (votingProcedures){

        console.log("Transaction is a vote transaction, applying vote validations");

        // todo: change logic to reference voting procedures
        const votes = votingProcedures[0].votes;

        // apply validation logic
        const hasOneVote = voteTxValidationUtils.hasOneVoteOnTransaction(transactionBody);
        const vote = votingProcedures[0].votes[0].voting_procedure.vote;
        if(!votes[0].voting_procedure.anchor) throw new Error("Vote has no anchor.");
        const voteMetadataURL = votes[0].voting_procedure.anchor.anchor_url;
        const voteMetadataHash = votes[0].voting_procedure.anchor.anchor_data_hash;

        setValidationState({
          isPartOfSigners: await voteTxValidationUtils.isPartOfSigners(transactionBody, stakeCred),
          isOneVote: hasOneVote,
          hasCertificates: voteTxValidationUtils.hasCertificates(transactionBody),
          isSameNetwork: voteTxValidationUtils.isSameNetwork(transactionBody, network),
          hasICCCredentials: voteTxValidationUtils.hasValidICCCredentials(transactionBody, network),
          isInOutputPlutusData: voteTxValidationUtils.isSignerInPlutusData(transactionBody, stakeCred),
          isMetadataAnchorValid: await voteTxValidationUtils.checkMetadataAnchor(voteMetadataURL,voteMetadataHash),
          isUnsignedTransaction: voteTxValidationUtils.isUnsignedTransaction(unsignedTransaction),
        });

        // Get the key voting details of the transaction

        const transactionNetworkID = transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1") ? 0 : 1;
        if (votes && hasOneVote) {
          
          const govActionID = convertGAToBech(votes[0].action_id.transaction_id, votes[0].action_id.index);
  
          setVoteChoice(vote === 'Yes' ? 'Constitutional' : vote === 'No' ? 'Unconstitutional' : 'Abstain');
          setGovActionID(govActionID);
          if(!votes[0].voting_procedure.anchor) throw new Error("Vote has no anchor.");
          setMetadataAnchorURL(voteMetadataURL);
          setMetadataAnchorHash(voteMetadataHash);
          setCardanoscan(getCardanoScanURL(govActionID,transactionNetworkID));
          }

      // for now assume its a joining hierarchy transaction
      } else if (!votingProcedures) {
        console.log("Transaction is not a vote transaction");
      }
    }
    catch (error) {
      console.error("Error validating transaction:", error);
      setMessage("Transaction validation failed. " + error);
      resetValidationState();
      setVoteChoice("");
      setGovActionID("");
    }
  }, [unsignedTransactionHex, walletRef, connected]);
 
  const signTransaction = async () => {
    try {
      if (validationState.isPartOfSigners) {
        // Pass transaction to wallet for signing
        const signedTx = await wallet.signTx(unsignedTransactionHex, true);
        const signedTransactionObj = decodeHextoTx(signedTx);

        const witnessHex = signedTransactionObj?.witness_set().vkeys()?.get(0)?.to_hex() || '';
        const signature = signedTransactionObj?.witness_set().vkeys()?.get(0).signature().to_hex() || '';
        let providedVkey = signedTransactionObj?.witness_set().vkeys()?.get(0).vkey().to_hex() || '';

        // Remove the (confusing) CBOR header, not sure why adds this
        providedVkey = providedVkey.substring(4);
        const providedVKeyObj = CSL.PublicKey.from_hex(providedVkey);

        // Check to make sure the wallet produced a signature as expected

        // compare the desired credential with the vKey returned from wallet
        const expectedVKeyHash = deserializeAddress(await wallet.getChangeAddress()).stakeCredentialHash;
        const providedVKeyHash = providedVKeyObj.hash().to_hex();

        if (providedVKeyHash != expectedVKeyHash) {
          throw new Error("Wallet returned unexpected VKey.");
        }

        // Check the produced signature if valid
        const txHash = CSL.FixedTransaction.from_hex(unsignedTransactionHex).transaction_hash().to_bytes();
        const validSignature = providedVKeyObj.verify(txHash, CSL.Ed25519Signature.from_hex(signature));

        if (!validSignature){
          throw new Error("Wallet created an invalid signature.");
        }

        setSignature(witnessHex);
        console.log("Witness (hex): ", witnessHex);
      }
      else { 
        throw new Error("You are not part of the required signers.");
      }

    } catch (error) {
      console.error("Error signing transaction:", error);
      setMessage("Transaction signing failed. " + error);
    }
  };
  useEffect(() => {
    if (unsignedTransactionHex) {
      checkTransaction();
    }
  }, [unsignedTransactionHex,checkTransaction]);
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
  }, [signature,unsignedTransaction]);

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
            resetValidationState();
            setVoteChoice("");
            setGovActionID("");
            setSignature("");
            setMetadataAnchorURL("");
            setMetadataAnchorHash("");
          }}
        />
        <FileUploader setUnsignedTransactionHex={setUnsignedTransactionHex} setMessage={setMessage} />
      </Box>

      {/* Transaction Details */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Transaction Validation Checks
        </Typography>

        {unsignedTransaction && (
            <TransactionChecks {...validationState}
          />
        )}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Voting Details
        </Typography>
        {unsignedTransaction && (
          <VotingDetails
            govActionID={govActionID}
            voteChoice={voteChoice}
            cardanoscan={cardanoscan}
            metadataAnchorURL={metadataAnchorURL}
            metadataAnchorHash={metadataAnchorHash}
            onAcknowledgeChange={setIsAcknowledged}
          />
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
      {!isAcknowledged &&(
          <Typography color="error" sx={{ mt: 1 }}>
            ⚠️ You must acknowledge voting details before signing!
          </Typography>
        )}
        <Button
          id="sign-transaction"
          variant="contained"
          color="success"
          disabled={!isAcknowledged}
          onClick={signTransaction}
          sx={{ whiteSpace: "nowrap", px: 3 }}
        >
          Sign Transaction
        </Button>
      </Box>

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
            <DownloadButton signature={signature} govActionID={govActionID} voterKeyHash={stakeCredentialHash} />
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
