"use client";

import { Box, Typography, Paper, FormControlLabel, Checkbox } from "@mui/material";
import { VotingDetails } from "./votingDetails";
import { VoteTransactionDetails } from "../types/types";

interface VoteDetailsProps {
  isVoteTransaction: boolean;
  voteTransactionDetails: VoteTransactionDetails[];
  connected: boolean;
  acknowledgedTxs: boolean;
  onAcknowledgeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VoteDetails = ({
  isVoteTransaction,
  voteTransactionDetails,
  connected,
  acknowledgedTxs,
  onAcknowledgeChange,
}: VoteDetailsProps) => {
  if (!isVoteTransaction) return null;

  return (
    <Paper elevation={2} sx={{ paddingLeft: 3, paddingRight: 3, borderRadius: 2, maxHeight: 400, overflowY: "auto" }}>
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
            resetAckState={detail.resetAckState}
            isWalletConnected={connected}
          />
        </Box>
      ))}
      {connected && (
        <Box sx={{ display: 'flex', mt: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={acknowledgedTxs} onChange={onAcknowledgeChange} />}
            label="Acknowledge the correctness of the vote details"
          />
        </Box>
      )}
    </Paper>
  );
};
