import { Box, Flex } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import * as ChessJS from "chess.js";
import { NextPage } from "next";
import React, { useState } from "react";
import Header from "../components/Header";
import MainChessboard from "../components/MainChessboard";
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

const PlayPage: NextPage = () => {
  const [game, setGame] = useState(newGame);
  const [fen, setFen] = useState<string>("");
  const currentPlayerSide: Orientation = "white";

  return (
    <Box height="100vh" className={styles.root}>
      <Header />
      <Flex alignItems="center" justifyContent="space-between" px="16rem">
        <MainChessboard
          game={game}
          setGame={setGame}
          boardOrientation={currentPlayerSide}
        />
        <Button
          colorScheme="blue"
          onClick={() => updateGame(game, setGame, fen)}
        >
          Mock PGN
        </Button>
      </Flex>
    </Box>
  );
};

export default PlayPage;
