import { Wallet } from "./components/wallet";
import { TransactionButton } from "./components/transaction";
import { Container, Typography, Box, Icon } from "@mui/material";
import Image from "next/image";


export default function Home() {
  return (
    <Box className="background-container">


      <Container maxWidth="md" sx={{ display: "flex",  backgroundColor: "white", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: "100vh" , padding: 2}}>
        <Box sx={{
          width: "100%",
          backgroundColor: "blue",
          marginTop: "20px",
          padding: "15px 0 15px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}>
          
          <Image src="/images/Logo.svg" alt="Logo" width={100} height={100} style={{ paddingLeft: 10 }}/>
      
        </Box>
        <Typography variant="h4" component="h1" fontWeight="bold" textTransform="uppercase" mb={3} textAlign="center" paddingTop={2}>
          Council Toolkit
        </Typography>

        <Box display="flex" flexDirection="column" alignItems="center" width="100%">
          <Wallet />
          <TransactionButton />
          
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <a href="https://github.com/IntersectMBO/council-toolkit-app" target="_blank">
            <Image src="/images/github-mark.svg" alt="Logo" width={24} height={24} />
          </a>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Typography>Version 1.5 - IntersectMBO</Typography>
          </Box>
        </Box>
      </Container>
      
    </Box>
  );
}
