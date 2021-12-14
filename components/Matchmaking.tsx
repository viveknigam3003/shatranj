import {
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import Moralis from "moralis";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import web3 from "web3";
import ashf from "../abis/Asharfi.json";
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

  const contractABI = ashf.abi;
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

const Matchmaking: React.FC<BidModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { createToast } = useCustomToast();
  const { user } = useMoralis();
  const [bid, setBid] = useState({ min: 0, value: 0 });
  const [status, setStatus] = useState<ReqStatus>("idle");
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
  const transferASHF = async (value: number, to: string) => {
    return await fetch({
      params: {
        amount: Moralis.Units.Token(value, 18),
        receiver: to,
        type: "erc20",
        contractAddress: erc20token.address,
      },
      onSuccess: () => {
        setStatus("success");
        createToast(`${value} ASHF received successfully`, "success");
      },
      onError: (e) => {
        setStatus("error");
        createToast(`ASHF transaction failed`, "error", e.message);
      },
    });
  };

  /**
   * Testing Function
   * @returns Promise<void>
   */
  const testBidTransfer = async () => {
    setStatus("loading");
    return await transferASHF(
      bid.value,
      "0x23F247CE7d3D475316C7F5717c7bCf8fAB57F728"
    );
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
      min_bid: bid.min,
    };

    try {
      const response = await axios.post(uri, data);
      setUuid(response.data.UUID);
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Safely cancels the Matchmaking SSE
   * @param uuid string - UUID of the match room
   */
  const cancelMatchmaking = async (uuid: string) => {
    console.log("Matchmaking request cancelled!");
    const response = await axios.get(
      process.env.NEXT_PUBLIC_SERVER + `/match/cancel?uuid=${uuid}`
    );
    if (response.status === 200) {
      setStatus("idle");
      onClose();
    }
  };

  useEffect(() => {
    if (uuid) {
      //Creating a new event source to the server to fetch
      const sse = new EventSource(
        process.env.NEXT_PUBLIC_SERVER + `/match/status?uuid=${uuid}`
      );

      //When a message is received from the server
      sse.onmessage = (e) => {
        //Parse the data
        const data = JSON.parse(e.data);
        //If the data has a match_id
        if (data.match_id) {
          //Close the SSE and the modal
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
      onClose={onClose}
      onClick={testBidTransfer}
      withAction
      buttonText="Start finding match"
      actionButtonProps={{
        colorScheme: "green",
        isLoading: status === "loading",
        loadingText: isFetching ? "Waiting for ASHF" : "Finding Match",
        isDisabled: !bid.value,
      }}
    >
      <VStack>
        <Text color="whiteAlpha.800" mb="2">
          Enter your wager to find suitable opponents
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
        <Text color="whiteAlpha.500" py="2" fontSize="0.8rem">
          Finding a match will cost you 10% of your ${erc20token.symbol} bid as
          platform fee. If match not found 90% of your ${erc20token.symbol} bid
          is refunded.
        </Text>
      </VStack>
    </CustomModal>
  );
};

export default Matchmaking;
