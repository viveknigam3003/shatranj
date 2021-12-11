import { Avatar } from "@chakra-ui/avatar";
import { Box, BoxProps, HStack, Text } from "@chakra-ui/layout";
import { Tag } from "@chakra-ui/react";
import React from "react";

interface Props {
  account: string;
  username?: string;
  image?: string;
}

const UserDetails: React.FC<Props & BoxProps> = ({
  username = "User",
  image = "",
  account,
  ...props
}) => {
  return (
    <Box {...props}>
      <HStack alignItems="flex-start" justifyContent="flex-start" height="100%">
        <Avatar name={username} src={image} />
        <Box spacing={1} maxWidth="50%">
          <Text fontWeight="600">{username}</Text>
          <Tag variant="subtle" colorScheme="whiteAlpha">
            <Text fontSize="0.8rem" isTruncated>
              {account}
            </Text>
          </Tag>
        </Box>
      </HStack>
    </Box>
  );
};

export default UserDetails;
