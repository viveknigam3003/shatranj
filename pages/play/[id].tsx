import { Box, Flex, Text } from "@chakra-ui/layout";
import {
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import * as ChessJS from "chess.js";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useMoralis } from "react-moralis";
import io from "socket.io-client";
import { appConfig } from "../../app-config";
import Header from "../../components/Header";
import MainChessboard from "../../components/MainChessboard";
import { _safeTransferToken } from "../../components/Matchmaking";
import MoveList from "../../components/MoveList";
import OptionPanel from "../../components/OptionPanel";
import { useCustomToast } from "../../hooks/useCustomToast";
import styles from "../../styles/Play.module.css";
import { truncateHash } from "../../utils";

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

export type ChessGame = ChessJS.ChessInstance;
export type Orientation = "white" | "black";

const updateGame = (
  game: ChessGame,
  setGame: (game: ChessGame) => void,
  newPGN: string
) => {
  const gameCopy = { ...game };
  gameCopy.load_pgn(newPGN);
  setGame(gameCopy);
};

const newGame = new Chess();

export type Player = { amount: number; hash: string };
export interface MatchData {
  match_id: string;
  white: Player;
  black: Player;
  winner: string;
}

export interface PlayPageProps {
  data: MatchData;
}

const PlayPage: NextPage<PlayPageProps> = ({ data }) => {
  const router = useRouter();
  const { user } = useMoralis();
  const { createToast } = useCustomToast();
  const [userEthAddress, setUserEthAddress] = useState<string>("");
  const [game, setGame] = useState(newGame);
  const [socket, setSocket] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isGameOverOpen,
    onOpen: openGameOver,
    onClose: closeGameOver,
  } = useDisclosure();
  const [gameState, setGameState] = useState({ winner: "", reason: "" });

  useEffect(() => {
    if (user) {
      setUserEthAddress(user.attributes.ethAddress);
    }
  }, [user]);

  const currentPlayerSide: Orientation =
    data.white.hash.toLowerCase() === userEthAddress.toLowerCase()
      ? "white"
      : "black";

  const allowMoves =
    user &&
    (data.white.hash.toLowerCase() === userEthAddress.toLowerCase() ||
      data.black.hash.toLowerCase() === userEthAddress.toLowerCase());

  useEffect(() => {
    //1. When Socket Connects
    const socketURI = process.env.NEXT_PUBLIC_WEBSOCKET;
    console.log("Socket = ", socketURI);
    if (!socketURI) {
      setSocket(null);
      return;
    }
    onOpen();
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET, {
      path: "/ws/socket.io",
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [setSocket, onOpen]);

  useEffect(() => {
    //2. When the currentUser joins the room
    if (socket && userEthAddress.length) {
      console.log("Emit: room", data.match_id, userEthAddress);
      socket.emit("room", data.match_id, userEthAddress);
    }
  }, [socket, data, userEthAddress]);

  //Memoizing the PGN wrt the game.
  const pgn = useMemo(() => game.pgn(), [game]);

  useEffect(() => {
    //3. When the player makes a move
    if (socket) {
      console.log("Emit: move", pgn);
      socket.emit("move", pgn);
    }
  }, [pgn, socket]);

  useEffect(() => {
    //4. When the currentUser joins the room
    const createToast = (account: string) => {
      console.log(account);
      if (
        !toast.isActive("opponent-connected") &&
        account.toLowerCase() !== userEthAddress.toLowerCase()
      ) {
        socket.emit("ack", `${currentPlayerSide} joined`);
        onClose();
        toast({
          id: "opponent-connected",
          title: "Opponent Joined",
          description: `${truncateHash(account)} is now online`,
          isClosable: true,
          status: "success",
          variant: "subtle",
        });
      }
    };

    if (socket) {
      console.log("On: room");
      socket.on("room", createToast);
    }

    return () => {
      if (socket) {
        socket.off("room", createToast);
      }
    };
  }, [socket, userEthAddress, onClose, currentPlayerSide, toast]);

  useEffect(() => {
    const updateGameWithPGN = (newPGN: string) => {
      console.log(newPGN);
      updateGame(game, setGame, newPGN);
    };

    if (socket) {
      //When opponent makes a move

      socket.on("move", (res) => {
        console.log("On: move");
        updateGameWithPGN(res);
      });
    }

    return () => {
      if (socket) {
        socket.off("move", updateGameWithPGN);
      }
    };
  }, [socket, game]);

  useEffect(() => {
    const postMatchWinner = async (
      data: MatchData,
      winningSide: Orientation,
      reason?: string,
      draw: boolean = false
    ) => {
      console.log("MATCH ENDED due to opponent leaving postMatchWinner()");
      setGameState((nextState) => ({
        ...nextState,
        reason: reason,
        winner: winningSide,
      }));
      return await axios.post(
        process.env.NEXT_PUBLIC_SERVER + "/match/winner",
        {
          hash: draw ? "Draw" : data[winningSide].hash,
          match_id: data.match_id,
        }
      );
    };

    const toastUserDisconnect = async () => {
      onClose();
      try {
        const response = await postMatchWinner(
          data,
          currentPlayerSide,
          "Opponent Left"
        );

        openGameOver();
        if (response.status === 200) {
          console.log("Returning Money");
          const totalWinning =
            (data.white.amount + data.black.amount) *
            (1 - appConfig.platformFee);

          await _safeTransferToken(totalWinning, data[currentPlayerSide].hash, {
            onSuccess: () => {
              createToast(
                `${totalWinning} ASHF sent to ${truncateHash(data.winner)}`,
                "success"
              );
              router.push(`/fin/${data.match_id}`);
            },
            onError: (err) => {
              createToast(
                `Error while refunding ASHF`,
                "error",
                `Contact support for details. Error: ${err.message}`
              );
            },
          });
        }
      } catch (e) {
        createToast("Could Not Update Winner", "error", e.message);
      }
    };

    if (socket) {
      socket.on("disconnect", toastUserDisconnect);
    }

    return () => {
      if (socket) {
        socket.off("disconnect", toastUserDisconnect);
      }
    };
  }, [
    socket,
    currentPlayerSide,
    onClose,
    openGameOver,
    game,
    data,
    createToast,
    router,
  ]);

  useEffect(() => {
    const postMatchWinner = async (
      data: MatchData,
      winningSide: Orientation,
      reason?: string,
      draw: boolean = false
    ) => {
      console.log("MATCH ENDED postMatchWinner()");
      setGameState((nextState) => ({
        ...nextState,
        reason: reason,
        winner: winningSide,
      }));
      return await axios.post(
        process.env.NEXT_PUBLIC_SERVER + "/match/winner",
        {
          hash: draw ? "Draw" : data[winningSide].hash,
          match_id: data.match_id,
        }
      );
    };

    //SCENARIO: CHECKMATE
    if (game.in_checkmate()) {
      const winningSide = game.turn() === "w" ? "black" : "white";

      postMatchWinner(data, winningSide, "Checkmate")
        .then(async () => {
          openGameOver();
          const totalWinning =
            (data.white.amount + data.black.amount) *
            (1 - appConfig.platformFee);

          await _safeTransferToken(totalWinning, data.winner, {
            onSuccess: () => {
              createToast(
                `${totalWinning} ASHF sent to ${truncateHash(data.winner)}`,
                "success"
              );
              router.push(`/fin/${data.match_id}`);
            },
            onError: (err) => {
              createToast(
                `Error while refunding ASHF`,
                "error",
                `Contact support for details. Error: ${err.message}`
              );
            },
          });
        })
        .catch((e) => {
          console.log(e);
          createToast(
            "Could Not Update Winner",
            "error",
            "Contact support for any disputes regarding ASHF & winner."
          );
        });
    }

    //SCENARIO: DRAW/STALEMATE
    if (game.in_draw() || game.in_stalemate()) {
      const winningSide = game.turn() === "w" ? "black" : "white";

      postMatchWinner(data, winningSide, "Draw", true)
        .then(async () => {
          openGameOver();
          const whiteRefund = data.white.amount * (1 - appConfig.platformFee);
          const blackRefund = data.black.amount * (1 - appConfig.platformFee);

          await _safeTransferToken(whiteRefund, data.white.hash, {
            onSuccess: () => {
              createToast(
                `${whiteRefund} ASHF sent to ${truncateHash(data.white.hash)}`,
                "success"
              );
            },
            onError: (err) => {
              createToast(
                `Error while refunding ASHF`,
                "error",
                `Contact support for details. Error: ${err.message}`
              );
            },
          });

          await _safeTransferToken(blackRefund, data.black.hash, {
            onSuccess: () => {
              createToast(
                `${blackRefund} ASHF sent to ${truncateHash(data.black.hash)}`,
                "success"
              );
            },
            onError: (err) => {
              createToast(
                `Error while refunding ASHF`,
                "error",
                `Contact support for details. Error: ${err.message}`
              );
            },
          });
        })
        .catch(() => {
          createToast(
            "Could Not Update Winner",
            "error",
            "Contact support for any disputes regarding ASHF & winner."
          );
        });
    }
  }, [game, createToast, openGameOver, router, data]);

  return (
    <>
      <Box height="100vh" className={styles.root}>
        <Header account={userEthAddress} />
        <Flex alignItems="center" justifyContent="space-between" px="16rem">
          <Box flexBasis="65%">
            <MainChessboard
              game={game}
              setGame={setGame}
              boardOrientation={currentPlayerSide}
              allowMoves={allowMoves}
            />
          </Box>
          <Box
            display="flex"
            flexDir="column"
            flexBasis="35%"
            bg="whiteAlpha.200"
            borderRadius="4px"
            padding="1rem"
            height="560px"
          >
            <MoveList game={game} />
            <OptionPanel
              matchData={data}
              currentPlayerSide={currentPlayerSide}
            />
          </Box>
        </Flex>
      </Box>
      <Modal
        closeOnOverlayClick={false}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay />
        <ModalContent alignItems="center" shadow="lg" bg="#171717">
          <ModalHeader color="whiteAlpha.800">
            Waiting for opponent to connect
          </ModalHeader>
          <ModalBody p={"2rem"}>
            <CircularProgress
              size="80px"
              isIndeterminate
              trackColor="blackAlpha.400"
              color="green.500"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal onClose={closeGameOver} isOpen={isGameOverOpen} isCentered>
        <ModalOverlay />
        <ModalContent alignItems="center" shadow="lg" bg="#171717">
          <ModalHeader color="whiteAlpha.800">
            Game Over: {gameState.winner} won the game.
          </ModalHeader>
          <ModalBody p={"2rem"}>
            <Text color="whiteAlpha.800" paddingBottom="1rem">
              {gameState.reason}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PlayPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  //Try to get token from cookies.
  const { id } = ctx.params;

  let data;
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_SERVER + `/match?match_id=${id}`
    );
    data = await response.json();
    if (data.winner) {
      return {
        redirect: {
          permanent: false,
          destination: `/fin/${id}`,
        },
      };
    }
  } catch {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }

  if (!data) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }

  return {
    props: {
      data,
    },
  };
};
