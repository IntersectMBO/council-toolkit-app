"use client";

import { Box, Typography, Paper, TextField } from "@mui/material";
import FileUploader from "../common/fileUploader";

interface TransactionInputProps {
  unsignedTransactionHex: string;
  setUnsignedTransactionHex: (hex: string) => void;
  setMessage: (message: string) => void;
  resetAllValidationState: () => void;
  resetAllDetailsState: () => void;
  setSignature: (signature: string) => void;
}

export const TransactionInput = ({
  unsignedTransactionHex,
  setUnsignedTransactionHex,
  setMessage,
  resetAllValidationState,
  resetAllDetailsState,
  setSignature,
}: TransactionInputProps) => {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnsignedTransactionHex(e.target.value);
    resetAllValidationState();
    resetAllDetailsState();
    setSignature("");
  };

  const handleFileUpload = (hex: string) => {
    setUnsignedTransactionHex(hex);
    setSignature("");
    resetAllDetailsState();
  };

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
          onChange={handleHexChange}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: { xs: "stretch", sm: "flex-start" }, mt: 2 }}>
        <FileUploader
          setUnsignedTransactionHex={handleFileUpload}
          setMessage={setMessage}
        />
      </Box>
    </Paper>
  );
};
