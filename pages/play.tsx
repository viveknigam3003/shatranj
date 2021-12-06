import { Box, Flex } from "@chakra-ui/layout";
import { NextPage } from "next";
import Header from "../components/Header";
import MainChessboard from "../components/MainChessboard";
import styles from "../styles/Play.module.css";

const PlayPage: NextPage = () => {
  return (
    <Box height="100vh" className={styles.root}>
      <Header />
      <Flex alignItems="center" justifyContent="space-between" px="16rem">
        <MainChessboard />
        {/* <Flex
          direction="column"
          border="1px solid #bbb"
          borderRadius="10px"
          margin="4"
        >
          <UserDetails hash={cookie.user} />
          <UserDetails hash={cookie.user} />
        </Flex> */}
      </Flex>
    </Box>
  );
};

export default PlayPage;
