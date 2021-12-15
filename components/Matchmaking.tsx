import {
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  VStack
} from "@chakra-ui/react";
import axios from "axios";
import Moralis from "moralis";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import web3 from "web3";
import { contractJSON } from "../abis/asharfi";
import { appConfig } from "../app-config";
import { useCustomToast } from "../hooks/useCustomToast";
import { networks } from "../network-config";
import { ReqStatus } from "../pages";
import { erc20token } from "../token-config";
import CustomModal from "./CustomModal";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Programmatically transfers tokens to the recepient address. No manual signature required
 * @param value number - Token Amount to refund
 * @param to string - Recepient Address
 */
export const _safeTransferToken = async (
  value: number,
  to: string,
  options?: { onSuccess?: (res?: any) => void; onError?: (err?: Error) => void }
) => {
  const privateKey = process.env.NEXT_PUBLIC_OWNER_PRIVATE_KEY;
  const publicChain = process.env.NEXT_PUBLIC_NETWORK_CHAIN;

  const contractABI = contractJSON.abi;
  const web3js = new web3(
    new web3.providers.HttpProvider(networks[publicChain].rpcUrls[0])
  );
  const contract = new web3js.eth.Contract(
    contractABI as any,
    erc20token.address
  );
  const data = contract.methods
    .transfer(to, BigInt(value * 10 ** erc20token.decimals))
    .encodeABI();
  const rawTransaction = { to: erc20token.address, gas: 200000, data: data };

  web3js.eth.accounts
    .signTransaction(rawTransaction, privateKey)
    .then((signedTx) =>
      web3js.eth.sendSignedTransaction(signedTx.rawTransaction)
    )
    .then((res) => {
      options.onSuccess(res);
    })
    .catch((err) => {
      options.onError(err);
    });
};

type BidValue = { min: number; value: number };

