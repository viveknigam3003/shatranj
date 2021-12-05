import { GridItem } from "@chakra-ui/layout";
import * as ChessJS from "chess.js";
import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

const MainChessboard = () => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState<ChessJS.Square>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  const getMoveOptions = (square: ChessJS.Square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: game.in_check() ? "rgba(255,0,255,0.5)" : "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
  };

  const onSquareRightClick = (square: ChessJS.Square) => {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  };

  const onSquareClick = (square: ChessJS.Square) => {
    setRightClickedSquares({});

    const resetMove = (square: ChessJS.Square) => {
      setMoveFrom(square);
      getMoveOptions(square);
    };

    if (!moveFrom) {
      resetMove(square);
      return;
    }

    // attempt to make move
    const gameCopy = { ...game };
    const move = gameCopy.move({ from: moveFrom, to: square, promotion: "q" });
    setGame(gameCopy);

    // if invalid, setMoveFrom and getMoveOptions
    if (move === undefined) {
      resetMove(square);
      return;
    }

    setMoveFrom(null);
    setOptionSquares({});
  };

  useEffect(() => {
    console.log(game.fen());
  }, [game])

  return (
    <GridItem colStart={3} colSpan={5}>
      <Chessboard
        arePiecesDraggable={false}
        position={game.fen()}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
        customDarkSquareStyle={{ backgroundColor: "#7e7e7e" }}
        customLightSquareStyle={{
          backgroundColor: "rgba(255, 255, 255, .15)",
          backdropFilter: "blur(5px)",
        }}
      />
    </GridItem>
  );
};

export default MainChessboard;
