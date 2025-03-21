import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";
import CheckItem from "./molecules/validationCheckItem";
import { TxValidationState } from "./types/types";

export const TransactionChecks = ({
  isPartOfSigners,
  hasNoCertificates,
  isSameNetwork,
  isInOutputPlutusData,
  isUnsignedTransaction,
}: TxValidationState) => {
  return (

    <Box display="flex" justifyContent="space-between" gap={2}>

      <Box display="flex" flexDirection="column" gap={2} width="48%">
        <CheckItem 
          label="Wallet needs to sign?" 
          tooltip={TOOLTIP_MESSAGES.WALLET_NEEDS_TO_SIGN} 
          value={isPartOfSigners} 
        />
        <CheckItem
          label="Transaction is unsigned?"
          tooltip={TOOLTIP_MESSAGES.TRANSACTION_IS_UNSIGNED}
          value={isUnsignedTransaction}
        />
        <CheckItem
          label="Transaction and wallet on the same network?"
          tooltip={TOOLTIP_MESSAGES.IS_SAME_NETWORK}
          value={isSameNetwork} 
        />
      </Box>

      <Box display="flex" flexDirection="column" gap={2} width="48%">
        <CheckItem
          label="Has no certificates?"
          tooltip={TOOLTIP_MESSAGES.HAVE_CERTIFICATES}
          value={hasNoCertificates}
        />
        <CheckItem
          label="Is voting key in plutus data?"
          tooltip={TOOLTIP_MESSAGES.CORRECT_PLUTUS_DATA}
          value={isInOutputPlutusData}
        />
      </Box>
    </Box>
  );
};
