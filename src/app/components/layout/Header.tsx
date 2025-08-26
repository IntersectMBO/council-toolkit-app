"use client";

import { Box, Typography, Chip, Skeleton } from "@mui/material";
import Wallet from "../wallet/wallet";

interface HeaderProps {
  isLoading: boolean;
}

export const Header = ({ isLoading }: HeaderProps) => {
  return (
    <Box sx={{
      width: "100%",
      background: "linear-gradient(45deg, #1976d2, #2196f3)",
      marginTop: { xs: 0, sm: "20px" },
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: { xs: "0", sm: "8px 8px 0 0" },
      color: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <Box sx={{ display: "flex", justifyContent: 'space-between', alignItems: "center", width: "100%", gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Chip 
            label="Beta" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              mt: 0.5,
              fontSize: '0.6rem',
              height: 18,
              ml: 0.5,
            }} 
          />
          <Typography variant="h5" sx={{ lineHeight: 1, ml: 2 }}>
            🗳️ Constitutional Committee Toolkit
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
            data-testid="loading-skeleton"
          />
        ) : (
          <Wallet />
        )}
      </Box>
    </Box>
  );
};
