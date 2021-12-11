import { Box, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import * as ChessJS from "chess.js";
import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import Header from "../components/Header";
import MainChessboard from "../components/MainChessboard";
import MoveList from "../components/MoveList";
import OptionPanel from "../components/OptionPanel";
import styles from "../styles/Play.module.css";
import { truncateHash } from "../utils";

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

const PlayPage: NextPage = () => {
  const players = {
    white: {
      username: "altstream",
      account: "0x246fd79365CA79BEB812B5635E8bE38453e2BF1C",
    },
    black: {
      username: "rehesamay",
      account: "0xC89337a02D3A3b913147aACF8F5b06Ad046663A9",
    },
  };

  const [game, setGame] = useState(newGame);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [socket, setSocket] = useState(null);
  const toast = useToast();
  const toastId = "opponent-disconnect";
  const newUserId = "opponent-connected";

  const currentPlayerSide: Orientation =
    players.white.account.toLowerCase() === currentUser.toLowerCase()
      ? "white"
      : "black";

  useEffect(() => {
    if (typeof window !== undefined) {
      setCurrentUser(localStorage.getItem("user"));
    }
  }, [setCurrentUser]);

  useEffect(() => {
    const newSocket = io(`wss://0bd0-114-134-24-37.ngrok.io`);
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [setSocket]);

  useEffect(() => {
    //When the currentUser joins the room
    if (socket && currentUser.length) {
      socket.emit("room", 1, currentUser);
    }
  }, [socket, currentUser]);

  useEffect(() => {
    //When the currentUser joins the room
    if (socket) {
      socket.on("room", (account) => {
        if (
          !toast.isActive(newUserId) &&
          account.toLowerCase() !== currentUser.toLowerCase()
        ) {
          toast({
            id: toastId,
            title: "Opponent Joined",
            description: `${truncateHash(account)} is now online`,
            isClosable: true,
            status: "success",
            variant: "subtle",
          });
        }
      });
    }
  }, [socket, currentUser, toast]);

  const pgn = useMemo(() => game.pgn(), [game]);

  useEffect(() => {
    if (socket) {
      socket.emit("move", pgn);
    }
  }, [pgn, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("move", (newPGN) => {
        console.log(newPGN);
        updateGame(game, setGame, newPGN);
      });
    }
  }, [socket, game]);

  useEffect(() => {
    if (socket) {
      socket.on("disconnect", (account) => {
        console.log(`${truncateHash(account)} left the game`);
      });
    }
  }, [socket, game]);

  return (
    <Box height="100vh" className={styles.root}>
      <Header account={currentUser} />
      <Flex alignItems="center" justifyContent="space-between" px="16rem">
        <Box flexBasis="65%">
          <MainChessboard
            game={game}
            setGame={setGame}
            boardOrientation={currentPlayerSide}
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
            players={players}
            currentPlayerSide={currentPlayerSide}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default PlayPage;
