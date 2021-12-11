import { Box, HStack } from "@chakra-ui/layout";
import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";
import React from "react";
import { FaChessKnight } from "react-icons/fa";
import { truncateHash } from "../pages/play";

const UserProfile: React.FC<{ account: string }> = ({ account }) => {
  const truncatedAccount = truncateHash(account);

  return (
    <HStack alignItems="center" justifyContent="center" height="100%">
      <Box spacing={1}>
        <Tag size="lg" variant="subtle" colorScheme="whiteAlpha">
          <TagLeftIcon boxSize="12px" as={FaChessKnight} />
          <TagLabel>{truncatedAccount}</TagLabel>
        </Tag>
      </Box>
    </HStack>
  );
};

export default UserProfile;
