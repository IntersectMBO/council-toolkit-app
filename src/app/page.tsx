"use client";

import { Wallet } from "./components/wallet";
import { TransactionButton } from "./components/transaction";
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Tooltip,
  Fade,
  Alert,
  Chip,
  Button,
  Skeleton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import Description from "@mui/icons-material/Description";
import Stream from "@mui/icons-material/Stream";
import Create from "@mui/icons-material/Create";
import HelpOutline from "@mui/icons-material/HelpOutline";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Image 
              src="/images/Logo.svg" 
              alt="Credential Manager Logo" 
              width={80} 
              height={80} 
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <Box>
              <Typography variant="h5" sx={{ display: { xs: 'none', sm: 'block' } }}>
                CC Toolkit
              </Typography>
              <Chip 
                label="Beta" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  mt: 0.5,
                  display: { xs: 'none', sm: 'inline-flex' }
                }} 
              />
            </Box>
          </Box>
        </Box>

        {/* Welcome Message
        <Paper elevation={1} sx={{ width: "100%", mt: 3, p: 2, borderRadius: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Welcome to the Credential Manager. Connect your wallet to get started.
          </Alert>
        </Paper> */}

        {/* Wallet Section with Paper background */}
        <Paper elevation={2} sx={{ width: "100%", mt: 3, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              Connect Wallet
            </Typography>
            <Tooltip title="Connect your wallet to interact with governance actions" arrow>
              <HelpOutline sx={{ ml: 1, color: 'text.secondary', cursor: 'pointer' }} />
            </Tooltip>
          </Box>
          {isLoading ? (
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          ) : (
            <Wallet />
          )}
        </Paper>

        {/* Quick Actions
        <Paper elevation={2} sx={{ width: "100%", mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              startIcon={<Description />}
              onClick={() => setTabValue(0)}
            >
              Inspect Transaction
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Stream />}
              onClick={() => setTabValue(1)}
            >
              View Live Actions
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Create />}
              onClick={() => setTabValue(2)}
            >
              Generate Rationale
            </Button>
          </Box>
        </Paper> */}

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
              <TransactionButton />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Live Actions
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: "600px", mx: "auto", mb: 2 }}>
                Monitor and interact with live governance actions in real-time.
              </Typography>
              <Chip 
                icon={<InfoOutlined />} 
                label="Coming Soon" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Rationale Generator
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: "600px", mx: "auto", mb: 2 }}>
                Create and verify rationales following proper CIP standards.
              </Typography>
              <Chip 
                icon={<InfoOutlined />} 
                label="Coming Soon" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          </TabPanel>
        </Paper>

        {/* Footer with improved styling */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          width: "100%", 
          mt: 4,
          mb: 2,
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
              Version 2.0.2 - IntersectMBO
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
