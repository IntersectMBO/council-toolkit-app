import { Box, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import * as CSL from "@emurgo/cardano-serialization-lib-browser";

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

  const handleDownload = () => {
    if (unsignedTransaction) {
      const transactionJson = JSON.stringify(unsignedTransaction.to_json(), null, 2);
      const blob = new Blob([transactionJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction-details-${Date.now()}.json`; // todo change this to a hash of the tx
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Copy transaction JSON">
        <IconButton size="small" onClick={handleCopy}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Download transaction JSON">
        <IconButton size="small" onClick={handleDownload}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TransactionDetailsActions;