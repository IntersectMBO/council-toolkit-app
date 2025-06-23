import { timeStamp } from "console";

const mainnetUrl = "https://api.koios.rest/api/v1";
const preProdUrl = "https://preprod.koios.rest/api/v1"
 //if wallet is not connected, default to mainnet

export async function getCurrentEpoch(network: number = 1): Promise<number> {
  const response = await fetch(`${network === 1 ? mainnetUrl : preProdUrl}/tip?select=epoch_no`);

  if (!response.ok) {
    throw new Error(`Error fetching tip: ${response.status}`);
  }

  const data = await response.json();
  return data[0].epoch_no;
  ;
}

export async function getCurrentEpochEndTime(epochNo: Number,network: number = 1) {
  const response = await fetch(`${network === 1 ? mainnetUrl : preProdUrl}/epoch_info?select=end_time&_epoch_no=${epochNo}&_include_next_epoch=false`);

  if (!response.ok) {
    throw new Error(`Error fetching epoch end time: ${response.status}`);
  }

  const data = await response.json();
  
  return data[0].end_time;
}


export async function getLiveGAData(currentEpoch: number , currentEpochEndTime: any , network: number = 1): Promise<any[]> {
  const response = await fetch(`${network === 1 ? mainnetUrl : preProdUrl}/proposal_list?select=meta_json,proposal_id,proposal_type,expiration&expiration=gte.${currentEpoch}`)
  if (!response.ok){
    throw new Error(`Error fetching live governance actions: ${response.status}`);
  }

  const liveGAData = await response.json();

  // return liveGAData.map((item: any) => ({
  //   ...item,
  //   expiration: new Date(item.expiration * 1000).toLocaleString(),
  //   currentEpoch: currentEpoch,
  //   currentEpochEndTime: new Date(currentEpochEndTime * 1000).toLocaleString(),
  // }));
  return liveGAData;

}