"use client";

import { Box, Typography, Paper } from "@mui/material";
import { TransactionChecks } from "./txValidationChecks";
import { VoteTransactionChecks } from "./voteValidationChecks";
import { TxValidationState, VoteValidationState } from "../types/types";

interface TransactionValidationProps {
  txValidationState: TxValidationState;
  isVoteTransaction: boolean;
  voteValidationState: VoteValidationState[];
}

export const TransactionValidation = ({
  txValidationState,
  isVoteTransaction,
  voteValidationState,
}: TransactionValidationProps) => {
  return (
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
        <Paper elevation={2} sx={{ paddingLeft: 3, paddingRight: 3, borderRadius: 2, maxHeight: 300, overflowY: "auto" }}>
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
    </Box>
  );
};
