import * as CSL from "@emurgo/cardano-serialization-lib-browser";
import { deserializeAddress } from "@meshsdk/core";
import dotevn from "dotenv";
import * as blake from 'blakejs';
dotevn.config();
const NEXT_PUBLIC_REST_IPFS_GATEWAY=process.env.NEXT_PUBLIC_REST_IPFS_GATEWAY;

/**
 * Decodes a transaction from a hex string to a CardanoSerializationLib Transaction object.
 * @param unsignedTransactionHex hex string of the unsigned transaction.
 * @returns {CSL.Transaction} the decoded transaction object, or null if the decoding fails.
 */

export const decodeHexToTx = (unsignedTransactionHex: string) => {
    console.log("decodeHexToTx");
    try {
      const unsignedTransaction = CSL.Transaction.from_hex(unsignedTransactionHex);
      return unsignedTransaction;
    } catch (error) {
      console.error("Error decoding transaction:", error);
      return null;
    }
  };


// convert basic GA ID to Bech32 as per CIP129 standard
// https://github.com/cardano-foundation/CIPs/tree/master/CIP-0129
export const convertGAToBech = (gaTxHash : string, gaTxIndex : number) => {
  const bech32 = require('bech32-buffer');

  // convert value index value to hex
  const indexHex = gaTxIndex.toString(16).padStart(2, '0');

  // return bech32 encoded GA ID
  return bech32.encode("gov_action", Buffer.from(gaTxHash+indexHex, 'hex')).toString();
}

/**
 * Get the CardanoScan URL for a given Bech32 string which can be an address or a gov id.
 * @param bech32 Bech32 string.
 * @param txNetworkID Network ID of the transaction.
 * @returns URL of the CardanoScan page.
 */
export const getCardanoScanURL = (bech32String: string, networkID: number): string => {
  const baseURL = networkID === 0 ? "https://preprod.cardanoscan.io/" : "https://cardanoscan.io/";
  const isAddress = bech32String.startsWith("addr");
  const isGovAction = bech32String.startsWith("gov_action");
  if (isAddress) {
    return `${baseURL}address/${bech32String}`;
  } else if (isGovAction) {
    console.log('CardanoScan URL:'+`${baseURL}govAction/${bech32String}`);
    return `${baseURL}govAction/${bech32String}`;
  }
  return "";
};

export const openInNewTab = (url: string) => {
  // Ensure the URL is absolute
  const fullUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : url.startsWith("ipfs")
      ? "https://" + NEXT_PUBLIC_REST_IPFS_GATEWAY + url?.slice(7)
      : "https://" + url;
  window.open(fullUrl, "_blank", "noopener,noreferrer");
};
 
export const getDataHashFromURI = async (anchorURL: string) => {
  if (anchorURL !== "") {
    console.log("Anchor data null")
  }
  if (anchorURL.startsWith("ipfs")) {
    anchorURL = "https://" + NEXT_PUBLIC_REST_IPFS_GATEWAY + anchorURL.slice(7);
  }
  // anchorURL='https://ipfs.io/ipfs/bafkreidsmyjjfrsvj3czrsu5roy2undco2bhhcnqdgbievolgbyi7lptxy'
  const data = await fetch(anchorURL);
  const text = await data.text();
  const hash = blake.blake2bHex(text,undefined, 32);
  console.log("Hash from text:", hash);
  return hash
}

export const signTransaction = async (wallet: any, unsignedTransactionHex: string) => {
  
  const signedTx = await wallet.signTx(unsignedTransactionHex, true);
  if (!signedTx) {
    throw new Error("Error signing transaction.");
  }
  const signedTransactionObj = decodeHexToTx(signedTx);
  const witnessHex = signedTransactionObj?.witness_set().vkeys()?.get(0)?.to_hex() || "";
    
  return { signedTransactionObj, witnessHex }; 
  //returning the decoded transaction object (we don't need to return the hex form)and the witness hex
  
};

export const validateWitness = async (signedTransactionObj: any, wallet: any, unsignedTransactionHex: string) => {
  const signature = signedTransactionObj?.witness_set().vkeys()?.get(0).signature().to_hex() || "";
  let providedVkey = signedTransactionObj?.witness_set().vkeys()?.get(0).vkey().to_hex() || "";

      // Remove the CBOR header
      providedVkey = providedVkey.substring(4);
      const providedVKeyObj = CSL.PublicKey.from_hex(providedVkey);

      const expectedVKeyHash = deserializeAddress(await wallet.getChangeAddress()).stakeCredentialHash;
      const providedVKeyHash = providedVKeyObj.hash().to_hex();

      if (providedVKeyHash !== expectedVKeyHash) {
        throw new Error("Wallet returned unexpected VKey.");
      }

      const txHash = CSL.FixedTransaction.from_hex(unsignedTransactionHex).transaction_hash().to_bytes();
      const validSignature = providedVKeyObj.verify(txHash, CSL.Ed25519Signature.from_hex(signature));

      if (!validSignature) {
        throw new Error("Wallet created an invalid signature.");
      }

      console.log("Signature is valid.");
};