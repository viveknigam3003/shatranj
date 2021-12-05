import { Box, Flex, Grid } from "@chakra-ui/layout";
import { GridItem } from "@chakra-ui/react";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import Header from "../components/Header";
import MainChessboard from "../components/MainChessboard";
import UserDetails from "../components/UserDetails";

const Home = () => {
  const [cookie, setCookie, removeCookie] = useCookies(["user"]);

  useEffect(() => {
    if (typeof window.ethereum !== undefined) {
      const ethereum = window.ethereum;
      console.log(ethereum.selectedAddress);
      ethereum.on("accountsChanged", (accounts) => {
        if (accounts[0]) {
          setCookie("user", JSON.stringify(accounts[0]), {
            path: "/",
            sameSite: true,
          });
        } else {
          removeCookie("user");
        }
      });
    }
  }, []);

  return (
    <Box>
      <Grid templateColumns="repeat(12, 1fr)" gap="16px">
        <Header />
        <MainChessboard />
        <GridItem colStart={8} colSpan={3} width="100%" height="100%">
          <Flex
            direction="column"
            height="100%"
            border="1px solid #bbb"
            borderRadius="10px"
            margin="4"
          >
            <UserDetails hash={cookie.user} flexBasis="50%" p="4" />
            <UserDetails hash={cookie.user} flexBasis="50%" p="4" />
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Home;
