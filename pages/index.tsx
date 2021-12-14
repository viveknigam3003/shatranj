import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Center, Flex, Heading, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import Moralis from "moralis";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FaChessKing } from "react-icons/fa";
import { useMoralis } from "react-moralis";
import Footer from "../components/Footer";
import { MetamaskIcon } from "../components/MetamaskIcon";
import { useCustomToast } from "../hooks/useCustomToast";
import { networks } from "../network-config";
import styles from "../styles/Home.module.css";
import { erc20token } from "../token-config";
const Matchmaking = dynamic(() => import("../components/Matchmaking"));

export type ReqStatus = "idle" | "loading" | "success" | "error";

const Home: NextPage = () => {
  const { createToast } = useCustomToast();
  const [status, setStatus] = useState<ReqStatus>("idle");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    authenticate,
    isAuthenticated,
    user,
    isWeb3Enabled,
    enableWeb3,
    logout,
  } = useMoralis();
  const publicChain = process.env.NEXT_PUBLIC_NETWORK_CHAIN;

  /**
   * Checks if Browser is Web3 compatible
   * @returns True if web3 is present
   */
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

  /**
   * Requests to add new network if not present in wallet. Else switches to the network.
   * @param networkName Public Chain Network Name (From network-config file)
   */
  const changeNetwork = async (networkName: string) => {
    if (!isEthereumPresent()) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networks[publicChain].chainId }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networks[networkName]],
          });
        } catch (addErr) {
          createToast(
            "Could not add the requested chain",
            "error",
            addErr.message
          );
        }
      }
      createToast(
        "Could not connect to switch network",
        "error",
        switchErr.message
      );
    }
  };

  /**
   * Adds the ASHF (Asharfi) token to the current user's wallet
   * @param user Moralis User Instance
   * @returns
   */
  const addASHFToken = async (
    user: Moralis.User<Moralis.Attributes>
  ): Promise<any> => {
    if (user.attributes.ashf_connected) return;
    const token = { ...erc20token };
    try {
      return window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: token,
          },
        })
        .then(async () => {
          //This will always run if the prompt was successful
          //If someone forgets to add their ASHF, we can reset the status from the db
          user.set("ashf_connected", true);
          await user.save();
          createToast("ASHF Token Imported", "success");
        })
        .catch((err) => console.log(err.message));
    } catch (error) {
      createToast("Could not load ASHF", "error", error.message);
      return false;
    }
  };

  /**
   * Performs necessary operations to connect user to Metamask
   */
  const connectToMetamask = async () => {
    if (!isEthereumPresent()) return;

    setStatus("loading");
    console.log(publicChain);
    await changeNetwork(publicChain);

    return await authenticate({
      onSuccess: async (user) => {
        await addASHFToken(user);

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

  /**
   * Enables Web3 for the website and opens Matchmaking modal
   */
  const openBidModal = () => {
    enableWeb3();
    if (!isWeb3Enabled) return;
    if (!user) return;
    onOpen();
  };

  const FindMatchButton: React.FC = () => (
    <HStack>
      <Button
        colorScheme="green"
        width="fit-content"
        leftIcon={<FaChessKing />}
        size="lg"
        onClick={openBidModal}
      >
        Start New Match
      </Button>
      <Button
        colorScheme="blue"
        variant={"ghost"}
        width="fit-content"
        size="lg"
        onClick={() => logout()}
      >
        Logout
      </Button>
    </HStack>
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
        <Footer />
      </Flex>
      <Matchmaking isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Home;
