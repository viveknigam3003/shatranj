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
import { useCustomToast } from "../hooks/useCustomToast";
import { ReqStatus } from "../pages";
import { erc20token } from "../token-config";
import CustomModal from "./CustomModal";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Matchmaking: React.FC<BidModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { createToast } = useCustomToast();
  const { user } = useMoralis();
  const [bid, setBid] = useState({ min: null, value: null });
  const [status, setStatus] = useState<ReqStatus>("idle");
  const { fetch, isFetching } = useWeb3Transfer();
  const [uuid, setUuid] = useState<string | null>(null);

  const handleBidInput = (e) => {
    const [key, value] = [e.target.name, e.target.value];
    setBid((nextBid) => ({ ...nextBid, [key]: value }));
  };

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

  const testBidTransfer = async () => {
    setStatus("loading");
    return await transferASHF(
      bid.value,
      "0x23F247CE7d3D475316C7F5717c7bCf8fAB57F728"
    );
  };

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
      console.log("Found UUID", uuid);
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
