import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Center, Flex, Heading, HStack, Text } from "@chakra-ui/layout";
import { NextPage } from "next";
import Link from "next/link";
import { MetamaskIcon } from "../components/MetamaskIcon";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <>
      <Flex
        height="100vh"
        className={styles.root}
        flexDir="column"
        justifyContent="space-between"
      >
        <Flex flexWrap={{ base: "wrap", lg: "nowrap" }} height="100%">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={{ base: "2rem", lg: "8rem" }}
            flexBasis="50%"
            className={styles.hero}
          >
            <Box py="2rem">
              <Heading fontSize={{ base: "2.5rem", lg: "5rem", xl: "6rem" }}>
                Shatranj
              </Heading>
              <Text
                fontSize={{ base: "1.25rem", xl: "1.5rem" }}
                color="gray.500"
              >
                The classic game of chess. The modern prize for winning.
              </Text>
            </Box>
            <Button
              colorScheme="whiteAlpha"
              width="fit-content"
              leftIcon={<MetamaskIcon />}
              size="lg"
            >
              Connect wallet to play
            </Button>
            <Text py="2" fontSize="0.8rem" color="gray.500">
              Shatranj currently supports only Metamask wallet. If you don't
              have an account, follow the instructions{" "}
              <a
                className={styles.link}
                href="https://metamask.io/download.html"
              >
                here
              </a>{" "}
              to install Metamask
            </Text>
          </Box>
          <Center flexBasis={{ md: "50%" }}>
            <Image src="/rook.png" />
          </Center>
        </Flex>
        <Flex
          width="100%"
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          className={styles.footer}
        >
          <Text color="gray.500">Developed by Team Web23</Text>
          <HStack color="gray.500" p="2">
            <Link href="/about">
              <Text className={styles.link}>About</Text>
            </Link>
            <Link href="/instruction">
              <Text className={styles.link}>How to play</Text>
            </Link>
          </HStack>
        </Flex>
      </Flex>
    </>
  );
};

export default Home;
