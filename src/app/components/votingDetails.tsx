import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Link, Checkbox, FormControlLabel } from "@mui/material";
import { openInNewTab } from "../utils/txUtils";
import { useEffect, useState } from "react";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";
import { VoteTransactionDetails } from "./types/types";


export interface VotingDetailsProps extends VoteTransactionDetails {
  // onAcknowledgeChange: (checked: boolean) => void;
  isWalletConnected?: boolean;
}

export const VotingDetails = ({ 
    govActionID, 
    voteChoice, 
    explorerLink, 
    metadataAnchorURL, 
    metadataAnchorHash,
    // onAcknowledgeChange,
    resetAckState,
    isWalletConnected
}: VotingDetailsProps) => {
    return (
      <TableContainer sx={{ mb: 3 }}>
        <Table sx={{ mt: 3 }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                Governance Action ID{" "}
              </TableCell>
              <TableCell >
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
              <TableCell sx={{ fontWeight: "bold" }}>
                Metadata Anchor URL
              </TableCell>
              <TableCell>
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
            {isWalletConnected && ( <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontStyle: "italic" , color: "red"}}>
                Acknowledge Voting Details
              </TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    );
}
