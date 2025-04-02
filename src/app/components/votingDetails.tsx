import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Link, Checkbox, FormControlLabel, FormLabel } from "@mui/material";
import { openInNewTab } from "../utils/txUtils";
import { useEffect, useState } from "react";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";
import { VoteTransactionDetails } from "./types/types";
import { bool } from "@meshsdk/core";


export interface VotingDetailsProps extends VoteTransactionDetails {
  onAcknowledgeChange: (checked: boolean) => void;
}

export const VotingDetails = ({ 
    govActionID, 
    voteChoice, 
    explorerLink, 
    metadataAnchorURL, 
    metadataAnchorHash,
    onAcknowledgeChange,
    resetAckState  
}: VotingDetailsProps) => {
    const [checkbox, setCheckbox] = useState<boolean>(false);

    const handleCheckBoxChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setCheckbox(isChecked);
      onAcknowledgeChange(isChecked);
    };

    useEffect(() => {
      if (resetAckState) {
        setCheckbox(false);
        onAcknowledgeChange(false);  
      }
    }, [resetAckState,onAcknowledgeChange]);

    return (
      <TableContainer sx={{ mb: 3 }}>
        <Table sx={{ mt: 3 }}>
          <TableBody>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>
            Governance Action ID{" "}
          </TableCell>
          <TableCell>
            <a
          href={`${explorerLink}`}
          target="_blank"
          style={{ color: "blue", textDecoration: "underline" }}
            >
          {govActionID}
            </a>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>Vote Choice </TableCell>
          <TableCell>{voteChoice}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
          Metadata Anchor URL
          </TableCell>
          <TableCell sx={{ verticalAlign: "middle" }}>
          <Link
            onClick={() => openInNewTab(metadataAnchorURL || "")}
            style={{ color: "blue", textDecoration: "underline" }}
          >
            {metadataAnchorURL}
          </Link>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>
            Metadata Anchor Hash
          </TableCell>
          <TableCell>{metadataAnchorHash}</TableCell>
        </TableRow>
          </TableBody>
        </Table>
          <FormControlLabel
            sx={{ mt: 5 }}
            label="*Please acknowledge that you have read and checked the vote details above before proceeding.  "
            control={<Checkbox checked={checkbox} onChange={handleCheckBoxChange} />}
            labelPlacement="start"
          />
          
      </TableContainer>
    );
}
