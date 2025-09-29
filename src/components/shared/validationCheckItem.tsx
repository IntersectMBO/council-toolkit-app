import { Box, Typography } from "@mui/material";
import InfoWithTooltip from "./infoHover";

interface CheckItemProps {
  label: string;
  tooltip: string;
  value: boolean | undefined;
  textMsg?: string
}

const CheckItem = ({ label, tooltip, value, textMsg }: CheckItemProps) => {

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <InfoWithTooltip info={tooltip} />
      <Typography variant="body1" fontWeight="bold">
        {label}:{value === true ? "✅" : value === false ? "❌" : (
          <span style={{ color: "orange", fontStyle: "italic", fontWeight: "normal" }}>
            {" "+textMsg}
          </span>
        )}
      </Typography>
    </Box>
  );
};

export default CheckItem;
