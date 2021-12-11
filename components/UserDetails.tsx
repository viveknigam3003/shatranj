import { Box, BoxProps, HStack, Text } from "@chakra-ui/layout";
import { Tag } from "@chakra-ui/react";
import React from "react";
import { truncateHash } from "../pages/play";

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
        <Box spacing={1} maxWidth="50%">
          <Text fontWeight="600">{username}</Text>
          <Tag variant="subtle" colorScheme="whiteAlpha">
            <Text fontSize="0.8rem" isTruncated>
              {truncatedAccount}
            </Text>
          </Tag>
        </Box>
      </HStack>
    </Box>
  );
};

export default UserDetails;
