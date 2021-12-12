import * as ChessJS from "chess.js";
import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { ChessGame, Orientation } from "../pages/play/[id]";

interface MainChessboardProps {
  game: ChessGame;
  setGame: (game: ChessGame) => void;
  boardOrientation?: Orientation;
  allowMoves?: boolean;
}

const MainChessboard: React.FC<MainChessboardProps> = ({
  game,
  setGame,
  boardOrientation = "white",
  allowMoves,
}) => {
  const [moveFrom, setMoveFrom] = useState<ChessJS.Square>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [customBoardStyles, setCustomBoardStyles] = useState({});

  useEffect(() => {
    setCustomBoardStyles(getCustomBoardStyles(game));
  }, [game]);

  const getMoveOptions = (square: ChessJS.Square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      return;
    }

    const newSquares = {};

    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(255,255,255,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
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
    if (!allowMoves) return;
    if (game.turn() !== boardOrientation[0]) return; //boardOrientation[0] = 'w' | 'b'

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

  const getCustomBoardStyles = (gameInstance: ChessGame) => {
    if (gameInstance.in_checkmate()) {
      return {
        boxShadow: "0 8px 32px rgba(239, 37, 37, 0.5)",
      };
    }

    if (gameInstance.in_check()) {
      console.log("game in check");
      return {
        boxShadow: "0 8px 32px rgba(239, 180, 37, 0.5)",
      };
    }

    if (gameInstance.in_stalemate()) {
      return {
        boxShadow: "0 8px 32px rgba(255, 34, 123, 0.5)",
      };
    }

    return {
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
    };
  };

  return (
    <Chessboard
      arePiecesDraggable={false}
      boardOrientation={boardOrientation}
      position={game.fen()}
      onSquareClick={onSquareClick}
      onSquareRightClick={onSquareRightClick}
      customBoardStyle={{
        borderRadius: "4px",
        transition: "0.05s all",
        ...customBoardStyles,
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
  );
};

export default MainChessboard;
