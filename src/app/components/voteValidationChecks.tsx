import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";
import CheckItem from "./molecules/validationCheckItem";
import { VoteValidationState } from "./types/types";

export const VoteTransactionChecks = ({
  isMetadataAnchorValid,
  // hasICCCredentials,
}: VoteValidationState) => {
  return (
  
    <Box display="flex" justifyContent="space-between" gap={2}>

      {/* <Box display="flex" flexDirection="column" gap={2} width="48%">
      
        <CheckItem
          label="Is Intersect ICC credential?"
          tooltip={TOOLTIP_MESSAGES.HAVE_ICC_CREDENTIAL}
          value={hasICCCredentials}
          textMsg="Connect wallet"
        />
      </Box> */}

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
