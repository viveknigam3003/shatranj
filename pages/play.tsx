import { Box, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import * as ChessJS from "chess.js";
import { GetServerSidePropsContext, NextPage } from "next";
import nookies from "nookies";
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

const MATCH_ID = 1;

export interface MatchData {
  matchId: string;
  white: string;
  black: string;
}

const PlayPage: NextPage = () => {
  const data: MatchData = {
    matchId: "76c41497-ff3f-4287-9254-3632e3225264",
    white: "0x246fd79365CA79BEB812B5635E8bE38453e2BF1C",
    black: "0xC89337a02D3A3b913147aACF8F5b06Ad046663A9",
  };

  const [game, setGame] = useState(newGame);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [socket, setSocket] = useState(null);
  const toast = useToast();
  const newUserId = "opponent-connected";

  const currentPlayerSide: Orientation =
    data.white.toLowerCase() === currentUser.toLowerCase() ? "white" : "black";

  useEffect(() => {
    if (typeof window !== undefined) {
      setCurrentUser(localStorage.getItem("user"));
    }
  }, [setCurrentUser]);

  useEffect(() => {
    const socketURI = process.env.NEXT_PUBLIC_SERVER;
    if (!socketURI) {
      setSocket(null);
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SERVER, {
      path: "/ws/socket.io",
    });
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [setSocket]);

  useEffect(() => {
    //When the currentUser joins the room
    if (socket && currentUser.length) {
      socket.emit("room", MATCH_ID, currentUser);
    }
  }, [socket, currentUser]);

  const pgn = useMemo(() => game.pgn(), [game]);

  useEffect(() => {
    if (socket) {
      socket.emit("move", pgn);
    }
  }, [pgn, socket]);

  useEffect(() => {
    //When the currentUser joins the room
    const createToast = (account) => {
      if (
        !toast.isActive(newUserId) &&
        account.toLowerCase() !== currentUser.toLowerCase()
      ) {
        toast({
          id: newUserId,
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
  }, [socket, currentUser, toast]);

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
      console.log(`${truncateHash(account)} left the game`);
    };

    if (socket) {
      socket.on("disconnect", toastUserDisconnect);
    }

    return () => {
      if (socket) {
        socket.off("disconnect", toastUserDisconnect);
      }
    };
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
          <OptionPanel matchData={data} currentPlayerSide={currentPlayerSide} />
        </Box>
      </Flex>
    </Box>
  );
};

export default PlayPage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  //Try to get token from cookies.
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  //If the token does not exist or is cleared then redirect to login page.
  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {
      token,
    },
  };
};
