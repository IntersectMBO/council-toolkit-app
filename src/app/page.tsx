"use client";

import Wallet from "./components/wallet";
import { TransactionButton } from "./components/transaction";
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Fade,
  Chip,
  Skeleton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import Description from "@mui/icons-material/Description";
import Stream from "@mui/icons-material/Stream";
import Create from "@mui/icons-material/Create";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { LiveActions } from "./components/liveActions";
import { CreateRationale } from "./components/createRationale";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Fade in={true} timeout={500}>
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

export default function Home() {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTransactionHex, setPendingTransactionHex] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get version from environment variable
  const version = process.env.PACKAGE_VERSION;

  const resetPendingTransaction = () => {
    setPendingTransactionHex(null);
  };

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Check for pending transaction from URL
    const storedTransaction = localStorage.getItem('pendingTransactionHex');
    if (storedTransaction) {
      // Clean the transaction hex by removing whitespace and newlines
      const cleanTransaction = storedTransaction.trim();
      setPendingTransactionHex(cleanTransaction);
      // Clear it from localStorage after reading
      localStorage.removeItem('pendingTransactionHex');
    }
    
    return () => clearTimeout(timer);
  }, []);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box className="background-container">
      <Container maxWidth="lg" sx={{ 
        display: "flex", 
        backgroundColor: "white", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "flex-start", 
        minHeight: "100vh", 
        padding: 2,
        borderRadius: { xs: 0, sm: 2 },
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        my: { xs: 0, sm: 4 }
      }}>
        {/* Header */}
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
          <Box sx={{ display: "flex", justifyContent: 'space-between', alignItems: "center", width: "100%" ,gap: 2 }}>
            
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

        {/* Tabs Section */}
        <Paper elevation={3} sx={{ width: '100%', mt: 3, borderRadius: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: { xs: '0.8rem', sm: '1rem' },
                minHeight: { xs: '48px', sm: '64px' }
              }
            }}
          >
            <Tab 
              label={isMobile ? "Inspector" : "Transaction Inspector"} 
              icon={<Description />} 
              iconPosition="start"
              aria-label="Transaction Inspector Tab" 
            />
            <Tab 
              label={isMobile ? "Live" : "Live Actions"} 
              icon={<Stream />} 
              iconPosition="start"
              aria-label="Live Actions Tab"
            />
            <Tab 
              label={isMobile ? "Rationale" : "Rationale Generator"} 
              icon={<Create />} 
              iconPosition="start"
              aria-label="Rationale Generator Tab"
            />
          </Tabs>

          {/* Tab Panels with consistent styling */}
          <TabPanel value={tabValue} index={0}>
            {isLoading ? (
              <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Box>
            ) : (
              <TransactionButton pendingTransactionHex={pendingTransactionHex} resetPendingTransaction={resetPendingTransaction} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <LiveActions />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Vote Rationale Metadata Generator
              </Typography>
              {/* <Typography color="text.secondary" sx={{ maxWidth: "600px", mx: "auto", mb: 2 }}>
                Create and verify rationales following proper CIP standards.
              </Typography> */}
              <CreateRationale/>
              
            </Box>
          </TabPanel>
        </Paper>

        {/* Footer with dynamic version */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          width: "100%", 
          mt: 'auto',
          px: 2,
          py: 1,
          borderTop: "1px solid",
          borderColor: "divider"
        }}>
          <a 
            href="https://github.com/IntersectMBO/council-toolkit-app" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
            aria-label="View source code on GitHub"
          >
            <Image src="/images/github-mark.svg" alt="GitHub" width={24} height={24} />
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              View on GitHub
            </Typography>
          </a>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Version {version} - Intersect
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}