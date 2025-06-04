import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./infoHover";

interface CheckItemProps {
  label: string;
  tooltip: string;
  value: boolean | undefined;
  textmsg?: string
}

const CheckItem = ({ label, tooltip, value, textmsg }: CheckItemProps) => {

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <InfoWithTooltip info={tooltip} />
      <Typography variant="body1" fontWeight="bold">
        {label}: {value === true ? "✅" : value === false ? "❌" : textInput}
      </Typography>
    </Box>
  );
};

export default CheckItem;
