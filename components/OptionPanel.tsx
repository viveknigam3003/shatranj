import { Box } from "@chakra-ui/react";
import React from "react";
import { MatchData, Orientation } from "../pages/play/[id]";
import UserDetails from "./UserDetails";

interface OptionPanelProps {
  matchData: MatchData;
  currentPlayerSide: Orientation;
}

const OptionPanel: React.FC<OptionPanelProps> = ({
  matchData,
  currentPlayerSide,
}) => {
  const playerOrder = [
    <UserDetails key={matchData.white.hash} account={matchData.white.hash} />,
    "v/s",
    <UserDetails key={matchData.black.hash} account={matchData.black.hash} />,
  ];

  return (
    <Box>
      {currentPlayerSide === "white" ? playerOrder : playerOrder.reverse()}
    </Box>
  );
};

export default OptionPanel;
