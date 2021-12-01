import { Image } from "@chakra-ui/image";
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/layout";
import React from "react";

const W = {
  rook: { value: "r", image: "/white_pieces/white_rook.png" },
  bishop: { value: "b", image: "/white_pieces/white_bishop.png" },
  knight: { value: "n", image: "/white_pieces/white_knight.png" },
  queen: { value: "q", image: "/white_pieces/white_queen.png" },
  king: { value: "k", image: "/white_pieces/white_king.png" },
  pawn: { value: "0", image: "/white_pieces/white_pawn.png" },
};

const B = {
  rook: { value: "r", image: "/black_pieces/black_rook.png" },
  bishop: { value: "b", image: "/black_pieces/black_bishop.png" },
  knight: { value: "n", image: "/black_pieces/black_knight.png" },
  queen: { value: "q", image: "/black_pieces/black_queen.png" },
  king: { value: "k", image: "/black_pieces/black_king.png" },
  pawn: { value: "0", image: "/black_pieces/black_pawn.png" },
};

const royalsArrayW = [
  W.rook,
  W.knight,
  W.bishop,
  W.queen,
  W.king,
  W.bishop,
  W.knight,
  W.rook,
];
const pawnArrayW = Array(8).fill(W.pawn);
const nullArray = Array(8).fill(null);
const royalsArrayB = [
  B.rook,
  B.knight,
  B.bishop,
  B.queen,
  B.king,
  B.bishop,
  B.knight,
  B.rook,
];
const pawnArrayB = Array(8).fill(B.pawn);

const Chessboard = () => {
  const boardRows = [
    royalsArrayB,
    pawnArrayB,
    nullArray,
    nullArray,
    nullArray,
    nullArray,
    pawnArrayW,
    royalsArrayW,
  ];
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <GridItem colStart={3} colSpan={5}>
      <Box width="600px" height="600px">
        <Flex direction="column" h="100%" justifyContent="space-between">
          {boardRows.map((row, y) => (
            <Flex justifyContent="space-between" width="100%">
              <Flex alignItems="center" color="black">
                <Text fontWeight="600" p="2">
                  {rows[y]}
                </Text>
              </Flex>
              {row.map((piece, x) => (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  height="75px"
                  width="75px"
                  bg={x % 2 === y % 2 ? "white" : "#8c8c8c"}
                >
                  {piece !== null ? (
                    <Box width="60px" height="60px">
                      <Image src={piece.image} />
                    </Box>
                  ) : null}
                </Flex>
              ))}
            </Flex>
          ))}
        </Flex>
        <Flex marginLeft="1.75rem" justifyContent="space-between">
          {cols.map((col) => (
            <Flex justifyContent="center" width="75px">
              <Text fontWeight="600" p="2">
                {col}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </GridItem>
  );
};

export default Chessboard;
