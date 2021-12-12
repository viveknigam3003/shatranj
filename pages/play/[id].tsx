import { Box, Flex, Text } from "@chakra-ui/layout";
import {
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import * as ChessJS from "chess.js";
import { GetServerSidePropsContext, NextPage } from "next";
import nookies from "nookies";
import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import Header from "../../components/Header";
import MainChessboard from "../../components/MainChessboard";
import MoveList from "../../components/MoveList";
import OptionPanel from "../../components/OptionPanel";
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

export interface MatchData {
  matchId: string;
  white: string;
  black: string;
}

interface PlayPageProps {
  data: MatchData;
}

const PlayPage: NextPage<PlayPageProps> = ({ data }) => {
  const [game, setGame] = useState(newGame);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [socket, setSocket] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isGameOverOpen,
    onOpen: openGameOver,
    onClose: closeGameOver,
  } = useDisclosure();
  const [gameState, setGameState] = useState({ winner: "", reason: "" });

  const currentPlayerSide: Orientation =
    data.white.toLowerCase() === currentUser.toLowerCase() ? "white" : "black";

  const allowMoves = Object.values(data)
    .map((item) => item.toLowerCase())
    .includes(currentUser.toLowerCase());

  useEffect(() => {
    if (typeof window !== undefined) {
      setCurrentUser(localStorage.getItem("user"));
    }
  }, [setCurrentUser]);

  useEffect(() => {
    //1. When Socket Connects
    const socketURI = process.env.NEXT_PUBLIC_WEBSOCKET;
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
    if (socket && currentUser.length) {
      socket.emit("room", data.matchId, currentUser);
    }
  }, [socket, data, currentUser]);

  //Memoizing the PGN wrt the game.
  const pgn = useMemo(() => game.pgn(), [game]);

  useEffect(() => {
    //3. When the player makes a move
    if (socket) {
      socket.emit("move", pgn);
    }
  }, [pgn, socket]);

  useEffect(() => {
    //4. When the currentUser joins the room
    const createToast = (account) => {
      if (
        !toast.isActive("opponent-connected") &&
        account.toLowerCase() !== currentUser.toLowerCase()
      ) {
        onClose();
        socket.emit("ack", `${currentPlayerSide} joined`);
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
      socket.on("room", createToast);
    }

    return () => {
      if (socket) {
        socket.off("room", createToast);
      }
    };
  }, [socket, currentUser, onClose, currentPlayerSide, toast]);

  useEffect(() => {
    const updateGameWithPGN = (newPGN) => {
      console.log(newPGN);
      updateGame(game, setGame, newPGN);
    };

    if (socket) {
      socket.on("move", updateGameWithPGN);
    }

    return () => {
      if (socket) {
        socket.off("move", updateGameWithPGN);
      }
    };
  }, [socket, game]);

  useEffect(() => {
    const toastUserDisconnect = (account) => {
      onClose();
      openGameOver();
      setGameState((nextState) => ({
        ...nextState,
        reason: `Opponent (${truncateHash(account)}) left the game`,
        winner: currentPlayerSide,
      }));
    };

    if (socket) {
      socket.on("disconnect", toastUserDisconnect);
    }

    return () => {
      if (socket) {
        socket.off("disconnect", toastUserDisconnect);
      }
    };
  }, [socket, currentPlayerSide, onClose, openGameOver, game]);

  useEffect(() => {
    if (game.in_checkmate()) {
      openGameOver();
      const currentWinner = game.turn() === "w" ? "black" : "white";
      setGameState((nextState) => ({
        ...nextState,
        reason: "Win by checkmate",
        winner: currentWinner,
      }));
    }
  }, [game, openGameOver]);

  return (
    <>
      <Box height="100vh" className={styles.root}>
        <Header account={currentUser} />
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
              Reason: {gameState.reason}
            </Text>
            <Text textAlign="center" fontWeight="700" color="whiteAlpha.800">
              $ASHF 2000 transferred to {data[gameState.winner]}
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
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  //If the token does not exist or is cleared then redirect to home page.
  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const { id } = ctx.params;

  const response = await fetch(
    process.env.NEXT_PUBLIC_SERVER + `/match?match_id=${id}`
  );
  const data = await response.json();

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
