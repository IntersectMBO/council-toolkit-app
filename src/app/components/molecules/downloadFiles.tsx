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

interface DownloadButtonProps {
    data : any ;
    filename : string ;
    fileExtension? : string ;
    buttonText? : string ;
    icon? : boolean ;
  }

export default function DownloadButton({ data, filename, fileExtension = "json", buttonText = "Download", icon = false }: DownloadButtonProps) {
    return (
        !icon && (<Button
            variant="contained"
            color="success"
            sx={{ whiteSpace: "nowrap", px: 3 }}
            onClick={() => downloadFile(data, filename, fileExtension)}
        >
            {buttonText}
        </Button>)
    )
}