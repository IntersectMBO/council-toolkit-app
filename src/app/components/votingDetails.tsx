import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Link, Checkbox, FormControlLabel } from "@mui/material";
import { openInNewTab } from "../utils/txUtils";
import { useState } from "react";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";

interface VotingDetailsProps {
  govActionID: string;
  voteChoice: string;
  explorerLink: string;   
  metadataAnchorURL: string;
  metadataAnchorHash: string;
  onAcknowledgeChange: (checked: boolean) => void;
}

export const VotingDetails = ({ 
    govActionID, 
    voteChoice, 
    explorerLink, 
    metadataAnchorURL, 
    metadataAnchorHash,
    onAcknowledgeChange  
}: VotingDetailsProps) => {
    const [checkboxes, setCheckboxes] = useState({
        ackGovAction: false,
        ackVoteChoice: false,
        ackMetadataAnchor: false,
    });

    const handleCheckBoxChange = (name: keyof typeof checkboxes) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const updatedCheckboxes = { ...checkboxes, [name]: event.target.checked };
      setCheckboxes(updatedCheckboxes);
      onAcknowledgeChange(Object.values(updatedCheckboxes).every(Boolean));
    };

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
                <TableCell  style={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackGovAction} onChange={handleCheckBoxChange("ackGovAction")} />}
                  label="*"
                  />
                  <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_GOV_ACTION_ID} />
                </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Vote Choice </TableCell>
              <TableCell>{voteChoice}</TableCell>
              <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackVoteChoice} onChange={handleCheckBoxChange("ackVoteChoice")} />}
                  label="*"
                />
                 <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_VOTE_CHOICE} />
              </TableCell>
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
              <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackMetadataAnchor} onChange={handleCheckBoxChange("ackMetadataAnchor")} />}
                  label="*"
                />
                <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_METADATA_ANCHOR} />
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
