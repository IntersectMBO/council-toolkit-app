import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "../shared/infoHover";
import { TOOLTIP_MESSAGES } from "../../lib/constants/infoMessages";
import CheckItem from "../shared/validationCheckItem";
import { VoteValidationState } from "../../types/types";

export const VoteTransactionChecks = ({
  isMetadataAnchorValid,
  isSelectedMemberVoter
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

      <Box display="flex" flexDirection="column" gap={2} width="48%">
        <CheckItem
          label="Is the selected member the voter in the transaction?"
          tooltip="Verifies that the selected Constitutional Committee member's hot credential matches the voter in the transaction"
          value={isSelectedMemberVoter}
          textMsg={isSelectedMemberVoter === undefined ? "Select member" : undefined}
        />
      </Box>
    </Box>
  );
};
