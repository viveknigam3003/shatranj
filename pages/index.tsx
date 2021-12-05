import { Box, Center, Flex, Grid, Text } from "@chakra-ui/layout";
import { GridItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Header from "../components/Header";
import MainChessboard from "../components/MainChessboard";
import UserDetails from "../components/UserDetails";

const Home = () => {
  const [hasMetamask, setHasMetamask] = useState(true);
  const [cookie, setCookie, removeCookie] = useCookies(["user"]);

  useEffect(() => {
    if (typeof window !== undefined) {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const ethereum = window.ethereum;
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
      } else {
        setHasMetamask(false);
      }
    }
  }, []);

  return (
    <Box>
      {hasMetamask ? (
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
      ) : (
        <Center>
          <Text fontSize="2rem" maxW="60%">
            No Metamask Wallet Installed. Please install metamask wallet to
            continue
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default Home;
