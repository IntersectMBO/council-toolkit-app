import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Link, Checkbox, FormControlLabel, Box } from "@mui/material";
import { openInNewTab } from "../utils/txUtils";
import { useEffect, useState } from "react";
import InfoWithTooltip from "./molecules/infoHover";
import { TOOLTIP_MESSAGES } from "../constants/infoMessages";
import { VoteTransactionDetails } from "./types/types";


export interface VotingDetailsProps extends VoteTransactionDetails {
  onAcknowledgeChange: (checked: boolean) => void;
  isWalletConnected?: boolean;
}

export const VotingDetails = ({ 
    govActionID, 
    voteChoice, 
    explorerLink, 
    metadataAnchorURL, 
    metadataAnchorHash,
    onAcknowledgeChange,
    resetAckState,
    isWalletConnected
}: VotingDetailsProps) => {
    const [acknowledged, setAcknowledged] = useState(false);

    // const handleCheckBoxChange = (name: keyof typeof checkboxes) => (event: React.ChangeEvent<HTMLInputElement>) => {
    //   const updatedCheckboxes = { ...checkboxes, [name]: event.target.checked };
    //   setCheckboxes(updatedCheckboxes);
    //   onAcknowledgeChange(Object.values(updatedCheckboxes).every(Boolean));
    // };
    const handleAcknowledgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setAcknowledged(checked);
      onAcknowledgeChange(checked);
    };

    useEffect(() => {
      if (resetAckState) {
        setAcknowledged(false);
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
              <TableCell >
                <a
                  href={`${explorerLink}`}
                  target="_blank"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  {govActionID}
                </a>
              </TableCell>
                {/* <TableCell style={{ display: 'flex'}}>
                  <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackGovAction} onChange={handleCheckBoxChange("ackGovAction")} />}
                  label="*"
                  />
                  <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_GOV_ACTION_ID} />
                </TableCell> */}
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Vote Choice </TableCell>
              <TableCell>{voteChoice}</TableCell>
              {/* <TableCell >
                <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackVoteChoice} onChange={handleCheckBoxChange("ackVoteChoice")} />}
                  label="*"
                />
                 <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_VOTE_CHOICE} />
              </TableCell> */}
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
              {/* <TableCell>
                <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackMetadataAnchor} onChange={handleCheckBoxChange("ackMetadataAnchor")} />}
                  label="*"
                />
                <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_METADATA_ANCHOR} />
              </TableCell> */}
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
              <TableCell>
                <FormControlLabel
                  control={<Checkbox checked={acknowledged} onChange={handleAcknowledgeChange} />}
                  label="*"
                />
                <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_VOTING_DETAILS} />
              </TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    //     <TableContainer sx={{ mb: 4, border: 1, borderColor: "divider", borderRadius: 2 }}>
    //   <Table sx={{ mt: 2 }}>
    //     <TableBody>
    //       <TableRow hover>
    //         <TableCell sx={{ fontWeight: 600, width: "35%", bgcolor: "background.paper" }}>
    //           Governance Action ID
    //         </TableCell>
    //         <TableCell>
    //           <Link href={explorerLink} target="_blank" underline="hover" sx={{ color: "primary.main" }}>
    //             {govActionID}
    //           </Link>
    //         </TableCell>
    //       </TableRow>

    //       <TableRow hover>
    //         <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>
    //           Vote Choice
    //         </TableCell>
    //         <TableCell>{voteChoice}</TableCell>
    //       </TableRow>

    //       <TableRow hover>
    //         <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>
    //           Metadata Anchor URL
    //         </TableCell>
    //         <TableCell>
    //           <Link
    //             href={metadataAnchorURL || "#"}
    //             target="_blank"
    //             underline="hover"
    //             sx={{ color: "primary.main" }}
    //           >
    //             {metadataAnchorURL}
    //           </Link>
    //         </TableCell>
    //       </TableRow>

    //       <TableRow hover>
    //         <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>
    //           Metadata Anchor Hash
    //         </TableCell>
    //         <TableCell>{metadataAnchorHash}</TableCell>
    //       </TableRow>

    //       <TableRow hover>
    //         <TableCell sx={{ fontWeight: 600, fontStyle: "italic", color: "error.main" }}>
    //           Acknowledge Voting Details
    //         </TableCell>
    //         <TableCell>
    //           <Box display="flex" alignItems="center">
    //             <FormControlLabel
    //               control={
    //                 <Checkbox checked={acknowledged} onChange={handleAcknowledgeChange} color="primary" />
    //               }
    //               label="*"
    //             />
    //             <InfoWithTooltip info={TOOLTIP_MESSAGES.ACK_VOTING_DETAILS} />
    //           </Box>
    //         </TableCell>
    //       </TableRow>
    //     </TableBody>
    //   </Table>
    // </TableContainer>
    );
}
