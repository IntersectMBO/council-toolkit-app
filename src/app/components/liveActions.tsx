import React, { useEffect, useState } from "react";
import { getCurrentEpoch, getEpochEndTime } from "../utils/onChainData";

export const LiveActions = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [epochEndTime, setEpochEndTime] = useState<number | null>(null);
  const [liveGAData, setLiveGAData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const epoch = await getCurrentEpoch();
        const endTime = await getEpochEndTime(epoch);
        const gaRes = await fetch(
          `https://api.koios.rest/api/v1/proposal_list?select=meta_json,proposal_id,proposal_type,expiration&expiration=gte.${epoch}`
        );
        const gaData = await gaRes.json();

        setCurrentEpoch(epoch);
        setEpochEndTime(endTime);
        setLiveGAData(gaData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading Live Actions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Live Governance Actions</h2>
      <p>Current Epoch: {currentEpoch}</p>
      <p>
        Epoch End Time:{" "}
        {epochEndTime ? new Date(epochEndTime * 1000).toLocaleString() : "N/A"}
      </p>
      <p>
        Today's Timestamp: {new Date(Math.floor(Date.now() / 1000) * 1000).toLocaleString()}
      </p>
      <pre>{JSON.stringify(liveGAData, null, 2)}</pre>
    </div>
  );
};
