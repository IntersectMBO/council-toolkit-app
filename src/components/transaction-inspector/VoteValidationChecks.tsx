import { Box } from "@mui/material";
import { TOOLTIP_MESSAGES } from "../../lib/constants/infoMessages";
import CheckItem from "../shared/validationCheckItem";
import { VoteValidationState } from "../../types/types";

export const VoteChecks = ({
  isMetadataAnchorValid
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
    </Box>
  );
};
