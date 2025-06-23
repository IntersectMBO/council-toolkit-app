import React, { useEffect, useState } from "react";
import { useNetwork } from "@meshsdk/react";

export const LiveActions = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [epochEndTime, setEpochEndTime] = useState<number | null>(null);
  const [liveGAData, setLiveGAData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const net= useNetwork();

  useEffect(() => {
  
    const fetchData = async () => {
      try {
        const res = await fetch("api/proxy?network=${net}");
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        setCurrentEpoch(data.epoch);
        setEpochEndTime(data.endTime);
        setLiveGAData(data.liveGAData);
      } catch (err: any) {
        setError(err.message || "Unknown error");
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
      <h2>Live Governance Actions on {net}</h2>
      <p>Current Epoch: {currentEpoch}</p>
      <p>
        Epoch End Time:{" "}
        {epochEndTime ? new Date(epochEndTime * 1000).toLocaleString() : "N/A"}
      </p>
      <p>
        Today&apos;s Timestamp: {new Date(Math.floor(Date.now() / 1000) * 1000).toLocaleString()}
      </p>
      <pre>{JSON.stringify(liveGAData, null, 2)}</pre>
    </div>
  );
};
