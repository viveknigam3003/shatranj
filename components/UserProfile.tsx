import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";
import React from "react";
import { FaChessKnight } from "react-icons/fa";
import { truncateHash } from "../utils";

const UserProfile: React.FC<{ account: string }> = ({ account }) => {
  const truncatedAccount = truncateHash(account.toUpperCase());

  return (
    <Tag size="lg" variant="subtle" colorScheme="whiteAlpha" cursor={"pointer"}>
      <TagLeftIcon boxSize="12px" as={FaChessKnight} />
      <TagLabel fontSize={"0.8rem"}>{truncatedAccount}</TagLabel>
    </Tag>
  );
};

export default UserProfile;
