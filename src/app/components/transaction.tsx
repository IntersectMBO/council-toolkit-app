"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { deserializeAddress } from "@meshsdk/core";
import { Button, TextField, Box, Typography, Container, Paper, FormControlLabel, Checkbox } from "@mui/material";
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
import { metadata } from "../layout";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";

export const TransactionButton = () => {
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

  // add other transactions validations and details here

  const resetAllDetailsState = () => {
    setVoteTransactionDetails([defaultVoteTransactionDetails]);
    // add hierarchy details reset here
    // add other transaction details reset here
  }

  const resetAllValidationState = () => {
    setTxValidationState((prev) => ({
      ...prev,
      defaultTxValidationState,
    }));
    setVoteValidationState([defaultVoteValidationState]);
    // add other transactions validations here
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
  
  const walletRef = useRef(wallet);

  useEffect(() => {
    walletRef.current = wallet; // Always keep the latest wallet, but without causing re-renders
  }, [wallet]);
  
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

      {/* Transaction Validation Checks*/}

      // for all transactions
      const transactionBody = unsignedTransaction.body();
      if (!transactionBody) throw new Error("Transaction body is null.");

      const baseTxValidationState: TxValidationState = {
        hasNoCertificates: !voteTxValidationUtils.hasCertificates(transactionBody),
        isUnsignedTransaction: voteTxValidationUtils.isUnsignedTransaction(unsignedTransaction)
      }

      // todo add logic to work out which type of transaction is being signed
      // then from detected transaction, apply the correct validation checks

      // for now; if vote then assume its a vote tx
      // if not vote assume its a hierarchy tx
      
      // Get the key voting details of the transaction
      const transactionNetworkID = transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1") ? 0 : 1;
      const votingProcedures = transactionBody.to_js_value().voting_procedures;
      console.log("Voting Procedures:", votingProcedures);
      
      // if a vote transaction
      if (votingProcedures){

        setIsVoteTransaction(true);

        console.log("Transaction is a vote transaction, applying vote validations");

        // todo: change logic to reference voting procedures
        const votes = votingProcedures[0].votes;
        const voteValidations: VoteValidationState[] = [];
        const voteDetails: VoteTransactionDetails[] = [];
        
        for (const vote of votes){
          console.log("Vote:", vote);

          const govActionID = convertGAToBech(vote.action_id.transaction_id, vote.action_id.index);
          const voteChoice = (vote.voting_procedure.vote === 'Yes' ? 'Constitutional' : vote.voting_procedure.vote === 'No' ? 'Unconstitutional' : 'Abstain');
          const metadataURL = vote.voting_procedure.anchor?.anchor_url ?? "unavailable";
          const metadataHash = vote.voting_procedure.anchor?.anchor_data_hash ?? "unavailable";     
   
          voteValidations.push({
            isMetadataAnchorValid: await voteTxValidationUtils.checkMetadataAnchor(metadataURL,metadataHash),
          });

          voteDetails.push({
            govActionID: govActionID,
            voteChoice: voteChoice,
            explorerLink: getCardanoScanURL(govActionID, transactionNetworkID),
            metadataAnchorURL: metadataURL,
            metadataAnchorHash: metadataHash,
            resetAckState: false,
          });

        // apply validation logic
        
      }

      setVoteTransactionDetails(voteDetails);
      setVoteValidationState(voteValidations);
      // for now assume its a joining hierarchy transaction
      } else if (!votingProcedures) {

        setIsVoteTransaction(false);
        console.log("Transaction is a vote transaction, applying vote validations");

        // todo: add hierarchy details
        // todo: add hierarchy validation checks

      }

      if (connected){
        const network = await walletRef.current.getNetworkId();
        const changeAddress = await walletRef.current.getChangeAddress();
        const stakeCred = deserializeAddress(changeAddress).stakeCredentialHash;
        setStakeCredentialHash(stakeCred);
        setTxValidationState({
          ...baseTxValidationState,
          isPartOfSigners: voteTxValidationUtils.isPartOfSigners(transactionBody,stakeCred),
          isSameNetwork: voteTxValidationUtils.isSameNetwork(transactionBody,network),
          isInOutputPlutusData: voteTxValidationUtils.isSignerInPlutusData(transactionBody,stakeCred),
      });
      // this part of code is commented out as it is not currently used, but will be reused once we set the council list
      //   if (voteValidationState) {
      //   setVoteValidationState({
      //     ...voteValidationState,
      //     hasICCCredentials: voteTxValidationUtils.hasValidICCCredentials(transactionBody, network),
      //   });
      // }
      }else {
        setTxValidationState({
          ...baseTxValidationState
        });
        // this part of code is commented out as it is not currently used, but will be reused once we set the council list
        // if (voteValidationState){
        //   setVoteValidationState({...voteValidationState});
        // }
        
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
  const handleAcknowledgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setAcknowledgedTxs(checked);
  };
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Transaction Input Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Transaction Input
        </Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField
            type="string"
            label="Enter Hex Encoded Transaction"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={unsignedTransactionHex}
            onChange={(e) => {
              setUnsignedTransactionHex(e.target.value);
              resetAllValidationState();
              resetAllDetailsState();
              setSignature("");
            }}
            sx={{ flex: 1 }}
          />
          
        </Box>
        <Box sx={{ display: "flex", alignItems: { xs: "stretch", sm: "flex-start" }, mt: 2 }}>
            <FileUploader 
              setUnsignedTransactionHex={(hex) => { 
                setUnsignedTransactionHex(hex); 
                setSignature(""); 
                resetAllDetailsState();
              }} 
              setMessage={setMessage} 
            />
          </Box>
      </Paper>

      {/* Validation and Details Sections */}
      {unsignedTransaction && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Transaction Validation Section */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Transaction Validation Checks
            </Typography>
            <TransactionChecks {...txValidationState} />
          </Paper>

          {/* Vote Validation Section */}
          {isVoteTransaction && (
            <Paper elevation={2} sx={{ paddingLeft:3,paddingRight:3, borderRadius: 2,maxHeight: 300, overflowY: "auto" }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ position: "sticky",paddingTop: 3,top: 0,
                backgroundColor: "background.paper",
                zIndex: 2,
                pb: 1,
              }}>
                Vote Validation Checks
              </Typography>
              {/* <VoteTransactionChecks {...voteValidationState} /> */}
              
              {voteValidationState.map((validation, index) => (
                <Box key={index} sx={{ mb: 2, maxHeight: 500, overflowY: "auto" }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Vote no.{index + 1}
                  </Typography>
                  <VoteTransactionChecks {...validation} />
                </Box>
              ))}
            </Paper>
          )}

          {/* Vote Details Section */}
          {isVoteTransaction && (
            <Paper elevation={2} sx={{ paddingLeft:3,paddingRight:3, borderRadius: 2 ,maxHeight: 400, overflowY: "auto"  }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{
                position: "sticky",
                paddingTop: 3,
                top: 0,
                backgroundColor: "background.paper",
                zIndex: 2,
                pb: 1,
              }}>
                Vote Details
              </Typography>
              {voteTransactionDetails.map((detail, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Vote no.{index + 1} – {detail.govActionID}
                  </Typography>
                  <VotingDetails
                    govActionID={detail.govActionID}
                    voteChoice={detail.voteChoice}
                    explorerLink={detail.explorerLink}
                    metadataAnchorURL={detail.metadataAnchorURL}
                    metadataAnchorHash={detail.metadataAnchorHash}
                    // onAcknowledgeChange={setAcknowledgedTx}
                    resetAckState={detail.resetAckState}
                    isWalletConnected={connected}
                  />
                </Box>

              ))}
              {connected && (
                <>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgedTxs} onChange={handleAcknowledgeChange} />}
                    label="Please acknowledge the validity of the vote details above*"
                  />
                  <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_VOTING_DETAILS} />
                </>
              )}
            </Paper>
          )}

          {/* Hierarchy Details Section */}
          {!isVoteTransaction && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Hierarchy Details
              </Typography>
              <HierarchyDetails
                onAcknowledgeChange={setAcknowledgedTxs}
              />
            </Paper>
          )}

          {/* Transaction JSON View */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Transaction Details
            </Typography>
            <Box
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 1,
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider"
              }}
            >
              {unsignedTransactionHex && (
                <ReactJsonPretty
                  data={unsignedTransaction ? unsignedTransaction.to_json() : {}}
                  theme={{
                    main: 'line-height:1.3;color:#000;background:#f8f9fa;',
                    key: 'color:#0070f3;',
                    string: 'color:#22863a;',
                    value: 'color:#22863a;',
                    boolean: 'color:#005cc5;',
                  }}
                />
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Sign Transaction Section */}
      <Box sx={{ mt: 4 }}>
        <SignTransactionButton 
          {...{ 
            wallet, 
            unsignedTransactionHex, 
            isVoteTransaction, 
            txValidationState, 
            voteValidationState, 
            acknowledgedTx: acknowledgedTxs, 
            connected,
            govActionIDs: voteTransactionDetails.map((detail: VoteTransactionDetails) => detail.govActionID), 
            stakeCredentialHash, 
            setMessage, 
            setSignature 
          }} 
        />
      </Box>

      {/* Signature Display */}
      {signature && (
        <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Signature
          </Typography>
          <Box
            sx={{
              backgroundColor: "#f8f9fa",
              p: 2,
              borderRadius: 1,
              cursor: "pointer",
              border: "1px solid",
              borderColor: "divider",
              '&:hover': {
                backgroundColor: "#f0f0f0"
              }
            }}
            onClick={() => {
              navigator.clipboard.writeText(signature);
              setMessage("Signature copied to clipboard!");
            }}
          >
            <Typography component="pre" sx={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: "0.875rem"
            }}>
              {signature}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <DownloadButton 
              signature={signature} 
              govActionID={ voteTransactionDetails.map((detail: VoteTransactionDetails) => detail.govActionID)[0] } 
              voterKeyHash={stakeCredentialHash} 
            />
          </Box>
        </Paper>
      )}

      {/* Error Message Display */}
      {message && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mt: 3, 
            borderRadius: 2,
            backgroundColor: "#ffebee",
            borderLeft: "4px solid #f44336"
          }}
        >
          <Typography color="error">
            {message}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
