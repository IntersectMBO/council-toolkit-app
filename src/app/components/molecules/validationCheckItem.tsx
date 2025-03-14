import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./infoHover";

interface CheckItemProps {
  label: string;
  tooltip: string;
  value: boolean;
}

const CheckItem = ({ label, tooltip, value}: CheckItemProps) => {

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <InfoWithTooltip info={tooltip} />
      <Typography variant="body1" fontWeight="bold">
        {label}: {value ? "✅" : "❌"}
      </Typography>
    </Box>
  );
};

export default CheckItem;
