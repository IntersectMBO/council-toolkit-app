// TransactionDetails.tsx - Consolidated transaction details components

import React, { useState } from "react";
import { Box, Paper, Typography, FormControlLabel, Checkbox, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import ReactJsonPretty from "react-json-pretty";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { VoteTransactionDetails } from "../../types/types";
import { VotingDetails } from "./VotingDetails";
import TransactionDetailsActions from "../shared/transactionDetailsActions";
import InfoWithTooltip from "../shared/infoHover";

interface TransactionDetailsProps {
  unsignedTransaction: CSL.Transaction | null;
  unsignedTransactionHex: string;
  voteDetails: VoteTransactionDetails[];
  isVoteTransaction: boolean;
  connected: boolean;
  onAcknowledgeChange: (checked: boolean) => void;
  onMessageChange: (message: string) => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  unsignedTransaction,
  unsignedTransactionHex,
  voteDetails,
  isVoteTransaction,
  connected,
  onAcknowledgeChange,
  onMessageChange
}) => {
  const [hierarchyCheckboxes, setHierarchyCheckboxes] = useState({
    ackAll: false,
  });

  const handleVoteAcknowledgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAcknowledgeChange(event.target.checked);
  };

  const handleHierarchyCheckBoxChange = (name: keyof typeof hierarchyCheckboxes) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCheckboxes = { ...hierarchyCheckboxes, [name]: event.target.checked };
    setHierarchyCheckboxes(updatedCheckboxes);
    onAcknowledgeChange(Object.values(updatedCheckboxes).every(Boolean));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Vote Details Section */}
      {isVoteTransaction && (
        <Paper 
          elevation={2} 
          sx={{ 
            paddingLeft: 3,
            paddingRight: 3, 
            borderRadius: 2,
            maxHeight: 400, 
            overflowY: "auto"  
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary" 
            sx={{
              position: "sticky",
              paddingTop: 3,
              top: 0,
              backgroundColor: "background.paper",
              zIndex: 2,
              pb: 1,
            }}
          >
            Vote Details
          </Typography>
          
          {voteDetails.map((detail, index) => (
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
                resetAckState={detail.resetAckState}
                isWalletConnected={connected}
              />
            </Box>
          ))}
          
          {connected && (
            <Box sx={{ display: 'flex', mt: 2 }}>
              <FormControlLabel
                control={<Checkbox onChange={handleVoteAcknowledgeChange} />}
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
          
          <TableContainer sx={{ mb: 3 }}>
            <Table sx={{ mt: 3 }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Are you sure you want to proceed?{" "}
                  </TableCell>
                  <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={<Checkbox checked={hierarchyCheckboxes.ackAll} onChange={handleHierarchyCheckBoxChange("ackAll")} />}
                      label="*"
                    />
                    <InfoWithTooltip info={'⚠️'} />
                  </TableCell>
                </TableRow>
                {/* Add other stuff here */}
              </TableBody>
            </Table>
          </TableContainer>
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
            setMessage={onMessageChange}
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
  );
};
