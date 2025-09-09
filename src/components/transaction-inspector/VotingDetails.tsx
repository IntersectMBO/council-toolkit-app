import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Link } from "@mui/material";
import { openInNewTab } from "../../utils/cardano";
import { VoteTransactionDetails } from "../../types/types";

export interface VotingDetailsProps extends VoteTransactionDetails {
  isWalletConnected?: boolean;
}

export const VotingDetails = ({ 
    govActionID, 
    voteChoice, 
    explorerLink, 
    metadataAnchorURL, 
    metadataAnchorHash,
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
          </TableBody>
        </Table>
      </TableContainer>
    );
}
