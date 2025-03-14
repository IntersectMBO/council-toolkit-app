import {getDataHashFromURI} from "../utils/txUtils";
import * as CSL from "@emurgo/cardano-serialization-lib-browser";

/**
 * Checks if the given stake credential is part of the required signers of the transaction.
 * @param transactionBody the body of the transaction to check.
 * @param stakeCred the stake credential to check.
 * @returns {boolean} true if the stake credential is part of the required signers, false otherwise.
 */
export const isPartOfSigners = (transactionBody: any, stakeCred: string)  => {
    console.log("isPartOfSigners");
    //wallet needs to sign
    // Check if signer part of plutus output data
    const requiredSigners = transactionBody.required_signers();

    if (!requiredSigners || requiredSigners.len() === 0) {
        console.log("No required signers in the transaction.");

    } else if (requiredSigners?.to_json().includes(stakeCred)) {
        console.log("Required signers in the transaction:", requiredSigners?.to_json());
        return true;
    }else{
        console.log("Not part of the required signers.");
    }
    return false;
}

/**
 * Checks if the transaction has one vote set.
 * @param transactionBody the body of the transaction to check.
 * @returns {boolean} true if the transaction has one vote set, false otherwise.
 */
export const hasOneVoteOnTransaction = (transactionBody: any): boolean => {
    console.log("hasOneVoteOnTransaction");
    const votingProcedure = transactionBody.to_js_value().voting_procedures?.[0];
    const votes = votingProcedure?.votes;
    const voteCount = votes?.length;

    if (voteCount === 1) {
        return true;
    }

    else if (voteCount === 0) {
        throw new Error("Transaction has no votes.");
    }

    throw new Error(`You are signing more than one vote. Number of votes: ${voteCount}`);
};

/**
 * Checks if the transaction has certificates.
 * @param transactionBody the body of the transaction to check.
 * @returns {boolean} true if the transaction has certificates, false otherwise.
 */
export const hasCertificates = (transactionBody: any) =>{
    console.log("hasCertificates");

    const certificates = transactionBody?.certs();
    let hasCertificates = true;

    console.log("certificates:", certificates);

    if (!certificates) {
      console.log("No certificates in the transaction.");
      hasCertificates = false;
    }

    return hasCertificates;

};

/**
 * Checks if the transaction is on the same network as the wallet.
 * @param transactionBody The body of the transaction to check.
 * @param walletNetworkID The network ID of the wallet.
 * @returns {boolean} True if the transaction is on the same network, false otherwise.
 */
export const isSameNetwork = (transactionBody: any, walletNetworkID: number): boolean => {
    console.log("isSameNetwork");
  // Determine the network ID from the transaction's first output address
  const transactionNetworkID = transactionBody
    .outputs()
    .get(0)
    .address()
    .to_bech32()
    .startsWith("addr_test1") ? 0 : 1;
  
  console.log("transactionNetwork:", transactionNetworkID);

  // Compare the transaction network ID with the wallet network ID
  return walletNetworkID === transactionNetworkID;
};

/**
 * Checks if the transaction has valid Intersect Constitutional Committee (ICC) credentials.
 * @param transactionBody The body of the transaction to check.
 * @param walletNetworkID The network ID of the wallet.
 * @returns {boolean} True if the transaction has valid ICC credentials, false otherwise.
 */
export const hasValidICCCredentials = (transactionBody: any, walletNetworkID: number): boolean => {
    console.log("hasValidICCCredentials");
  const voter = transactionBody.to_js_value().voting_procedures?.[0].voter;
  console.log("voter:", voter);

  if (!voter) {
    return false;
  }

  const credentialType = voter.ConstitutionalCommitteeHotCred;
  const scriptHex = credentialType?.Script;

  if (!scriptHex) {
    return false;
  }

  const expectedScripts = {
    [0]: "4f00984fa72e265b8ff8ffce4405da562cd3d6b16a4a38de3372eeea",
    [1]: "85c47dd4b9a2e70e88965d91dd69be182d5605b23bb5250b1c94bf64",
  };
  if (expectedScripts[walletNetworkID as 0 | 1] === scriptHex) {
    console.log('Intersect CC Credential found in', walletNetworkID===0 ? 'testnet' : 'mainnet');
  }
  else {
    console.error("Incorrect Intersect CC Credentials");
  }
  return expectedScripts[walletNetworkID as 0 | 1] === scriptHex;
};

/**
 * Checks if the given stake credential is part of the plutus data of the transaction.
 * @param transactionBody The body of the transaction to check.
 * @param stakeCredential The stake credential to check.
 * @returns {boolean} True if the stake credential is part of the plutus data, false otherwise.
 */
export const isSignerInPlutusData = (transactionBody: any, stakeCredential: string): boolean => {
    console.log('isSignerInPlutusData Function');
    const outputs = transactionBody?.outputs().to_js_value();
    console.log("outputs:", outputs);

    if (!Array.isArray(outputs) || !stakeCredential) {
        console.error("Transaction outputs are not available or stake credential is missing.");
        return false;
    }

    const stakeCredRegex = new RegExp(stakeCredential);

    for (const output of outputs) {
        const plutusData = output.plutus_data?.Data;
        
        if (plutusData && stakeCredRegex.test(plutusData)) {
            return true;
        }
    }

    return false;
};

/**
 * Checks if the given anchor URL produces the given anchor data hash.
 * @param anchorURL The URL of the anchor to check.
 * @param anchor_data_hash The expected anchor data hash.
 * @returns {Promise<boolean>} True if the anchor URL produces the expected hash, false otherwise.
 */
export const checkMetadataAnchor = async (anchorURL: string, anchor_data_hash: string): Promise<boolean> => {
  try {
    const producedHash = await getDataHashFromURI(anchorURL);
    return producedHash === anchor_data_hash;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return false;
  }
};

/**
 * Checks if a transaction is signed by looking for witnesses in the transaction.
 * @param transaction The transaction to check.
 * @returns {boolean} True if the transaction is unsigned, false otherwise.
 */
export const isUnsignedTransaction = (transaction: CSL.Transaction): boolean => {
  
  const witnesses = transaction.witness_set().vkeys();
  if (!witnesses || witnesses.len() === 0) {
    return true;
  }
  return false;
}

