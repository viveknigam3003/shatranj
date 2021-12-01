import { Box, Grid } from "@chakra-ui/layout";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import Header from "../components/Header";

const Home = () => {
  const [_, setCookie] = useCookies(["user"]);

  useEffect(() => {
    if (typeof window.ethereum !== undefined) {
      const ethereum = window.ethereum;
      console.log(ethereum.selectedAddress);
      ethereum.on("accountsChanged", (accounts) => {
        setCookie("user", JSON.stringify(accounts[0]), {
          path: "/",
          sameSite: true,
        });
      });
    }
  }, []);

  return (
    <Box>
      <Grid templateColumns="repeat(12, 1fr)" gap="16px">
        <Header />
      </Grid>
    </Box>
  );
};

export default Home;
