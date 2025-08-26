"use client";

import { useState } from "react";
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Fade,
  Typography,
  Chip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Description from "@mui/icons-material/Description";
import Stream from "@mui/icons-material/Stream";
import Create from "@mui/icons-material/Create";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { LiveActions } from "../live-actions/liveActions";
import { TransactionButton } from "../transaction/TransactionButton";

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

export const TabLayout = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
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
        <TransactionButton />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <LiveActions />
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
  );
};
