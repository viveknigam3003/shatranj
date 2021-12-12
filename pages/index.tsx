import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Center, Flex, Heading, HStack, Text } from "@chakra-ui/layout";
import {
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from "@chakra-ui/react";
import axios from "axios";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { FaChessKing } from "react-icons/fa";
import Web3Token from "web3-token";
import { MetamaskIcon } from "../components/MetamaskIcon";
import { useCustomToast } from "../hooks/useCustomToast";
import { networks } from "../network-config";
import styles from "../styles/Home.module.css";

const cookie = new Cookies();

type ReqStatus = "idle" | "loading" | "success" | "error";

const Home: NextPage = () => {
  const { createToast } = useCustomToast();
  const router = useRouter();
  const [status, setStatus] = useState<ReqStatus>("idle");
  const [token, setToken] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uuid, setUuid] = useState("");

  useEffect(() => {
    const userToken = cookie.get("token");
    if (userToken) {
      setToken(userToken);
    }
  }, []);

  const isEthereumPresent = (): Boolean => {
    if (!window.ethereum) {
      createToast(
        "Could Not Find Metamask",
        "error",
        "Please install and activate the metamask extension!"
      );
      return false;
    }
    return true;
  };

  const changeNetwork = async (networkName: string) => {
    if (!isEthereumPresent()) return;
    try {
      return await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networks[networkName]],
      });
    } catch (err) {
      createToast(
        "Could not connect to ethereum network",
        "error",
        err.message
      );
      return false;
    }
  };

  const loginWithMetamask = async () => {
    if (typeof window.ethereum === "undefined") {
      createToast(
        "Could Not Connect to Metamask",
        "error",
        "Metamask is not installed on this browser"
      );
      return null;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account: string = accounts[0];
    return account;
  };

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
            return createToast(
              "Could Not Connect to Metamask",
              "error",
              "Have you unlocked metamask and are connected to this page?"
            );
          }

          return createToast(
            "Could Not Connect to Metamask",
            "error",
            err.message
          );
        }
      }, "1d");
    } catch (err) {
      if (/returns a signature/.test(err.toString())) {
        return;
      }
      return createToast("Could Not Connect to Metamask", "error", err.message);
    }
  };

  const connectToMetamask = async () => {
    if (!isEthereumPresent()) return;

    setStatus("loading");
    console.log(process.env.NEXT_PUBLIC_NETWORK_CHAIN);
    await changeNetwork(process.env.NEXT_PUBLIC_NETWORK_CHAIN);

    const account = await loginWithMetamask();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    if (account && address.toLowerCase() === account.toLowerCase()) {
      const token: string = await generateToken();
      cookie.set("token", JSON.stringify(token), {
        path: "/",
        sameSite: true,
        maxAge: 60 * 60 * 24,
      });
      localStorage.setItem("user", account);
      setStatus("success");
      setToken(token);

      createToast(
        "Successfully Connected",
        "success",
        "Click on Find a match button to find opponent"
      );
    } else {
      setStatus("error");
      return createToast(
        "Could not connect wallet",
        "error",
        "An unexpected error occured while connecting your account"
      );
    }
  };

  const findMatchOpponent = async () => {
    onOpen();

    const username = localStorage.getItem("user");
    const uri = process.env.NEXT_PUBLIC_SERVER + "/match";
    const data = {
      username,
      token_bid: 1000,
      min_bid: 1000,
    };

    try {
      const response = await axios.post(uri, data);
      setUuid(response.data.UUID);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (uuid) {
      const sse = new EventSource(
        process.env.NEXT_PUBLIC_SERVER + `/match/status?uuid=${uuid}`
      );
      sse.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.match_id) {
          sse.close();
          onClose();
          createToast("Match Found", "success");
          router.push(`/play/${data.match_id}`);
        }
      };

      sse.onerror = () => {
        createToast(
          "Couldn't fetch opponent",
          "error",
          "An unexpected error occured while fetching opponent. Please check your internet connection."
        );
        sse.close();
        onClose();
      };

      return () => {
        sse.close();
      };
    }
  }, [uuid, onClose, router, createToast]);

  const handleGracefulClose = async (uuid: string) => {
    console.log("Matchmaking request cancelled!");
    const response = await axios.get(
      process.env.NEXT_PUBLIC_SERVER + `/match/cancel?uuid=${uuid}`
    );
    if (response.status === 200) {
      setStatus("idle");
      onClose();
    }
  };

  const FindMatchButton: React.FC = () => (
    <Button
      colorScheme="green"
      width="fit-content"
      leftIcon={<FaChessKing />}
      size="lg"
      onClick={findMatchOpponent}
      isLoading={status === "loading"}
      loadingText="Finding opponent"
    >
      Find a match
    </Button>
  );

  const ConnectMetamaskButton: React.FC = () => (
    <Button
      colorScheme="whiteAlpha"
      width="fit-content"
      leftIcon={<MetamaskIcon />}
      size="lg"
      onClick={connectToMetamask}
      isLoading={status === "loading"}
      loadingText="Connecting Metamask"
    >
      Connect wallet to play
    </Button>
  );

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
            {token ? <FindMatchButton /> : <ConnectMetamaskButton />}
            <Text py="2" fontSize="0.8rem" color="gray.500">
              Shatranj currently supports only Metamask wallet. If you
              don&apos;t have an account, follow the instructions{" "}
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
      <Modal
        closeOnOverlayClick={false}
        onClose={() => handleGracefulClose(uuid)}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay />
        <ModalContent alignItems="center" shadow="lg" bg="#171717">
          <ModalHeader color="whiteAlpha.800">Finding Opponent</ModalHeader>
          <ModalBody>
            <CircularProgress
              size="80px"
              isIndeterminate
              trackColor="blackAlpha.400"
              color="green.500"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleGracefulClose(uuid)}
              colorScheme="red"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
