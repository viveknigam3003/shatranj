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
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import Moralis from "moralis";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChessKing } from "react-icons/fa";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import { MetamaskIcon } from "../components/MetamaskIcon";
import { useCustomToast } from "../hooks/useCustomToast";
import { networks } from "../network-config";
import styles from "../styles/Home.module.css";

type ReqStatus = "idle" | "loading" | "success" | "error";

const Home: NextPage = () => {
  const { createToast } = useCustomToast();
  const router = useRouter();
  const [status, setStatus] = useState<ReqStatus>("idle");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uuid, setUuid] = useState("");
  const { authenticate, isAuthenticated, user, isWeb3Enabled, enableWeb3 } = useMoralis();
  const { fetch, error, isFetching } = useWeb3Transfer();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

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

  const connectToMetamask = async () => {
    if (!isEthereumPresent()) return;

    setStatus("loading");
    console.log(process.env.NEXT_PUBLIC_NETWORK_CHAIN);
    await changeNetwork(process.env.NEXT_PUBLIC_NETWORK_CHAIN);

    return await authenticate({
      onSuccess: () => {
        setStatus("success");
        createToast(
          "Successfully Connected",
          "success",
          "Click on Find a match button to find opponent"
        );
      },
      onError: () => {
        setStatus("error");
        createToast(
          "Could not connect wallet",
          "error",
          "An unexpected error occured while connecting your account"
        );
      },
    });
  };

  const findMatchOpponent = async () => {
    enableWeb3({onSuccess: () => onOpen()});
    if(!isWeb3Enabled) return;
    if (!user) return;

    const username = user.attributes.ethAddress;
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

  //Transaction Functions
  const transferASHF = async (value: number, to: string) => {
    return await fetch({
      params: {
        amount: Moralis.Units.Token(value, 18),
        receiver: to,
        type: "erc20",
        contractAddress: contractAddress,
      },
      onSuccess: () => {
        createToast(`${value} ASHF received successfully`, "success");
      },
      onError: (e) => {
        createToast(`ASHF transaction failed`, "error", e.message);
      },
    });
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

  const FindMatchButton: React.FC = () => (
    <Button
      colorScheme="green"
      width="fit-content"
      leftIcon={<FaChessKing />}
      size="lg"
      onClick={async () =>
        await transferASHF(200, "")
      }
      isLoading={isFetching}
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
            {isAuthenticated ? <FindMatchButton /> : <ConnectMetamaskButton />}
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
