import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Center, Flex, Heading, HStack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { Cookies } from "react-cookie";
import Web3Token from "web3-token";
import { MetamaskIcon } from "../components/MetamaskIcon";
import styles from "../styles/Home.module.css";

const cookie = new Cookies();

const Home: NextPage = () => {
  const toast = useToast();
  const router = useRouter();

  const generateToken = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      return await Web3Token.sign(async (msg) => {
        try {
          return await signer.signMessage(msg);
        } catch (err) {
          const { reason } = err;
          if (reason === "unknown account #0") {
            return toast({
              title: "Could Not Connect to Metamask",
              description:
                "Have you unlocked metamask and are connected to this page?",
              isClosable: true,
              duration: 5000,
              status: "error",
              variant: "subtle",
            });
          }

          return toast({
            title: "Could Not Connect to Metamask",
            description: err.message,
            isClosable: true,
            duration: 5000,
            status: "error",
            variant: "subtle",
          });
        }
      }, "1d");
    } catch (err) {
      if (/returns a signature/.test(err.toString())) {
        return;
      }
      return toast({
        title: "Could Not Connect to Metamask",
        description: err.message,
        isClosable: true,
        duration: 5000,
        status: "error",
        variant: "subtle",
      });
    }
  };

  const connectToMetamask = async () => {
    if (!window.ethereum) {
      return toast({
        title: "Could Not Find Metamask",
        description: "Please install and activate the metamask extension!",
        isClosable: true,
        duration: 5000,
        status: "error",
        variant: "subtle",
      });
    }
    const token = await generateToken();
    cookie.set("token", JSON.stringify(token), {
      path: "/",
      sameSite: true,
      maxAge: 60 * 60 * 24,
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    localStorage.setItem("user", address);
    router.push("/play");
  };

  return (
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
            <Text fontSize={{ base: "1.25rem", xl: "1.5rem" }} color="gray.500">
              The classic game of chess. The modern prize for winning.
            </Text>
          </Box>
          <Button
            colorScheme="whiteAlpha"
            width="fit-content"
            leftIcon={<MetamaskIcon />}
            size="lg"
            onClick={connectToMetamask}
          >
            Connect wallet to play
          </Button>
          <Text py="2" fontSize="0.8rem" color="gray.500">
            Shatranj currently supports only Metamask wallet. If you don&apos;t
            have an account, follow the instructions{" "}
            <a className={styles.link} href="https://metamask.io/download.html">
              here
            </a>{" "}
            to install Metamask
          </Text>
        </Box>
        <Center flexBasis={{ md: "50%" }}>
          <Image alt="Rook" src="/rook.png" />
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
          <Link passHref href="/about">
            <Text className={styles.link}>About</Text>
          </Link>
          <Link passHref href="/instruction">
            <Text className={styles.link}>How to play</Text>
          </Link>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default Home;
