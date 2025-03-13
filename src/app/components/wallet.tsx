"use client";

import { useEffect, useState } from "react";
import "../globals.css"; // Import the CSS file
import "@meshsdk/react/styles.css"
import { useWallet } from "@meshsdk/react";
import { BrowserWallet, deserializeAddress } from "@meshsdk/core";
import {  Container, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import Image from 'next/image';


export const Wallet = () => {
  const [WalletComponent, setWalletComponent] = useState<any | null>(null);
  const [paymentCred, setPaymentCred] = useState<string | null>(null);
  const [stakeCred, setStakeCred] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [walletIcon,setWalletIcon]=useState<string>('');
  useEffect(() => {
    const run = async () => {
      try {
        const { CardanoWallet } = await import("@meshsdk/react");
        setWalletComponent(() => CardanoWallet);
      } catch (error) {
        console.error("Error importing MeshProvider:", error);
      }
    };
    run();
  }, []);

  const WalletWrapper = () => {
    const { wallet, connected, name, connect, disconnect, error } = useWallet();

    useEffect(() => {
      const handleWalletConnection = async () => {
        if (connected) {
          console.log("Wallet connected:", name);
          const pubKey = await wallet.getRegisteredPubStakeKeys();
          console.log("Public key:", pubKey);
          const changeAddress = await wallet.getChangeAddress();
          const networkId = await wallet.getNetworkId();
          const iconSvg=(await BrowserWallet.getAvailableWallets()).find(wallet => wallet.id.toLowerCase() === name?.toLowerCase())?.icon || "";

          setPaymentCred(deserializeAddress(changeAddress).pubKeyHash);
          //stake key used for vote signing 
          setStakeCred(deserializeAddress(changeAddress).stakeCredentialHash);

          setWalletNetwork(networkId === 0 ? "Testnet" : networkId === 1 ? "Mainnet" : "unknown");

          setWalletIcon(iconSvg);

          console.log("Payment Credential:", paymentCred);
          console.log("Stake Credential:", stakeCred);
        }else{
          console.log("Wallet not connected.");
          setPaymentCred(null);
          setStakeCred(null);
          setWalletNetwork(null);
          setWalletIcon("");
        }
      };

      handleWalletConnection();
    }, [wallet,connected, name]);

    return <WalletComponent />;
  };

  if (WalletComponent === null) {
    return <div className="wallet-container">Loading...</div>;
  }

  return (

    <Container maxWidth="md">  
    <div className="wallet-container" style={{ display: "flex", alignItems: "center" ,justifyContent:"center "}} >
      <WalletWrapper />
    </div>
          {/* Credentials Table */}
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
                      {walletIcon && 
                        <Image src={walletIcon} alt="Wallet Icon" className="wallet-icon" width={25} height={25} style={{ marginLeft: "15px"}} />}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
    
    </Container>
  );
};

export default Wallet;
