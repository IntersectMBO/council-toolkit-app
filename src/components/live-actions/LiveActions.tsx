import React, { useEffect, useState } from "react";
import { useNetwork } from "@meshsdk/react";
import { Box, Container, Divider, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { getCardanoScanURL } from "../../utils/cardano";

export const LiveActions = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [liveGAData, setLiveGAData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const net= useNetwork();
  const [endTime, setEndTime] = useState<number | null>(null);
  console.log("LiveActions is being called with net:", net);

  useEffect(() => {
    
    let isActive = true; // Track component mount status
    setLoading(true);

    console.log("Effect running with net AAAA:", net);
    const fetchData = async () => {
      try {
        console.log("Fetch with net AAAA:", net);
        const res = await fetch(`api/proxy?network=${net}`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();

        if (!isActive) return; // Check if component is still mounted

        const epochEndTime = Number(data.endTime);
        setCurrentEpoch(data.epoch);
        setLiveGAData(data.liveGAData);
        setEndTime(data.endTime-Math.floor(Date.now() / 1000)); // Calculate seconds until epoch end

      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isActive = false; // Cleanup function to set isActive to false
    };

  }, [net]);



  if (loading) return <div>Loading Live Actions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
  <Container maxWidth="md">
      <Box my={4}>
        <Paper elevation={2} sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            mt: 2
          }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                Network
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {net==0 ? "Preprod" : "Mainnet"}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                Current Epoch
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentEpoch !== null ? currentEpoch : <span style={{ color: '#aaa' }}>N/A</span>}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                Epoch Ends in 
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {endTime !== null
                  ? (() => {
                    const days = Math.floor(endTime / (60 * 60 * 24));
                    const hours = Math.floor((endTime % (60 * 60 * 24)) / (60 * 60));
                    const minutes = Math.floor((endTime % (60 * 60)) / 60);
                    return `${days}d ${hours}h ${minutes}m`;
                  })()
                  : <span style={{ color: '#aaa' }}>N/A</span>
                }
              </Typography>
            </Box>
          </Box>
        </Paper>
        {liveGAData && liveGAData.length > 0 ? (
          <Paper elevation={2} sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            mt: 2
          }}>
            <List>
              {liveGAData.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          > 
                          <a
                            href={`${getCardanoScanURL(item.proposal, net || 1)}`}
                            target="_blank"
                            style={{ color: "blue", textDecoration: "underline" }}>
                            {item.proposal}
                            </a>
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < liveGAData.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Paper elevation={2} sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            mt: 2
          }}>
            <Typography  variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>No governance actions available.</Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};
