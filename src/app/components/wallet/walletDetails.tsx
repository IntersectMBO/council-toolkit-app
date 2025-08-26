//Currently a placeholder component for displaying wallet details.
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Image from "next/image";

interface WalletDetailsProps {
  // add stuff here as needed
  stakeCred: string | null;
  walletNetwork: string | null;
  walletIcon: null;
}

export const WalletDetails = ({
  stakeCred,
  walletNetwork,
  walletIcon,
}: WalletDetailsProps) => {
  return (
    <TableContainer sx={{ mb: 3 }}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Voter Key Hash</TableCell>
            <TableCell>{stakeCred || "Not Available"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Wallet Network</TableCell>
            <TableCell>
              <div style={{ display: "flex", alignItems: "center" }}>
                {walletNetwork || "Not Available"}
                {walletIcon && (
                  <Image
                    src={walletIcon}
                    alt="Wallet Icon"
                    className="wallet-icon"
                    width={25}
                    height={25}
                    style={{ marginLeft: "15px" }}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
