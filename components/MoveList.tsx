import {
  Box,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { ChessGame } from "../pages/play";

interface MoveListProps {
  game: ChessGame;
}

const chunkInTwo = (array: Array<string>) => {
  return array.reduce(
    (result, value, index, sourceArray) =>
      index % 2 === 0
        ? [...result, sourceArray.slice(index, index + 2)]
        : result,
    []
  );
};

const uid = () => Math.random().toString(36).substring(2, 9);

const MoveList: React.FC<MoveListProps> = ({ game }) => {
  const history: Array<Array<string>> = useMemo(
    () => chunkInTwo(game.history()),
    [game]
  );

  console.log(history);
  return (
    <Box overflowY={"auto"} h="60%" mb="4">
      <Table size={"sm"} variant={"striped"} colorScheme={"whiteAlpha"}>
        <TableCaption>Move History</TableCaption>
        <Thead>
          <Tr>
            <Th>white</Th>
            <Th>black</Th>
          </Tr>
        </Thead>
        <Tbody>
          {history.map((row) => (
            <Tr key={uid()}>
              {row.map((item) => (
                <Td key={uid()}>{item}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default MoveList;
