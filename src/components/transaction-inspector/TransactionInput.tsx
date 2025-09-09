// TransactionInput.tsx - Consolidated transaction input components

import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Tooltip 
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TransactionProcessor } from "../../services/transactionProcessor";
import FileUploader from "../shared/fileUploader";

interface TransactionInputProps {
  onTransactionProcess: (hex: string) => void;
  pendingTransactionHex?: string | null;
  resetPendingTransaction: () => void;
  message: string;
  onMessageChange: (message: string) => void;
  transactionHash: string;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({
  onTransactionProcess,
  pendingTransactionHex,
  resetPendingTransaction,
  message,
  onMessageChange,
  transactionHash
}) => {
  const [unsignedTransactionHex, setUnsignedTransactionHex] = useState("");

  // Handle pending transaction from URL
  useEffect(() => {
    if (pendingTransactionHex && !unsignedTransactionHex) {
      setUnsignedTransactionHex(pendingTransactionHex);
      onTransactionProcess(pendingTransactionHex);
      
      // Reset pending transaction after processing
      setTimeout(() => {
        resetPendingTransaction();
      }, 200);
    }
  }, [pendingTransactionHex, unsignedTransactionHex, onTransactionProcess, resetPendingTransaction]);

  const handleTransactionChange = (hex: string) => {
    setUnsignedTransactionHex(hex);
    onMessageChange(""); // Clear any previous messages
    onTransactionProcess(hex);
  };

  const handleFileUpload = (hex: string) => {
    setUnsignedTransactionHex(hex);
    onMessageChange(""); // Clear any previous messages
    onTransactionProcess(hex);
  };

  const copyShareableUrl = async () => {
    const url = TransactionProcessor.getShareableUrl(unsignedTransactionHex);
    if (url) {
      const success = await TransactionProcessor.copyToClipboard(url);
      onMessageChange(success ? "Shareable URL copied to clipboard!" : "Failed to copy URL to clipboard");
    }
  };

  const copyTransactionHash = async () => {
    const success = await TransactionProcessor.copyToClipboard(transactionHash);
    onMessageChange(success ? "Transaction hash copied to clipboard!" : "Failed to copy transaction hash");
  };

  const isError = message.includes('failed') || message.includes('error');

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Transaction Input
      </Typography>
      
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <TextField
          type="string"
          label="Enter Hex Encoded Transaction"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={unsignedTransactionHex}
          onChange={(e) => handleTransactionChange(e.target.value)}
          sx={{ flex: 1 }}
        />
        
        {/* Copy button - only show when there's a transaction */}
        {unsignedTransactionHex && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: "fit-content" }}>
            <Tooltip title="Copy shareable URL">
              <IconButton
                onClick={copyShareableUrl}
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      
      <Box sx={{ display: "flex", alignItems: { xs: "stretch", sm: "flex-start" }, mt: 2 }}>
        <FileUploader 
          setUnsignedTransactionHex={handleFileUpload}
          setMessage={onMessageChange}
        />
      </Box>

      {/* Message Display */}
      {message && (
        <Box sx={{ mt: 2 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              borderRadius: 1,
              backgroundColor: isError 
                ? 'rgba(244, 67, 54, 0.1)' 
                : 'rgba(76, 175, 80, 0.1)',
              border: `1px solid ${
                isError 
                  ? 'rgba(244, 67, 54, 0.3)' 
                  : 'rgba(76, 175, 80, 0.3)'
              }`
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: isError ? 'error.main' : 'success.main',
                fontWeight: 500
              }}
            >
              {message}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Transaction Hash Display */}
      {transactionHash && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
              Transaction Hash:
            </Typography>
            <Tooltip title="Copy transaction hash">
              <IconButton
                size="small"
                onClick={copyTransactionHash}
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "monospace",
              wordBreak: "break-all",
              backgroundColor: "#f8f9fa",
              p: 1.5,
              borderRadius: 1,
              border: "1px solid #e0e0e0",
              fontSize: "0.875rem"
            }}
          >
            {transactionHash}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
