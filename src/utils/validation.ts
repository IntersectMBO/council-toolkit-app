import * as CSL from "@emurgo/cardano-serialization-lib-browser";

// Transaction Validation Functions
export const isPartOfSigners = (transactionBody: any, stakeCred: string) => {
  console.log("isPartOfSigners");
  const requiredSigners = transactionBody.required_signers();

  if (!requiredSigners || requiredSigners.len() === 0) {
    console.log("No required signers in the transaction.");
  } else if (requiredSigners?.to_json().includes(stakeCred)) {
    console.log("Required signers in the transaction:", requiredSigners?.to_json());
    return true;
  } else {
    console.log("Not part of the required signers.");
  }
  return false;
};

export const hasOneVoteOnTransaction = (transactionBody: any): boolean => {
  console.log("hasOneVoteOnTransaction");
  const votingProcedure = transactionBody.to_js_value().voting_procedures?.[0];
  const votes = votingProcedure?.votes;
  const voteCount = votes?.length;

  if (voteCount === 1) {
    return true;
  } else if (voteCount === 0) {
    throw new Error("Transaction has no votes.");
  }

  throw new Error(`You are signing more than one vote. Number of votes: ${voteCount}`);
};

export const hasCertificates = (transactionBody: any) => {
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

export const isSameNetwork = (transactionBody: any, walletNetworkID: number): boolean => {
  console.log("isSameNetwork");
  const transactionNetworkID = transactionBody
    .outputs()
    .get(0)
    .address()
    .to_bech32()
    .startsWith("addr_test1") ? 0 : 1;
  
  console.log("transactionNetwork:", transactionNetworkID);
  return walletNetworkID === transactionNetworkID;
};

export const hasValidICCCredentials = (transactionBody: any, walletNetworkID: number): boolean => {
  console.log("hasValidICCCredentials");
  const transactionNetworkID = transactionBody
    .outputs()
    .get(0)
    .address()
    .to_bech32()
    .startsWith("addr_test1") ? 0 : 1;
  
  console.log("transactionNetwork:", transactionNetworkID);
  return walletNetworkID === transactionNetworkID;
};

export const isUnsignedTransaction = (unsignedTransaction: CSL.Transaction): boolean => {
  return unsignedTransaction.witness_set().len() === 0;
};

export const hasNoCertificates = (transactionBody: any): boolean => {
  return !hasCertificates(transactionBody);
};
