// TransactionValidation.tsx - Consolidated validation components

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { TransactionChecks } from "./ValidationChecks";
import { VoteChecks } from "./VoteValidationChecks";
import CheckItem from "../shared/validationCheckItem";
import { TxValidationState, VotingProcedureValidationState } from "../../types/types";
import { HierarchyValidationState } from "../../types/transaction";

interface TransactionValidationProps {
  txValidation: TxValidationState;
  voteValidation?: VotingProcedureValidationState;
  hierarchyValidation?: HierarchyValidationState;
  isVoteTransaction: boolean;
}

export const TransactionValidation: React.FC<TransactionValidationProps> = ({
  txValidation,
  voteValidation,
  hierarchyValidation,
  isVoteTransaction
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Transaction Validation Section */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Transaction Validation Checks
        </Typography>
        <TransactionChecks {...txValidation} />
      </Paper>

      {/* Vote Validation Section */}
      {isVoteTransaction && voteValidation && (
        <Paper 
          elevation={2} 
          sx={{ 
            paddingLeft: 3,
            paddingRight: 3, 
            borderRadius: 2,
            maxHeight: 300, 
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
            Vote Validation Checks
          </Typography>
          
          <Box display="flex" justifyContent="space-between" gap={2}>
            <CheckItem 
              label="One voting procedure?" 
              tooltip="Ensures the transaction contains exactly one voting procedure" 
              value={voteValidation.oneVotingProcedure} 
            />
            <CheckItem
              label="Is the selected member the voter in the transaction?"
              tooltip="Verifies that the selected Constitutional Committee member's hot credential matches the voter in the transaction"
              value={voteValidation.isSelectedMemberVoter}
              textMsg={voteValidation.isSelectedMemberVoter === undefined ? "Select member" : undefined}
            />
          </Box>
          
          {voteValidation.votesValidation.map((validation, index) => (
            <Box key={index} sx={{ mb: 2, maxHeight: 500, overflowY: "auto" }}>
              <Typography variant="subtitle1" color="textSecondary">
                Vote no.{index + 1}
              </Typography>
              <VoteChecks {...validation} />
            </Box>
          ))}
        </Paper>
      )}

      {/* Hierarchy Validation Section */}
      {!isVoteTransaction && hierarchyValidation && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Hierarchy Validation Checks
          </Typography>
          
          <Box display="flex" justifyContent="space-between" gap={2}>
            <CheckItem
              label="Acknowledge hierarchy transaction details?"
              tooltip="Confirm that you understand the hierarchy transaction details"
              value={hierarchyValidation.isAcknowledged}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};
