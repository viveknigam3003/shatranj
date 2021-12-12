import { Box, BoxProps, HStack, Text } from "@chakra-ui/layout";
import { Tag, TagLabel } from "@chakra-ui/react";
import React from "react";
import { truncateHash } from "../utils";

interface Props {
  account: string;
  username?: string;
}

const UserDetails: React.FC<Props & BoxProps> = ({
  username = "User",
  account,
  ...props
}) => {
  const truncatedAccount = truncateHash(account);

  return (
    <Box {...props}>
      <HStack alignItems="flex-start" justifyContent="flex-start" height="100%">
        {username && <Text fontWeight="600">{username}</Text>}
        <Tag variant="subtle" colorScheme="whiteAlpha">
          <TagLabel fontSize="0.8rem">{truncatedAccount}</TagLabel>
        </Tag>
      </HStack>
    </Box>
  );
};

export default UserDetails;
