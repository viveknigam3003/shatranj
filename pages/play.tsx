import { Box, Flex } from "@chakra-ui/layout";
import * as ChessJS from "chess.js";
import { NextPage } from "next";
import React, { useState } from "react";
import Header from "../components/Header";
import MainChessboard from "../components/MainChessboard";
import UserDetails from "../components/UserDetails";
import styles from "../styles/Play.module.css";

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

const newGame = new Chess();

export type ChessGame = ChessJS.ChessInstance;
export type Orientation = "white" | "black";

const updateGame = (
  game: ChessGame,
  setGame: (game: ChessGame) => void,
  newFEN: string
) => {
  const gameCopy = { ...game };
  gameCopy.load(newFEN);
  setGame(gameCopy);
};

export const truncateHash = (hash: string) => {
  return hash.substring(0, 5) + "..." + hash.substring(hash.length - 4);
};

const PlayPage: NextPage = () => {
  const [game, setGame] = useState(newGame);
  const [fen, setFen] = useState<string>("");
  const currentPlayerSide: Orientation = "white";

  return (
    <Box height="100vh" className={styles.root}>
      <Header />
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
          justifyContent="space-between"
          flexBasis="35%"
          bg="whiteAlpha.200"
          borderRadius="4px"
          padding="1rem"
          height="560px"
        >
          {/* <Button
            colorScheme="blue"
            onClick={() => updateGame(game, setGame, fen)}
          >
            Mock PGN
          </Button> */}
          <Box>
            <UserDetails account="0x246fd79365CA79BEB812B5635E8bE38453e2BF1C" />
            <UserDetails account="0xC89337a02D3A3b913147aACF8F5b06Ad046663A9" />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default PlayPage;
