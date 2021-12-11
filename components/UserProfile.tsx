import { Box, HStack, Text } from "@chakra-ui/layout";
import { Tag, TagLeftIcon } from "@chakra-ui/react";
import { FaChessKnight } from "react-icons/fa";
import React from "react";

const UserProfile: React.FC<{ user: string }> = ({ user }) => {
  return (
    <HStack alignItems="center" justifyContent="center" height="100%">
      {/* <Avatar name={user} src={user} /> */}
      <Box spacing={1} maxWidth="50%">
        {/* <Text fontWeight="600">{user.username}</Text> */}
        <Tag size="lg" variant="subtle" colorScheme="whiteAlpha">
          <TagLeftIcon boxSize="12px" as={FaChessKnight} />
          <Text fontSize="0.8rem" isTruncated>
            {user}
          </Text>
        </Tag>
      </Box>
    </HStack>
  );
};

export default UserProfile;
