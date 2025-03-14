import React, { useRef } from "react";
import { Button } from "@mui/material";

const MAX_FILE_SIZE = 30 * 1024 ; // 30KB limit
const ALLOWED_TYPES = ["application/json", ".unsigned"];

const FileUploader = ({ setUnsignedTransactionHex, setMessage }: { setUnsignedTransactionHex: (hex: string) => void, setMessage: (message: string) => void }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const validateFile = (file: File) => {
    console.log("Validating file:");
    if (!ALLOWED_TYPES.some((type) => file.type === type || file.name.endsWith(type))) {
      alert("Invalid file type. Please upload a .json or .unsigned file.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Please upload a file smaller than 30KB.");
      return false;
    }
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Uploading file...");
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = JSON.parse(event.target?.result as string);
        if (!result.cborHex) {
          throw new Error("Invalid file format: Missing Transaction Hex (cborHex field).");
        }
        console.log("Uploaded file:", result);
        setUnsignedTransactionHex(result.cborHex);
        setMessage(""); // Reset message state from previous errors caused by invalid tx/file upon new upload
      } catch (error) {
        alert("Error parsing JSON. Please upload a valid file." + error);
        setMessage("Error parsing JSON. Please upload a valid file."); // Update message state with error
      }
    };
    reader.readAsText(file);
    if (inputRef.current) {
      inputRef.current.value = "";
    }

  };

  return (
    <Button variant="contained" component="label" color="success" sx={{ whiteSpace: "nowrap", px: 3 }}>
      Upload
      <input ref={inputRef} type="file" hidden onChange={handleFileUpload} />
    </Button>
  );
};

export default FileUploader;
