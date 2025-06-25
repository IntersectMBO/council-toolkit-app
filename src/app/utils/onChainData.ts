import { timeStamp } from "console";

const mainnetUrl = "https://api.koios.rest/api/v1";
const preProdUrl = "https://preprod.koios.rest/api/v1"
 //if wallet is not connected, default to mainnet

export async function getCurrentEpoch(network: number): Promise<number> {
  const response = await fetch(`${network === 0 ? preProdUrl : mainnetUrl}/tip?select=epoch_no`);

  if (!response.ok) {
    throw new Error(`Error fetching tip: ${response.status}`);
  }

  const data = await response.json();
  return data[0].epoch_no;
  ;
}


export async function getCurrentEpochEndTime(epochNo: number, network: number) {

  console.log(`on network: ${network === 0 ? 'preprod' :'mainnet' }`);
  const response = await fetch(`${network === 0 ?preProdUrl : mainnetUrl}/epoch_info?select=end_time&_epoch_no=${epochNo}&_include_next_epoch=false`);

  if (!response.ok) {
    throw new Error(`Error fetching epoch end time: ${response.status}`);
  }

  const data = await response.json();
  
  return data[0].end_time;
}


export async function getLiveGAData(currentEpoch: number , currentEpochEndTime: any , network: number): Promise<any[]> {

  console.log(`Fetching live governance actions for epoch: ${currentEpoch} on network: ${network === 1 ? 'mainnet' : 'preprod'}`);
  const response = await fetch(`${network === 0 ?preProdUrl : mainnetUrl}/proposal_list?select=meta_json,proposal_id,proposal_type,expiration&expiration=gte.${currentEpoch}`)
  if (!response.ok){
    throw new Error(`Error fetching live governance actions: ${response.status}`);
  }

  const liveGAData = await response.json();
  const seen =new Set();
  const data = liveGAData.map((item : any )=> ({
    title: item.meta_json.body.title,
    proposal : item.proposal_id,
  }))
  .filter((item: any) => {
    if (seen.has(item.proposal)) {
      return false;
    }
    seen.add(item.proposal);
    return true;
  });
  
  return data;

}