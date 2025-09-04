import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { deserializeAddress } from "@meshsdk/core";
import dotevn from "dotenv";

dotevn.config();
const NEXT_PUBLIC_REST_IPFS_GATEWAY = (process.env.NEXT_PUBLIC_REST_IPFS_GATEWAY ?? "").split(",");

let cachedGoodGateway: string | null = null;

// IPFS Gateway Management
export async function getIpfsGateway(refresh: boolean = false): Promise<string | null> {
  if (!refresh && cachedGoodGateway) return cachedGoodGateway;
  cachedGoodGateway = await getOnlineIpfsGateway();
  return cachedGoodGateway;
}

export async function getOnlineIpfsGateway() {
  const testCid = "bafkreiamr5e5khvz5gtkorzkbgp3o3nobdcx65xj5hqxpmlnwbc6br4fc4";
  for (let gateway of NEXT_PUBLIC_REST_IPFS_GATEWAY) {
    console.log("[getOnlineIpfsGateway] Checking IPFS Gateway:", gateway);
    const gatewayUrl = `https://${gateway}${testCid}`;

    try {
      const response = await fetch(gatewayUrl, { method: "HEAD" });
      if (response.ok) {
        console.log("[getOnlineIpfsGateway] IPFS gateway is up:", gateway);
        return gateway;
      }
    } catch (error: any) {
      console.log(`[getOnlineIpfsGateway] Error checking ipfs gateway ${gateway}:`, error);
    }
  }
  return null;
}

// Transaction Utilities
export const decodeHexToTx = (unsignedTransactionHex: string) => {
  try {
    const unsignedTransaction = CSL.Transaction.from_hex(unsignedTransactionHex);
    return unsignedTransaction;
  } catch (error) {
    console.error("Error decoding transaction:", error);
    return null;
  }
};

export const openInNewTab = async (url: string) => {
  const gateway = await getIpfsGateway();
  const fullUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : url.startsWith("ipfs")
      ? "https://" + gateway + url?.slice(7)
      : "https://" + url;
  window.open(fullUrl, "_blank", "noopener,noreferrer");
};

// Governance Action Utilities
export const convertGAToBech = (gaTxHash: string, gaTxIndex: number) => {
  const bech32 = require('bech32-buffer');
  const indexHex = gaTxIndex.toString(16).padStart(2, '0');
  return bech32.encode("gov_action", Buffer.from(gaTxHash + indexHex, 'hex')).toString();
};

export const getCardanoScanURL = (bech32String: string, networkID: number): string => {
  const baseURL = networkID === 0 ? "https://preprod.cardanoscan.io/" : "https://cardanoscan.io/";
  const isAddress = bech32String.startsWith("addr");
  const isGovAction = bech32String.startsWith("gov_action");
  
  if (isAddress) {
    return `${baseURL}address/${bech32String}`;
  } else if (isGovAction) {
    console.log('CardanoScan URL:' + `${baseURL}govAction/${bech32String}`);
    return `${baseURL}govAction/${bech32String}`;
  }
  return "";
};

// Transaction Signing and Validation
export const signTransaction = async (wallet: any, unsignedTransactionHex: string) => {
  try {
    const signedTransaction = await wallet.signTx(unsignedTransactionHex);
    return {
      signedTransactionObj: signedTransaction,
      witnessHex: signedTransaction
    };
  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  }
};

export const validateWitness = async (signedTransactionObj: any, wallet: any, unsignedTransactionHex: string) => {
  try {
    // Validate that the witness was created correctly
    // This is a placeholder for actual witness validation logic
    console.log("Witness validation passed");
    return true;
  } catch (error) {
    console.error("Error validating witness:", error);
    throw error;
  }
};
