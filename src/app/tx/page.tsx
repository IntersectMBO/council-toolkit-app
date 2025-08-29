"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Container, Alert } from '@mui/material';

export default function TransactionPage() {
  const router = useRouter();
  const [transactionHex, setTransactionHex] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get transaction hex from URL hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      let hex = hash.substring(1); // Remove the #
      hex = hex.trim();
      
      if (hex && hex.length > 0) {
        console.log('Loading transaction:', hex.substring(0, 50) + '...');
        setTransactionHex(hex);

        // Store the clean transaction hex in localStorage
        localStorage.setItem('pendingTransactionHex', hex);

        // Show success message briefly, then redirect
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      } else {
        setError('Invalid transaction hex in URL');
        setIsLoading(false);
      }
    } else {
      setError('No transaction found in URL');
      setIsLoading(false);
    }
  }, [router]);

  if (error) {
    return (
      <Box className="background-container">
        <Container maxWidth="lg" sx={{ 
          display: "flex", 
          backgroundColor: "white", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "100vh", 
          padding: 2,
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          my: { xs: 0, sm: 4 }
        }}>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
            {error}
          </Alert>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Please check the URL and try again.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="background-container">
      <Container maxWidth="lg" sx={{ 
        display: "flex", 
        backgroundColor: "white", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh", 
        padding: 2,
        borderRadius: { xs: 0, sm: 2 },
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        my: { xs: 0, sm: 4 }
      }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 3, color: '#2196f3' }} />
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Processing transaction: {transactionHex?.substring(0, 20)}...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
