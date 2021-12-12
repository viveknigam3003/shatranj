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
    <UserDetails key={matchData.white} account={matchData.white} />,
    "v/s",
    <UserDetails key={matchData.black} account={matchData.black} />,
  ];

  return (
    <Box>
      {currentPlayerSide === "white" ? playerOrder : playerOrder.reverse()}
    </Box>
  );
};

export default OptionPanel;
