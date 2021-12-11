import { Box, Heading } from "@chakra-ui/layout";
import MetamaskLoginButton from "./MetamaskLoginButton";
import UserProfile from "./UserProfile";

const Header: React.FC<{ account: string }> = ({ account }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="16rem"
      py="2.5rem"
    >
      <Heading fontSize="2rem" letterSpacing="wider">
        Shatranj
      </Heading>
      {account ? <UserProfile account={account} /> : <MetamaskLoginButton />}
    </Box>
  );
};

export default Header;
