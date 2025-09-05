"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { deserializeAddress } from "@meshsdk/core";
import { TextField, Box, Typography, Container, Paper, FormControlLabel, Checkbox, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
import TransactionDetailsActions from "./molecules/transactionDetailsActions";
import txWitnessTemplate from "../../templates/cardano-file-templates/txWitnessTemplate.json";
import { useCredential } from "./memberSelector";

export const TransactionButton = ({ 
  pendingTransactionHex, 
  resetPendingTransaction 
}: { 
  pendingTransactionHex?: string | null;
  resetPendingTransaction: () => void;
}) => {
  const { wallet, connected } = useWallet();
  const { selectedCCMember } = useCredential();
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
  const [transactionHash, setTransactionHash] = useState<string>("");

  // add other transactions validations and details here

  const resetAllDetailsState = useCallback(() => {
    setVoteTransactionDetails([defaultVoteTransactionDetails]);
    setTransactionHash("");
    // add hierarchy details reset here
    // add other transaction details reset here
  }, []);

  const resetAllValidationState = useCallback(() => {
    setTxValidationState((prev) => ({
      ...prev,
      defaultTxValidationState,
    }));
    setVoteValidationState([defaultVoteValidationState]);
    // add other transactions validations here
  }, []);

  const resetAllStates = useCallback(() => {
    setMessage("");
    setUnsignedTransactionHex("");
    setUnsignedTransaction(null);
    setSignature("");
    resetAllDetailsState();
    resetAllValidationState();
    setAcknowledgedTxs(false);
    setIsVoteTransaction(false);
    // Note: resetPendingTransaction is handled separately to avoid conflicts
  }, [resetAllDetailsState, resetAllValidationState]);
  
  const walletRef = useRef(wallet);

  useEffect(() => {
    walletRef.current = wallet; // Always keep the latest wallet, but without causing re-renders
  }, [wallet]);
  
  useEffect(() => {
    if (!connected) {
      console.log("[useEffect] Wallet not connected - resetting all state");
      resetAllStates();
    }
  }, [connected, resetAllStates]);

  // Generic transaction validation
  const processTransactionBody = useCallback(async (transactionBody: any, unsignedTransaction: CSL.Transaction) => {

    // Get network ID from output address
    const transactionNetworkID = transactionBody.outputs().get(0).address().to_bech32().startsWith("addr_test1") ? 0 : 1;
    
    // Set certificate validation state and unsigned state
    const baseTxValidationState: TxValidationState = {
      hasNoCertificates: !voteTxValidationUtils.hasCertificates(transactionBody),
      isUnsignedTransaction: voteTxValidationUtils.isUnsignedTransaction(unsignedTransaction)
    };

    // Get the key voting details of the transaction
    const votingProcedures = transactionBody.to_js_value().voting_procedures;
    console.log("[processTransactionBody] Voting Procedures:", votingProcedures);
    
    // if a vote transaction
    // todo: right now we just assume that there is one voting procedure
    // each voting procedure can have multiple votes inside of it
    if (votingProcedures) {
      setIsVoteTransaction(true);
      console.log("[processTransactionBody] Transaction is a vote transaction, applying vote validations");

      const votes = votingProcedures[0].votes; // todo work for multiple procedures
      const voteValidations: VoteValidationState[] = [];
      const voteDetails: VoteTransactionDetails[] = [];
      
      for (const vote of votes) {
        console.log("[processTransactionBody] Vote:", vote);

        const govActionID = convertGAToBech(vote.action_id.transaction_id, vote.action_id.index);
        const voteChoice = (vote.voting_procedure.vote === 'Yes' ? 'Constitutional' : vote.voting_procedure.vote === 'No' ? 'Unconstitutional' : 'Abstain');
        const metadataURL = vote.voting_procedure.anchor?.anchor_url ?? "unavailable";
        const metadataHash = vote.voting_procedure.anchor?.anchor_data_hash ?? "unavailable";     
 
        voteValidations.push({
          isMetadataAnchorValid: await voteTxValidationUtils.checkMetadataAnchor(metadataURL, metadataHash),
          isSelectedMemberVoter: selectedCCMember ? 
            voteTxValidationUtils.isSelectedMemberVoter(votes, selectedCCMember.hotCredential) : 
            undefined,
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
      // set state
      setVoteTransactionDetails(voteDetails);
      setVoteValidationState(voteValidations);
    } else {
      setIsVoteTransaction(false);
      console.log("[processTransactionBody] Transaction is not a vote transaction");
      // todo: add other types of transaction
      // todo: add hierarchy details
      // todo: add hierarchy validation checks
    }

    return baseTxValidationState;
  }, []);

  // Wallet related validations
  const processWalletValidation = useCallback(async (baseTxValidationState: TxValidationState, transactionBody: any) => {
    if (connected) {
      const network = await walletRef.current.getNetworkId();
      const changeAddress = await walletRef.current.getChangeAddress();
      // todo update to also check other wallet credentials
      // for now just check with stake credential
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
  }, [connected, walletRef]);

  // Get transaction hash from hex
  const getTransactionHash = useCallback((hex: string) => {
    try {
      const fixedTx = CSL.FixedTransaction.from_hex(hex);
      return fixedTx.transaction_hash().to_hex();
    } catch (error) {
      console.error("Error getting transaction hash:", error);
      return "";
    }
  }, []);

  // Process inputted transaction
  // apply all validation functions
  const processTransaction = useCallback(async (hex: string, isFromURL: boolean = false) => {
    try {
      if (isFromURL) {
        console.log("[processWalletValidation] Processing transaction from URL:", hex.substring(0, 50) + "...");
      } else {
        console.log("[processWalletValidation] Unsigned transaction");
      }

      const unsignedTransaction = decodeHexToTx(hex);
      if (!unsignedTransaction) throw new Error("Invalid transaction format.");
      setUnsignedTransaction(unsignedTransaction);
      
      // Set transaction hash
      const txHash = getTransactionHash(hex);
      setTransactionHash(txHash);

      if (isFromURL) {
        console.log("[processWalletValidation] Transaction loaded successfully from URL");
        setMessage("Transaction loaded!");
      }

      // Check that there is a transaction body
      const transactionBody = unsignedTransaction.body();
      if (!transactionBody) {
        setMessage("Transaction body is null.");
        throw new Error("Transaction body is null.");
      }      
      // Process transaction and get base transaction validation state
      const baseTxValidationState = await processTransactionBody(transactionBody, unsignedTransaction);
      // Process transaction through wallet related validation
      await processWalletValidation(baseTxValidationState, transactionBody);

    } catch (error) {
      console.error(`Error ${isFromURL ? 'processing transaction from URL' : 'validating transaction'}:`, error);
      const errorMessage = isFromURL 
        ? `Failed to process transaction from URL: ${error}`
        : `Transaction validation failed. ${error}`;
      setMessage(errorMessage);
      
      if (!isFromURL) {
        resetAllValidationState();
        resetAllDetailsState();
      }
    }
  }, [processTransactionBody, processWalletValidation, resetAllValidationState, resetAllDetailsState, getTransactionHash]);

// Process the transaction
  useEffect(() => {    
    // If there's a pending transaction from the URL
    if (pendingTransactionHex && !unsignedTransactionHex) {
      // Clear any previous errors
      setMessage("");
      console.log("[useEffect] Processing pending transaction from URL");
      setUnsignedTransactionHex(pendingTransactionHex);
      processTransaction(pendingTransactionHex, true);
      // Process the transaction after state update
      setTimeout(() => {
        // Reset the pending transaction after processing
        resetPendingTransaction();
      }, 200);
    // else if the user has uploaded or pasted a transaction
    } else if (!pendingTransactionHex && unsignedTransactionHex) {
      console.log("[useEffect] Processing user inputted transaction");
      // Clear any previous errors
      setMessage("");
      processTransaction(unsignedTransactionHex, false);
    }

    // todo: add refresh/re-validate when a member is selected

  },[pendingTransactionHex, unsignedTransactionHex, processTransaction, resetPendingTransaction]);

  // URL sharing functionality
  const getShareableUrl = () => {
    if (!unsignedTransactionHex) return '';
    return `${window.location.origin}/tx#${unsignedTransactionHex}`;
  };

  const copyShareableUrl = async () => {
    const url = getShareableUrl();
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Shareable URL copied to clipboard!");
      } catch (err) {
        console.error('Failed to copy URL:', err);
        setMessage("Failed to copy URL to clipboard");
      }
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
          
          {/* Copy button - only show when there's a transaction */}
          {unsignedTransactionHex && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: "fit-content" }}>
              <Tooltip title="Copy shareable URL">
                <IconButton
                  onClick={copyShareableUrl}
                  sx={{ 
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
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

          {/* Message Display */}
          {message && (
            <Box sx={{ mt: 2 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 1,
                  backgroundColor: message.includes('failed') || message.includes('error') 
                    ? 'rgba(244, 67, 54, 0.1)' 
                    : 'rgba(76, 175, 80, 0.1)',
                  border: `1px solid ${
                    message.includes('failed') || message.includes('error') 
                      ? 'rgba(244, 67, 54, 0.3)' 
                      : 'rgba(76, 175, 80, 0.3)'
                  }`
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: message.includes('failed') || message.includes('error') 
                      ? 'error.main' 
                      : 'success.main',
                    fontWeight: 500
                  }}
                >
                  {message}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Transaction Hash Display - Integrated */}
          {transactionHash && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Transaction Hash:
                </Typography>
                <Tooltip title="Copy transaction hash">
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(transactionHash);
                      setMessage("Transaction hash copied to clipboard!");
                    }}
                    sx={{ 
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  backgroundColor: "#f8f9fa",
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  fontSize: "0.875rem"
                }}
              >
                {transactionHash}
              </Typography>
            </Box>
          )}
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
                <Box sx={{ display: 'flex',mt: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={acknowledgedTxs} onChange={handleAcknowledgeChange} />}
                    label="Acknowledge the correctness of the vote details"
                  />
                </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                Transaction Details
              </Typography>
              <TransactionDetailsActions 
                unsignedTransaction={unsignedTransaction}
                setMessage={setMessage}
              />
            </Box>
            
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
              {...(() => {
                const govId = voteTransactionDetails[0]?.govActionID;
                const filename =
                  (govId?.substring(0, 15) || "unknown") +
                  "-vote-from-" +
                  (stakeCredentialHash?.substring(0, 6) || "unknown");

                return {
                  data: {
                    ...txWitnessTemplate,
                    govActionID: govId,
                    voterKeyHash: stakeCredentialHash,
                    cborHex: signature,
                  },
                  filename,
                  fileExtension: "witness",
                };
              })()}
            />
          </Box>
        </Paper>
      )}

      {/* Error Message Display */}
      {/* todo, make it nicer, use a dedicate error message alert*/}
      {/* {message && (
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
      )} */}
    </Container>
  );
};
