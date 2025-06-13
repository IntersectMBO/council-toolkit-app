import { timeStamp } from "console";

export async function getCurrentEpoch(): Promise<number> {
  const response = await fetch(`https://api.koios.rest/api/v1/tip?select=epoch_no`);

  if (!response.ok) {
    throw new Error(`Error fetching tip: ${response.status}`);
  }

  const data = await response.json();
  return data[0].epoch_no;
  ;
}

export async function getEpochEndTime(epochNo: Number) {
  const response = await fetch(`https://api.koios.rest/api/v1/epoch_info?select=end_time&_epoch_no=${epochNo}&_include_next_epoch=false`);

  if (!response.ok) {
    throw new Error(`Error fetching epoch end time: ${response.status}`);
  }

  const data = await response.json();
  
  return data[0].end_time;
}