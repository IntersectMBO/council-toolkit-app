import { Button } from '@mui/material';
import React from 'react';

const downloadFile = (data : any, filename : string , fileExtension = "json") => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${filename}.${fileExtension}`;  
    document.body.appendChild(link);
    link.click();

     // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(data);
};

const downloadSignature = (govActionID : string, voterKeyHash : string , signature : string) => {   
    const data = {
        type: "TxWitness ConwayEra",
        description: "Key Witness ShelleyEra",
        govActionID,
        voterKeyHash,
        cborHex: signature
    };
    // Extract information for file name
    const voterPrefix = voterKeyHash.substring(0, 5);
    const govPrefix = govActionID.substring(0, 15);
    const filename = `${govPrefix}-vote-from-${voterPrefix}`;

    downloadFile(data, filename, "witness");
}

interface DownloadButtonProps {
    govActionID: string;
    voterKeyHash: string;
    signature: string;
  }

export default function DownloadButton({ govActionID, voterKeyHash, signature }: DownloadButtonProps) {
    return <Button variant="contained"
    color="success"
    sx={{ whiteSpace: "nowrap", px: 3 }} 
    onClick={() => downloadSignature(govActionID,voterKeyHash, signature)}>Download Signature</Button>;
  }
  