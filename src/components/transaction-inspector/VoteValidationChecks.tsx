import { Box } from "@mui/material";
import { TOOLTIP_MESSAGES } from "../../lib/constants/infoMessages";
import CheckItem from "../shared/validationCheckItem";
import { VoteValidationState } from "../../types/types";
import Alert from "@mui/material/Alert";

export const VoteChecks = ({
  isMetadataAnchorValid,
  voteChange
}: VoteValidationState) => {
  
  return (
  
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Box display="flex" flexDirection="column" gap={2} width="48%">
        <CheckItem
          label="Does the metadata match the provided hash?"
          tooltip={TOOLTIP_MESSAGES.CORRECT_METADATA_ANCHOR}
          value={isMetadataAnchorValid}
        />
      </Box>

      {(voteChange.prevState && !voteChange.isVoteChange )&& (
        <Box display="flex" flexDirection="column" gap={2} width="48%">
          <Alert severity="warning" variant="outlined">
            You’ve already voted on this proposal.
          </Alert>
        </Box>
      )}
      {voteChange?.isVoteChange && (
        <Box display="flex" flexDirection="column" gap={2} width="48%"><CheckItem
          label="Is the vote being recast? "
          tooltip={TOOLTIP_MESSAGES.CORRECT_METADATA_ANCHOR}
          value={voteChange?.prevState !== null} />
          <Box sx={{ mt: -1, ml: 4 }}>
            <i>Note: Changing your vote will override your previous vote from {voteChange?.prevState} to {voteChange?.newState}</i>
          </Box>
        </Box>
      )}

    </Box>
  );
};
