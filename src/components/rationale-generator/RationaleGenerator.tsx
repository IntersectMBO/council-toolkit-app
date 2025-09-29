import { Box, IconButton, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React from "react";
import voteRationaleTemplate from "../../lib/templates/cardano-file-templates/cip136-template.json";
import DownloadButton from "../shared/downloadFiles";
import { FormControl, FormHelperText } from "@mui/material";


interface InternalVotes {
    yes: number;
    no: number;
    abstain: number;
    didNotVote: number;
    againstVoting: number;
}

interface Reference {
    "@type": "Other" | "GovernanceMetadata" | "RelevantArticles";
    label: string;
    uri: string;
}

export const CreateRationale = () => {
    const [summary, setSummary] = React.useState<string>("");
    const [statement, setStatement] = React.useState<string>("");
    const [discussion, setDiscussion] = React.useState<string>("");
    const [counterArguments, setCounterArguments] = React.useState<string>("");
    const [conclusion, setConclusion] = React.useState<string>("");
    const [internalVotes, setInternalVotes] = React.useState<InternalVotes>({ yes: 0, no: 0, abstain: 0, didNotVote: 0, againstVoting: 0 });
    const [references, setReferences] = React.useState<Reference[]>([{ "@type": "Other", label: "", uri: "" }]);

    // used to check if required fields are filled
    const isValid = summary.trim().length > 0 && statement.trim().length > 0;

    // todo: allow user to add authors field

    const addReference = () => {
        setReferences((prev) => [...prev, { "@type": "Other", label: "", uri: "" }]);
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

    // Build rationaleData, only including non-empty optional fields
    const rationaleBody: any = {
        summary,
        rationaleStatement: statement
    };

    // if these fields have been filled, include them in the rationaleBody
    const hasInternalVote =
        internalVotes.yes !== 0 ||
        internalVotes.no !== 0 ||
        internalVotes.abstain !== 0 ||
        internalVotes.didNotVote !== 0 ||
        internalVotes.againstVoting !== 0;
    
    if (discussion.trim()) rationaleBody.precedentDiscussion = discussion;
    if (counterArguments.trim()) rationaleBody.counterArgumentDiscussion = counterArguments;
    if (conclusion.trim()) rationaleBody.conclusion = conclusion;
    if (hasInternalVote) {
    rationaleBody.internalVote = {
            constitutional: internalVotes.yes,
            unconstitutional: internalVotes.no,
            abstain: internalVotes.abstain,
            didNotVote: internalVotes.didNotVote,
            againstVote: internalVotes.againstVoting
        };
    }

    // Only include references that have label or uri
    // todo: allow other "@types"
    // todo: add validation on the URIs -- ensure they start with "ipfs://" or "http://"
    const filteredReferences = references
        .filter(ref => ref.label.trim() || ref.uri.trim())
        .map(ref => ({
            "@type": "Other",
            label: ref.label,
            uri: ref.uri
        }));
    if (filteredReferences.length > 0) rationaleBody.references = filteredReferences;

    const rationaleData = {
        ...voteRationaleTemplate,
        body: {
            ...voteRationaleTemplate.body,
            ...rationaleBody
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl error={summary.trim().length === 0} fullWidth variant="outlined" sx={{ mb: 2 }}>
                <TextField
                    type="string"
                    label="Summary"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                />
                {summary.trim().length === 0 ? (
                    <FormHelperText>Summary is required</FormHelperText>
                ) : (
                    <FormHelperText>{`(${summary.length}/300 characters) Authors SHOULD use this field to succinctly describe their rationale.`}</FormHelperText>
                )}
            </FormControl>
            <FormControl error={statement.trim().length === 0} fullWidth variant="outlined" sx={{ mb: 2 }}>
                <TextField
                    type="string"
                    label="Rationale Statement"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    required
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                />
                <FormHelperText>
                    {statement.trim().length === 0
                        ? "Rationale Statement is required"
                        : `Authors SHOULD use this field to fully describe their rationale.`}
                </FormHelperText>
            </FormControl>
            <TextField
                type="string"
                label="Precedent Discussion"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={discussion}
                onChange={(e) => {
                    setDiscussion(e.target.value);
                }}
                helperText={"The author should use this field to discuss what they feel is relevant precedent."}
            />
            <TextField
                type="string"
                label="Counter Argument Discussion"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={counterArguments}
                onChange={(e) => {
                    setCounterArguments(e.target.value);
                }}
                helperText={"The author SHOULD use this field to discuss significant counter arguments to the position taken."}
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
                helperText={"The author SHOULD use this field to conclude their rationale."}
            />
            <Typography variant="h6" gutterBottom color="primary">
                Internal Vote Totals
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <TextField
                    type="number"
                    label="Constitutional"
                    variant="outlined"
                    fullWidth
                    value={internalVotes.yes}
                    onChange={(e) => {
                        setInternalVotes({ ...internalVotes, yes: Number(e.target.value) });
                    }}
                />
                <TextField
                    type="number"
                    label="Unconstitutional"
                    variant="outlined"
                    fullWidth
                    value={internalVotes.no}
                    onChange={(e) => {
                        setInternalVotes({ ...internalVotes, no: Number(e.target.value) });
                    }}
                />
                <TextField
                    type="number"
                    label="Abstain"
                    variant="outlined"
                    fullWidth
                    value={internalVotes.abstain}
                    onChange={(e) => {
                        setInternalVotes({ ...internalVotes, abstain: Number(e.target.value) });
                    }}
                />
                <TextField
                    type="number"
                    label="Did not vote"
                    variant="outlined"
                    fullWidth
                    value={internalVotes.didNotVote}
                    onChange={(e) => {
                        setInternalVotes({ ...internalVotes, didNotVote: Number(e.target.value) });
                    }}
                />
                <TextField
                    type="number"
                    label="Against Voting"
                    variant="outlined"
                    fullWidth
                    value={internalVotes.againstVoting}
                    onChange={(e) => {
                        setInternalVotes({ ...internalVotes, againstVoting: Number(e.target.value) });
                    }}
                />
            </Box>
            <Typography variant="h6" gutterBottom color="primary">
                References
            </Typography>
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
                            helperText={"Give a human-readable label for the reference"}
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
                            error={!((ref.uri).trim().length === 0) && !ref.uri.startsWith("http://") && !ref.uri.startsWith("https://") && !ref.uri.startsWith("ipfs://")}
                            helperText={!ref.uri.startsWith("http://") && !ref.uri.startsWith("https://") && !ref.uri.startsWith("ipfs://") ? "URI must be a link (http, https, ipfs)" : ""}
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
            <DownloadButton 
                data={rationaleData} 
                filename={"rationale"} 
                fileExtension="jsonld"
                disabled={!isValid}
            />
        </Box>
    );
};