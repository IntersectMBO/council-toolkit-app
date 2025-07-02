import React, { useEffect, useState } from "react";
import { useNetwork } from "@meshsdk/react";
import { Box, Container, Divider, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";

export const LiveActions = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [epochEndTime, setEpochEndTime] = useState<number | null>(null);
  const [liveGAData, setLiveGAData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const net= useNetwork();
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

        setCurrentEpoch(data.epoch);
        setEpochEndTime(data.endTime);
        setLiveGAData(data.liveGAData);
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
        <Typography variant="h4" gutterBottom>
          Live Governance Actions on {net}
        </Typography>

        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1">
            <strong>Current Epoch:</strong> {currentEpoch}
          </Typography>
          <Typography variant="body1">
            <strong>Epoch End Time:</strong>{" "}
            {epochEndTime
              ? new Date(epochEndTime * 1000).toLocaleString()
              : "N/A"}
          </Typography>
          <Typography variant="body1">
            <strong>Today's Timestamp:</strong>{" "}
            {new Date(
              Math.floor(Date.now() / 1000) * 1000
            ).toLocaleString()}
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Governance Proposals
        </Typography>

        {liveGAData && liveGAData.length > 0 ? (
          <Paper elevation={2} sx={{ p: 2 }}>
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
                            Proposal ID: {item.proposal}
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
          <Typography>No governance actions available.</Typography>
        )}
      </Box>
    </Container>
  );
};
