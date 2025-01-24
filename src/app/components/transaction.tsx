"use client";

import { useState,useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { BlockfrostProvider, deserializeAddress } from "@meshsdk/core";
import { Button, TextField, Box, Typography, Container, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import * as CLS from "@emurgo/cardano-serialization-lib-browser";
import ReactJsonPretty from 'react-json-pretty';

// Function to decode an unasigned transaction
const decodeTransaction = (unsignedTransactionHex: string) => {
  try {
    const unsignedTransaction = CLS.Transaction.from_hex(unsignedTransactionHex);
    console.log("signers list", unsignedTransaction.body().required_signers()?.to_json());
    return unsignedTransaction;
  } catch (error) {
    console.error("Error decoding transaction:", error);
    return null;
  }
};


export const TransactionButton = () => {
  const [message, setMessage] = useState("");
  const [unsignedTransactionHex, setUnsignedTransactionHex] = useState("");
  const [unsignedTransaction, setUnsignedTransaction] = useState<CLS.Transaction | null>(null);
  const { wallet, connected, name, connect, disconnect } = useWallet();
  const [signature, setsignature] = useState<string>("");
  const [isPartOfSigners, setIsPartOfSigners] = useState(false);
  const [isOneVote, setIsOneVote] = useState(false);
  const [hasCertificates, setHasCertificates] = useState(false);
  const [isSameNetwork, setIsSameNetwork] = useState(false);
  const [hasICCCredentials, setHasICCCredentials] = useState(false);
  const [isInOutputPlutusData , setIsInOutputPlutusData] = useState(false); 



  const checkTransaction = async () => {
    if (!connected) {
      setMessage("Please connect your wallet first.");
      return;
    }

    const network = await wallet.getNetworkId();
    console.log("Connected wallet network ID:", network);
    console.log("isPartOfSigners:", isPartOfSigners);

    const unsignedTransaction = decodeTransaction(unsignedTransactionHex);
    setUnsignedTransaction(unsignedTransaction);

    console.log("unsignedTransaction:", unsignedTransaction);

    const changeAddress = await wallet.getChangeAddress();
    const paymentCred = deserializeAddress(changeAddress).pubKeyHash;
    const stakeCred = deserializeAddress(changeAddress).stakeCredentialHash;

    console.log("Payment Credential:", paymentCred);
    console.log("Stake Credential:", stakeCred);

    //**************************************Transaction Validation Checks****************************************

    const transactionBody = unsignedTransaction?.body();
    const voting_procedures= transactionBody?.to_js_value().voting_procedures;
    try{
      if (!transactionBody) {
        throw new Error("Transaction body is null.");
      }
      //wallet needs to sign
      // Check if signer part of plutus output data
      const requiredSigners = transactionBody.required_signers();
      if (!requiredSigners || requiredSigners.len() === 0) {
        console.log("No required signers in the transaction.");
  
      } else if (requiredSigners?.to_json().includes(stakeCred) || requiredSigners?.to_json().includes(paymentCred)) {
        console.log("Required signers in the transaction:", requiredSigners?.to_json());
        setIsPartOfSigners(true);
      } 

      //one vote 
      
      const votesNumber = voting_procedures?.[0]?.votes?.length || -1;
      if(votesNumber === 1){
        setIsOneVote(true);
        console.log("Transaction has one vote.");
      }else if (votesNumber < 0){
        throw new Error("Transaction has no votes.");
      }else{
        //throw new Error("You are signing more than one vote. Number of votes: "+ votesNumber);
      }
      
      // Check to see if the transactions has any certificates in it
      const certificates = transactionBody?.certs();
      console.log("certificates:", certificates);
      if (!certificates) {
        console.log("No certificates in the transaction.");
        setHasCertificates(true);
      }

      //Same network
      const transactionNetworkID= transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1")?0:1;
      console.log('transactionNetwork:',transactionNetworkID);
      if (network === transactionNetworkID ) {
        setIsSameNetwork(true);
      }
      
      
      //Is Intersect CC credential
      const voterJSON = voting_procedures?.[0]?.voter;
      console.log("voterJSON:", voterJSON);
      let key = "";
      function isConstitutionalCommitteeHotCred(voter: CLS.VoterJSON): voter is { ConstitutionalCommitteeHotCred: { Script: string } } {
        return (voter as { ConstitutionalCommitteeHotCred: any }).ConstitutionalCommitteeHotCred !== undefined;
      }
      if (voterJSON && isConstitutionalCommitteeHotCred(voterJSON)) {
        // If it has ConstitutionalCommitteeHotCred, extract the Script hex
        const credType = voterJSON.ConstitutionalCommitteeHotCred;
        key = credType.Script;
        console.log("ConstitutionalCommitteeHotCred Key:", key);
      }
      if (network === 0 && key === "4f00984fa72e265b8ff8ffce4405da562cd3d6b16a4a38de3372eeea") {
        console.log("Intersect CC Credential found in testnet");
        setHasICCCredentials(true);
      } else if (network === 1 && key === "85c47dd4b9a2e70e88965d91dd69be182d5605b23bb5250b1c94bf64") {
        console.log("Intersect CC Credential found in mainnet");
        setHasICCCredentials(true);
      } else {
        console.error("Incorrect Intersect CC Credentials");
      }
      //plutus
      const plutusScripts = transactionBody?.outputs().to_js_value();
      console.log("plutusScripts:", plutusScripts);

      if (Array.isArray(plutusScripts)) {
        const regex = new RegExp(signature);
        plutusScripts.forEach((output, index) => {
          if (output.plutus_data && typeof output.plutus_data === 'object' && 'Data' in output.plutus_data) {
            const plutusData = output.plutus_data.Data;
            console.log("plutusData:", plutusData);
            if (regex.test(plutusData)) {
              console.log(`Signature found in output ${index}`);
              setIsInOutputPlutusData(true);
            }
          } else if (!output.plutus_data) {
            console.log(`No plutus data found in output`);
          } else {
            console.log(`Signiture not found on plutus script data`);
          }
        });

      } else {
        console.error("Transaction outputs are not available ");
      }
      

      //for future add context of some of the 
    }
    catch (error) {
      console.error("Error validating transaction:", error);
    }
   
  };
 
  const signTransaction = async () => {
    console.log("isPartOfSigners:", isPartOfSigners);
    try {
      if (isPartOfSigners) {
        const signedTx = await wallet.signTx(unsignedTransactionHex, true);
        console.log("Transaction signed successfully:", signedTx);

        const signature = await decodeTransaction(signedTx);
        setsignature(signature?.witness_set().vkeys()?.get(0)?.signature()?.to_hex() || '');
        console.log("signature:", signature?.witness_set().vkeys()?.get(0).signature().to_hex());
        
      }
      else { throw new Error("You are not part of the required signers."); }

    } catch (error) {
      console.error("Error signing transaction:", error);
      setMessage("Transaction signing failed. " + error);
    }
  };

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
          onChange={(e) => setUnsignedTransactionHex(e.target.value)}
        />
        <Button
          variant="contained"
          color="success"
          onClick={checkTransaction}
          sx={{ whiteSpace: "nowrap", px: 3 }}
        >
          Check Transaction
        </Button>
      </Box>

      {/* Transaction Details */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Transaction Details</Typography>
        <p>
          <span style={{ fontWeight: "bold" }}>Wallet needs to sign?: </span>
          {isPartOfSigners ? "✅" : "❌"}
        </p>
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
          <ReactJsonPretty data={unsignedTransaction ? unsignedTransaction.to_json() : {}} />
        </Box>
      </Box>

      {/* Sign Button - Aligned to Right */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          id="sign-transaction"
          variant="contained"
          color="success"
          onClick={signTransaction}
          sx={{ whiteSpace: "nowrap", px: 3 }}
        >
          Sign Transaction
        </Button>
      </Box>

      {/* Signature Display */}
      {signature && (
        <Box id='signature' sx={{ mt: 3 }}  >
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





