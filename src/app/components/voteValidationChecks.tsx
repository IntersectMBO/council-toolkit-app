import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";

interface VoteTransactionChecksProps {
  isOneVote: boolean;
  isMetadataAnchorValid: boolean;
  hasICCCredentials: boolean;
}

export const VoteTransactionChecks = ({
  isOneVote,
  isMetadataAnchorValid,
  hasICCCredentials,
}: VoteTransactionChecksProps) => {
  return (
  
    <Box display="flex" justifyContent="space-between" gap={2}>

      <Box display="flex" flexDirection="column" gap={2} width="48%">

        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.IS_ONE_VOTE} />
          <Typography variant="body1" fontWeight="bold">
            Only one vote?: {isOneVote ? "✅" : "❌"}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.HAVE_ICC_CREDENTIAL} />
          <Typography variant="body1" fontWeight="bold">
            Is Intersect ICC credential?: {hasICCCredentials ? "✅" : "❌"}
          </Typography>
        </Box>

      </Box>

      <Box display="flex" flexDirection="column" gap={2} width="48%">

        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.CORRECT_METADATA_ANCHOR} />
          <Typography variant="body1" fontWeight="bold">
            Does the metadata match the provided hash?: {isMetadataAnchorValid ? "✅" : "❌"}
          </Typography>
        </Box>

      </Box>

    </Box>
  );
};
