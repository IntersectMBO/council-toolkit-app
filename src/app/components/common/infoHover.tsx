import React from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Tooltip, Typography, Box, IconButton } from "@mui/material";

interface InfoWithTooltipProps {
  info: string;
}

const InfoWithTooltip: React.FC<InfoWithTooltipProps> = ({ info }) => {
  return (
    <Tooltip title={info} arrow>
      <IconButton size="small">
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default InfoWithTooltip;