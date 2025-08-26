"use client";

import { 
  Container, 
  Box, 
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { TabLayout } from "./components/layout/TabLayout";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get version from environment variable
  const version = process.env.PACKAGE_VERSION;

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <Header isLoading={isLoading} />

        {/* Tabs Section */}
        <TabLayout />

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