import { Avatar } from "@chakra-ui/avatar";
import { Box, BoxProps, HStack, Text } from "@chakra-ui/layout";
import React from "react";

interface Props {
  hash: string;
  username?: string;
  image?: string;
}

const UserDetails: React.FC<Props & BoxProps> = ({
  username = "User",
  image = "",
  hash,
  ...props
}) => {
  return (
    <Box {...props}>
      <HStack alignItems="flex-start" justifyContent="flex-start" height="100%">
        <Avatar name={username} src={image} />
        <Box spacing={1} maxWidth="50%">
          <Text fontWeight="600">{username}</Text>
          <Text fontSize="0.8rem" isTruncated>
            {hash}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default UserDetails;
