import { Box, IconButton, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React from "react";
import voteRationaleTemplate from "../../templates/cardano-file-templates/voteRationaleTemplate.json";
import DownloadButton from "./molecules/downloadFiles";

interface Votes {
    yes: number;
    no: number;
    abstain: number;
    didNotVote: number;
    againstVoting: number;

}

interface Reference {
    label: string;
    uri: string;
}


export const CreateRationale = () => {
    const [summary, setSummary] = React.useState<string>("");
    const [statement, setStatement] = React.useState<string>("");
    const [discussion, setDiscussion] = React.useState<string>("");
    const [counterarguments, setCounterarguments] = React.useState<string>("");
    const [conclusion, setConclusion] = React.useState<string>("");
    const [votes, setVotes] = React.useState<Votes>({ yes: 0, no: 0, abstain: 0, didNotVote: 0, againstVoting: 0 });
    const [references, setReferences] = React.useState<Reference[]>([{ label: "", uri: "" }]);

    const addReference = () => {
        setReferences((prev) => [...prev, { label: "", uri: "" }]);
    };

    const updateReference = (
        index: number,
        field: keyof Reference,
        value: string
    ) => {
        setReferences((prev) =>
            prev.map((ref, i) =>
                i === index ? { ...ref, [field]: value } : ref
            )
        );
    };

    const removeReference = (index: number) => {
        setReferences((prev) => prev.filter((_, i) => i !== index));
    };

    const rationaleData = {
        ...voteRationaleTemplate,
        body: {
            ...voteRationaleTemplate.body,
            summary,
            rationaleStatement: statement,
            precedentDiscussion: discussion,
            counterargumentDiscussion: counterarguments,
            conclusion,
            internalVote: {
            constitutional: votes.yes,
            unconstitutional: votes.no,
            abstain: votes.abstain,
            didNotVote: votes.didNotVote,
            againstVote: votes.againstVoting
            },
            references: references.map(ref => ({
            "@type": "Other",
            label: ref.label,
            uri: ref.uri
            }))
        }
        // authors: ... // Optionally update authors if needed
    };

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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {references.map((ref, index) => (
                    <Box
                        key={index}
                        sx={{ display: "flex", flexDirection: "row", gap: 1 }}
                    >
                        <TextField
                            type="string"
                            label="Reference Label"
                            variant="outlined"
                            fullWidth
                            value={ref.label}
                            onChange={(e) =>
                                updateReference(index, "label", e.target.value)
                            }
                        />
                        <TextField
                            type="url"
                            label="Reference URI"
                            variant="outlined"
                            fullWidth
                            value={ref.uri}
                            onChange={(e) =>
                                updateReference(index, "uri", e.target.value)
                            }
                        />
                        {index === references.length - 1 && (
                            <IconButton color="primary" onClick={addReference}>
                                <AddIcon />
                            </IconButton>
                        )}
                        {references.length > 0 && (
                            <IconButton
                                color="error"
                                onClick={() => {
                                    if (references.length > 1) removeReference(index);
                                }}
                                disabled={references.length === 1}
                            >
                                <RemoveIcon />
                            </IconButton>
                        )}
                    </Box>
                ))}
            </Box>
            <DownloadButton data={rationaleData} filename={"rationale"} fileExtension="jsonld"/>
        </Box>
    );
};