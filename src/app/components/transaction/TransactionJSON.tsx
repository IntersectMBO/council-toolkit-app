"use client";

import { Box, Typography, Paper } from "@mui/material";
import ReactJsonPretty from "react-json-pretty";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import TransactionDetailsActions from "../common/transactionDetailsActions";

interface TransactionJSONProps {
  unsignedTransaction: CSL.Transaction | null;
  unsignedTransactionHex: string;
  setMessage: (message: string) => void;
}

export const TransactionJSON = ({
  unsignedTransaction,
  unsignedTransactionHex,
  setMessage,
}: TransactionJSONProps) => {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary">
          Transaction Details
        </Typography>
        <TransactionDetailsActions 
          unsignedTransaction={unsignedTransaction}
          setMessage={setMessage}
        />
      </Box>
      
      <Box
        sx={{
          backgroundColor: "#f8f9fa",
          borderRadius: 1,
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        {unsignedTransactionHex && (
          <ReactJsonPretty
            data={unsignedTransaction ? unsignedTransaction.to_json() : {}}
            theme={{
              main: 'line-height:1.3;color:#000;background:#f8f9fa;',
              key: 'color:#0070f3;',
              string: 'color:#22863a;',
              value: 'color:#22863a;',
              boolean: 'color:#005cc5;',
            }}
          />
        )}
      </Box>
    </Paper>
  );
};
