import { Box } from "@chakra-ui/react";
import React from "react";
import { Orientation } from "../pages/play";
import UserDetails from "./UserDetails";

type Player = { username?: string; account: string };

interface OptionPanelProps {
  players: { white: Player; black: Player };
  currentPlayerSide: Orientation;
}

const OptionPanel: React.FC<OptionPanelProps> = ({
  players,
  currentPlayerSide,
}) => {
  const playerOrder = [
    <UserDetails
      key={players.white.account}
      username={players.white.username}
      account={players.white.account}
    />,
    "v/s",
    <UserDetails
      key={players.black.account}
      username={players.black.username}
      account={players.black.account}
    />,
  ];

  return (
    <Box>
      {currentPlayerSide === "white" ? playerOrder : playerOrder.reverse()}
    </Box>
  );
};

export default OptionPanel;
