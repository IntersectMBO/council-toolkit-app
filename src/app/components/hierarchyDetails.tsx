import { Table, TableBody, TableCell, TableContainer, TableRow, Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";
import InfoWithTooltip from "./molecules/infoHover";

interface HierarchyDetailsProps {
  // add stuff here as needed
  onAcknowledgeChange: (checked: boolean) => void;
}

export const HierarchyDetails = ({ 
    onAcknowledgeChange
}: HierarchyDetailsProps) => {
    const [checkboxes, setCheckboxes] = useState({
      ackAll: false,
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
                Are you sure you want to proceed?{" "}
              </TableCell>
                <TableCell  style={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                  control={<Checkbox checked={checkboxes.ackAll} onChange={handleCheckBoxChange("ackAll")} />}
                  label="*"
                  />
                  <InfoWithTooltip info={'⚠️'} />
                </TableCell>
            </TableRow>
            {/* Add other stuff here */}
          </TableBody>
        </Table>
      </TableContainer>
    );
}
