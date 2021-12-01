import { Box, Center, Flex, Grid, VStack } from "@chakra-ui/layout";
import { GridItem } from "@chakra-ui/react";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import Chessboard from "../components/Chessboard";
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
        <Chessboard />
        <GridItem
          colStart={8}
          colSpan={3}
          bg="tomato"
          width="100%"
          height="100%"
        >
          <Box>User</Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Home;
