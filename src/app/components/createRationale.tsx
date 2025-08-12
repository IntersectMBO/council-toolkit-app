import { Box, TextField } from "@mui/material";
import React from "react";

interface Votes {
  yes: number;
  no: number;
  abstain: number;
  didNotVote: number;
  againstVoting: number;

}

interface Reference {
    label: string;
    url: string;
}


export const CreateRationale = () => {
    const [summary , setSummary] = React.useState<string>("");
    const [statement, setStatement] = React.useState<string>("");
    const [discussion, setDiscussion] = React.useState<string>("");
    const [counterarguments, setCounterarguments] = React.useState<string>("");
    const [conclusion, setConclusion] = React.useState<string>("");
    const [votes, setVotes] = React.useState<Votes>({ yes: 0, no: 0, abstain: 0 ,didNotVote: 0, againstVoting: 0 });
    const [references, setReferences] = React.useState<Reference[]>([]);

    return (
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            type="string"
            label="Statement"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={statement}
            onChange={(e) => {
              setStatement(e.target.value);
            }}
          />
          <TextField
            type="string"
            label="Summary"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
            }}
          />
          <TextField
            type="string"
            label="Discussion"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={discussion}
            onChange={(e) => {
              setDiscussion(e.target.value);
            }}
          />
          <TextField
            type="string"
            label="Counter Arguments"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={counterarguments}
            onChange={(e) => {
              setCounterarguments(e.target.value);
            }}
          />
          <TextField
            type="string"
            label="Conclusion"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={conclusion}
            onChange={(e) => {
              setConclusion(e.target.value);
            }}
          />
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <TextField
                type="number"
                label="Yes"
                variant="outlined"
                fullWidth
                value={votes.yes}
                onChange={(e) => {
                setVotes({ ...votes, yes: Number(e.target.value) });
                }}
            />
            <TextField
                type="number"
                label="No"
                variant="outlined"
                fullWidth
                value={votes.no}
                onChange={(e) => {
                setVotes({ ...votes, no: Number(e.target.value) });
                }}
            />
            <TextField
                type="number"
                label="Abstain"
                variant="outlined"
                fullWidth
                value={votes.abstain}
                onChange={(e) => {
                setVotes({ ...votes, abstain: Number(e.target.value) });
                }}
            />
            <TextField
                type="number"
                label="Did not vote"
                variant="outlined"
                fullWidth
                value={votes.didNotVote}
                onChange={(e) => {
                setVotes({ ...votes, didNotVote: Number(e.target.value) });
                }}
            />
            <TextField
                type="number"
                label="Against Voting"
                variant="outlined"
                fullWidth
                value={votes.againstVoting}
                onChange={(e) => {
                setVotes({ ...votes, againstVoting: Number(e.target.value) });
                }}
            />
          </Box>
          
        </Box>
    );
};