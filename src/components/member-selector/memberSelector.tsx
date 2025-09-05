"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CCMember {
  id: string;
  name: string;
  coldCredential: string;
  hotCredential: string;
}

// Create context for sharing selected credential across components
export const MemberContext = createContext<{
  selectedCCMember: CCMember | null;
  setSelectedCCMember: (credential: CCMember | null) => void;
}>({
  selectedCCMember: null,
  setSelectedCCMember: () => {},
});

export const useCredential = () => useContext(MemberContext);

// todo update these
const CREDENTIALS: CCMember[] = [
  {
    id: "cc1",
    name: "Atlantic Council",
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy9",
    hotCredential: "cc_hot1qvr7p6ms588athsgfd0uez5m9rlhwu3g9dt7wcxkjtr4hhsq6ytv2"
  },
  {
    id: "cc2", 
    name: "Japan Council",
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy8",
    hotCredential: "cc_hot1qv7fa08xua5s7qscy9zct3asaa5a3hvtdc8sxexetcv3unq7cfkq4"
  },
  {
    id: "cc3",
    name: "Eastern Council", 
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy3",
    hotCredential: "cc_hot1qvh20fuwhy2dnz9e6d5wmzysduaunlz5y9n8m6n2xen3pmqqvyw8v"
  },
  {
    id: "cc4",
    name: "Ktorz",
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy6",
    hotCredential: "cc_hot1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  },
  {
    id: "cc5",
    name: "Phil_uplc",
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy5",
    hotCredential: "cc_hot1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  },
  {
    id: "cc6",
    name: "Tingvard",
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy5",
    hotCredential: "cc_hot1ccccccccccccccccccccccccccccccccccccccccccccccccccccc"
  },
  {
    id: "cc7",
    name: "Ace Alliance",
    coldCredential: "cc_cold1z00saqaaue2pdkk7tv0e0el3zhxpl7ve259dj6y9q7plu5qwvxfy5",
    hotCredential: "cc_hot1ddddddddddddddddddddddddddddddddddddddddddddddddddddd"
  }
];

const MemberSelector = ({ 
  selectedCCMember, 
  setSelectedCCMember 
}: { 
  selectedCCMember: CCMember | null; 
  setSelectedCCMember: (credential: CCMember | null) => void; 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Initialize with no credential selected by default
  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const handleCredentialChange = (credentialId: string) => {
    if (credentialId === "") {
      setSelectedCCMember(null);
      setShowDetails(false);
      return;
    }
    
    const credential = CREDENTIALS.find(c => c.id === credentialId);
    setSelectedCCMember(credential || null);
    setShowDetails(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const truncateCredential = (credential: string, maxLength: number = 20) => {
    if (credential.length <= maxLength) return credential;
    return `${credential.substring(0, maxLength)}...`;
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} />
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Loading credentials...
        </Typography>
      </Box>
    );
  }

  return (
    
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      minWidth: 0,
      flexWrap: "nowrap"
    }}>
            {/* Credential Details Display */}
      {selectedCCMember && (
        <Fade in={showDetails} timeout={400}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            minWidth: 0,
            flexWrap: "nowrap"
          }}>
            {/* Cold Credential */}
            {/* <Tooltip title={`Cold Credential: ${selectedCCMember.coldCredential}`} arrow>
              <Chip
                label={`${truncateCredential(selectedCCMember.coldCredential, isMobile ? 12 : 16)}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.7rem',
                  height: 28,
                  minWidth: 'fit-content',
                  '& .MuiChip-label': { 
                    px: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px'
                  }
                }}
                onClick={() => copyToClipboard(selectedCCMember.coldCredential)}
                icon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
              />
            </Tooltip> */}

            {/* Hot Credential */}
            <Tooltip title={`Hot Credential: ${selectedCCMember.hotCredential}`} arrow>
              <Chip
                label={`${truncateCredential(selectedCCMember.hotCredential, isMobile ? 12 : 16)}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.7rem',
                  height: 28,
                  minWidth: 'fit-content',
                  '& .MuiChip-label': { 
                    px: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px'
                  }
                }}
                onClick={() => copyToClipboard(selectedCCMember.hotCredential)}
                icon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
              />
            </Tooltip>
          </Box>
        </Fade>
      )}
      {/* Credential Selector Dropdown */}
      <FormControl size="small" sx={{ minWidth: isMobile ? 140 : 160, flexShrink: 0 }}>
        <Select
          value={selectedCCMember?.id || ""}
          onChange={(e) => handleCredentialChange(e.target.value)}
          displayEmpty
          sx={{
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.5)',
            },
            '& .MuiSelect-icon': {
              color: 'rgba(255,255,255,0.7)',
            },
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <MenuItem value="">
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Selected CC Member
            </Typography>
          </MenuItem>
          {CREDENTIALS.map((credential) => (
            <MenuItem key={credential.id} value={credential.id}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {credential.name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MemberSelector;