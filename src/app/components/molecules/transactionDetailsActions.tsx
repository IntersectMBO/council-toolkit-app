import { Box, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import DownloadButton from "./downloadFiles";

interface TransactionDetailsActionsProps {
  unsignedTransaction: CSL.Transaction | null;
  setMessage: (message: string) => void;
}

const TransactionDetailsActions = ({ unsignedTransaction, setMessage }: TransactionDetailsActionsProps) => {
  const handleCopy = () => {
    if (unsignedTransaction) {
      const transactionJson = JSON.stringify(unsignedTransaction.to_json(), null, 2);
      navigator.clipboard.writeText(transactionJson);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Copy transaction JSON">
      <IconButton size="small" onClick={handleCopy}>
        <ContentCopyIcon fontSize="small" />
      </IconButton>
      </Tooltip>

      {unsignedTransaction && (
      <DownloadButton
        data={unsignedTransaction.to_json()}
        filename={`transaction-details-${new Date().toISOString()}.json`}
        icon={true}
      />
      )}
    </Box>
  );
};

export default TransactionDetailsActions;