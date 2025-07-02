import { getCurrentEpoch,getCurrentEpochEndTime, getLiveGAData } from "@/app/utils/onChainData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = Number(searchParams.get("network")) ; //|| 1; 
  console.log(` Route Network: ${network}, type ${typeof network}`);
  //  if (!network || Number.isNaN(network) ) {
  //   console.log(network, "is not a valid network number");  
  //   return;
  // }

  try {
    console.log(`Fetching data for network EEE: ${network}`);
    const currentEpoch = await getCurrentEpoch(network);              // Step 1
    const endTime = await getCurrentEpochEndTime(currentEpoch,network);       // Step 2
    const liveGAData = await getLiveGAData(currentEpoch, endTime,network); // Step 3

    return Response.json({
      epoch: currentEpoch,
      endTime: endTime,
      liveGAData: liveGAData,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Optional: Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}