const Matchmaking: React.FC<BidModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { createToast } = useCustomToast();
  const { user } = useMoralis();
  const [bid, setBid] = useState<BidValue>({ min: 0, value: 0 });
  const [cancelStatus, setCancelStatus] = useState<ReqStatus>("idle");
  const [matchmakingStatus, setMatchMakingStatus] = useState<ReqStatus>("idle");
  const { fetch, isFetching } = useWeb3Transfer();
  const [uuid, setUuid] = useState<string | null>(null);

  /**
   * Handles the input for the min and current bid value
   * @param e Input Event
   */
  const handleBidInput = (e) => {
    const [key, value] = [e.target.name, e.target.value];
    setBid((nextBid) => ({ ...nextBid, [key]: value }));
  };

  /**
   * Transfers ASHF to a recepient with user signature.
   * @param value number - Token Amount to transfer
   * @param to string - Recepient Address
   * @returns Promise<void>
   */
  const transferASHF = async (
    value: number,
    to: string,
    options?: { onSuccess?: () => void; onError?: (err?: Error) => void }
  ) => {
    return await fetch({
      params: {
        amount: Moralis.Units.Token(value, erc20token.decimals),
        receiver: to,
        type: "erc20",
        contractAddress: erc20token.address,
      },
      onSuccess: () => {
        options.onSuccess();
      },
      onError: (e) => {
        options.onError(e);
      },
    });
  };

  const validateInput = (bid: BidValue) => {
    if (bid.value < bid.min) {
      createToast(
        "Minimum opponent bid cannot be more than your bid",
        "warning"
      );
      return false;
    }

    if (bid.value % 10 !== 0) {
      createToast("Bid should be in multiples of 10", "warning");
      return false;
    }

    if (bid.min % 10 !== 0) {
      createToast(
        "Minimum Opponent Bid should be in multiples of 10",
        "warning"
      );
      return false;
    }

    if (bid.value < appConfig.minBid) {
      createToast(
        "Bid too small",
        "warning",
        `Minimum bid should be ASHF ${appConfig.minBid}`
      );
      return false;
    }

    return true;
  };

  /**
   * Creates a new match in the DB and sets the UUID for the match room
   */
  const findMatchOpponent = async () => {
    const username = user.attributes.ethAddress;
    const uri = process.env.NEXT_PUBLIC_SERVER + "/match";
    const data = {
      username,
      token_bid: bid.value,
      min_bid: !bid.min ? bid.value : bid.min,
    };

    try {
      const response = await axios.post(uri, data);
      setUuid(response.data.UUID);
    } catch (e) {
      console.log(e);
      setMatchMakingStatus("error");
    }
  };

  /**
   * Safely cancels the Matchmaking SSE
   * @param uuid string - UUID of the match room
   */
  const cancelMatchmaking = async (
    uuid: string,
    user: Moralis.User<Moralis.Attributes>
  ) => {
    setCancelStatus("loading");
    setMatchMakingStatus("idle");
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_SERVER + `/match/cancel?uuid=${uuid}`
      );

      if (response.status === 200) {
        await _safeTransferToken(
          bid.value * (1 - appConfig.platformFee),
          user.attributes.ethAddress,
          {
            onSuccess: () => {
              createToast(
                "Matchmaking request cancelled!",
                "success",
                `${bid.value * (1 - appConfig.platformFee)} ASHF refunded`
              );
              setCancelStatus("success");
              onClose();
            },
            onError: (e) => {
              createToast(
                "Could not return ASHF. Please contact support for resolving this error",
                "success",
                e.message
              );
              setCancelStatus("error");
              onClose();
            },
          }
        );
        return;
      }
    } catch {
      setCancelStatus("error");
    }
  };

  const handleMatchmaking = async () => {
    if (!validateInput(bid)) return;

    setMatchMakingStatus("loading");
    await transferASHF(bid.value, process.env.NEXT_PUBLIC_OWNER_ADDRESS, {
      onSuccess: async () => {
        createToast(`${bid.value} ASHF received successfully`, "success");
        await findMatchOpponent();
      },
      onError: (e) => {
        setMatchMakingStatus("error");
        createToast(`ASHF transaction failed`, "error", e.message);
      },
    });
  };

  useEffect(() => {
    if (uuid) {
      console.log("Found UUID", uuid);
      //Creating a new event source to the server to fetch
      const sse = new EventSource(
        process.env.NEXT_PUBLIC_SERVER + `/match/status?uuid=${uuid}`
      );

      //When a message is received from the server
      sse.onmessage = (e) => {
        //Parse the data
        const data = JSON.parse(e.data);
        console.log(data);
        //If the data has a match_id
        if (data.match_id) {
          //Close the SSE and the modal
          setMatchMakingStatus("success");
          sse.close();
          onClose();
          createToast("Match Found", "success");
          //Route to the play/[match_id] page
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


  return (
    <CustomModal
      title="Find an opponent"
      isOpen={isOpen}
      onClick={handleMatchmaking}
      withAction
      buttonText="Start finding match"
      actionButtonProps={{
        colorScheme: "green",
        isLoading: matchmakingStatus === "loading",
        loadingText: isFetching ? "Waiting for ASHF" : "Finding Match",
        isDisabled: !bid.value,
      }}
      cancelButtonProps={{
        onClick: !uuid ? () => onClose() : () => cancelMatchmaking(uuid, user),
        isLoading: cancelStatus === "loading",
        loadingText: "Cancelling Request",
      }}
    >
      <VStack>
        <Text color="whiteAlpha.800" mb="2">
          Enter your wager to find suitable opponents
        </Text>
        <VStack alignItems="flex-start" width="100%" pb="2">
          <Text color="whiteAlpha.800" fontSize="0.8rem">
            Your Bid (minimum {appConfig.minBid} ASHF, in multiples of 10)
          </Text>
          <InputGroup>
            <InputLeftAddon
              bg="whiteAlpha.100"
              border="none"
              color="whiteAlpha.500"
            >
              ${erc20token.symbol}
            </InputLeftAddon>
            <Input
              variant="filled"
              bg="blackAlpha.500"
              _hover={{ bg: "blackAlpha.300" }}
              color="whiteAlpha.800"
              placeholder="Your Bid"
              value={bid.value}
              name="value"
              type="number"
              onChange={handleBidInput}
            />
          </InputGroup>
        </VStack>
        <VStack alignItems="flex-start" width="100%" pb="2">
          <Text color="whiteAlpha.800" fontSize="0.8rem">
            Minimum Opponent Bid (Optional, Will use {bid.value} if left blank)
          </Text>
          <InputGroup>
            <InputLeftAddon
              bg="whiteAlpha.100"
              border="none"
              color="whiteAlpha.500"
            >
              ${erc20token.symbol}
            </InputLeftAddon>
            <Input
              type="number"
              variant="filled"
              bg="blackAlpha.500"
              _hover={{ bg: "blackAlpha.300" }}
              color="whiteAlpha.800"
              placeholder="Min Bid (Optional)"
              name="min"
              value={bid.min}
              onChange={handleBidInput}
            />
          </InputGroup>
        </VStack>
        <Text color="whiteAlpha.500" fontSize="0.8rem">
          Finding a match will cost you {appConfig.platformFee * 100}% of your $
          {erc20token.symbol} bid as platform fee. If match not found{" "}
          {(1 - appConfig.platformFee) * 100}% of your ${erc20token.symbol} bid
          is refunded.
        </Text>
      </VStack>
    </CustomModal>
  );
};

export default Matchmaking;
