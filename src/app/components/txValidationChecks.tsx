import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";

interface TransactionChecksProps {
  isPartOfSigners: boolean;
  hasNoCertificates: boolean;
  isSameNetwork: boolean;
  isInOutputPlutusData: boolean;
  isUnsignedTransaction: boolean;
}

export const TransactionChecks = ({
  isPartOfSigners,
  hasNoCertificates,
  isSameNetwork,
  isInOutputPlutusData,
  isUnsignedTransaction,
}: TransactionChecksProps) => {
  return (

    <Box display="flex" justifyContent="space-between" gap={2}>

      <Box display="flex" flexDirection="column" gap={2} width="48%">
        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.WALLET_NEEDS_TO_SIGN} />
          <Typography variant="body1" fontWeight="bold">
            Wallet needs to sign?: {isPartOfSigners ? "✅" : "❌"}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.TRANSACTION_IS_UNSIGNED} />
          <Typography display="flex" flexDirection="column" width="45%" variant="body1" fontWeight="bold">
          Transaction is unsigned?: {isUnsignedTransaction ? "✅" : "❌"}
        </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.IS_SAME_NETWORK} />
          <Typography variant="body1" fontWeight="bold">
            Transaction and wallet on the same network?: {isSameNetwork ? "✅" : "❌"}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={2} width="48%">

        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.HAVE_CERTIFICATES}/>
          <Typography variant="body1" fontWeight="bold">
            Has no certificates?: {hasNoCertificates ?  "✅" : "❌"}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <InfoWithTooltip info={TOOLTIP_MESSAGES.CORRECT_PLUTUS_DATA} />
          <Typography variant="body1" fontWeight="bold">
            Is voting key in plutus data?: {isInOutputPlutusData ? "✅" : "❌"}
          </Typography>
        </Box>

      </Box>
    </Box>
  );
};
