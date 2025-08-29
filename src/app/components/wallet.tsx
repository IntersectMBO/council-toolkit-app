"use client";

import { useEffect, useState } from "react";
import "../globals.css";
import "@meshsdk/react/styles.css"
import { useWallet } from "@meshsdk/react";
import { BrowserWallet, deserializeAddress } from "@meshsdk/core";
import { 
  Box,
  Typography,
  Skeleton,
  Fade,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import Image from 'next/image';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';

const Wallet = () => {
  const [WalletComponent, setWalletComponent] = useState<any | null>(null);
  const [paymentCred, setPaymentCred] = useState<string | null>(null);
  const [stakeCred, setStakeCred] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [walletIcon, setWalletIcon] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        const { CardanoWallet } = await import("@meshsdk/react");
        setWalletComponent(() => CardanoWallet);
      } catch (error) {
        console.error("Error importing MeshProvider:", error);
        setError("Failed to load wallet component");
      }
    };
    run();
  }, []);

  const WalletWrapper = () => {
    const { wallet, connected, name, connect, disconnect, error: walletError } = useWallet();

    useEffect(() => {
      const handleWalletConnection = async () => {
        try {
          if (connected) {
            setIsConnecting(false);
            setError(null);
            console.log("Wallet connected:", name);
            const pubKey = await wallet.getRegisteredPubStakeKeys();
            console.log("Public key:", pubKey);
            const changeAddress = await wallet.getChangeAddress();
            const networkId = await wallet.getNetworkId();
            const iconSvg = (await BrowserWallet.getAvailableWallets()).find(wallet => wallet.id.toLowerCase() === name?.toLowerCase())?.icon || "";

            setPaymentCred(deserializeAddress(changeAddress).pubKeyHash);
            setStakeCred(deserializeAddress(changeAddress).stakeCredentialHash);
            setWalletNetwork(networkId === 0 ? "Testnet" : networkId === 1 ? "Mainnet" : "unknown");
            setWalletIcon(iconSvg);

            console.log("Payment Credential:", paymentCred);
            console.log("Stake Credential:", stakeCred);
          } else {
            console.log("Wallet not connected.");
            setPaymentCred(null);
            setStakeCred(null);
            setWalletNetwork(null);
            setWalletIcon("");
          }
        } catch (err) {
          console.error("Error handling wallet connection:", err);
          setError("Failed to connect to wallet");
        }
      };

      handleWalletConnection();
    }, [wallet, connected, name]);

    // Handle wallet errors
    useEffect(() => {
      if (walletError) {
        setError(String(walletError));
      }
    }, [walletError]);

    return (
      <Box className="mesh-wallet-container">
        <WalletComponent />
      </Box>
    );
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Paper
          elevation={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: theme.palette.error.main
          }}
        >
          <WarningIcon sx={{ fontSize: 20 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (WalletComponent === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Connection Status and Network Info */}
      {walletNetwork && (
        <Fade in={true} timeout={600}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              minWidth: isMobile ? 'auto' : 120
            }}
          >
          {/* Wallet Icon */}
            {walletIcon && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 24,
                height: 24,
                overflow: 'hidden'
              }}>
                <Image 
                  src={walletIcon} 
                  alt="Wallet Icon" 
                  className="wallet-icon" 
                  width={24} 
                  height={24}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              {walletNetwork}
            </Typography>

          </Box>
        </Fade>
      )}

      {/* Disconnected State - Show a subtle indicator */}
      {!walletNetwork && (
        <Fade in={true} timeout={400}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              minWidth: isMobile ? 'auto' : 120
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 18, opacity: 0.7 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              {isMobile ? 'Connect' : 'No Wallet Connected'}
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Wallet Connection Component */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <WalletWrapper />
      </Box>
    </Box>
  );
};

export default Wallet;
