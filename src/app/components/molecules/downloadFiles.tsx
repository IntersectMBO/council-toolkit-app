import { Button, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
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
    disabled?: boolean ;
  }

export default function DownloadButton({ data, filename, fileExtension = "json", buttonText = "Download", icon = false, disabled = false }: DownloadButtonProps) {
    return (
        icon ? (
            // change the tooltip to something generic, or let it get passed in
            <Tooltip title="Download transaction JSON">
                <IconButton
                    size="small"
                    onClick={() => downloadFile(data, filename, fileExtension)}
                    disabled={disabled}
                >
                    <DownloadIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        ) : (
            <Button
                variant="contained"
                color="success"
                sx={{ whiteSpace: "nowrap", px: 3 }}
                onClick={() => downloadFile(data, filename, fileExtension)}
                disabled={disabled}
            >
                {buttonText}
            </Button>
        )
    )
}