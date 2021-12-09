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

const defaultFEN =
  "r1bqk2r/pppp1ppp/2P5/8/1b6/1Q3pP1/PP1PPP1P/R1B1KB1R b KQkq - 1 8";

const checkFEN = "4k3/4P3/4K3/8/8/8/8/8 b - - 0 78";

const PlayPage: NextPage = () => {
  const [game, setGame] = useState(newGame);
  const [fen, setFen] = useState<string>(checkFEN);
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
      </Flex>
      <Button colorScheme="blue" onClick={() => updateGame(game, setGame, fen)}>
        Mock PGN
      </Button>
    </Box>
  );
};

export default PlayPage;
