import { Box, Heading } from "@chakra-ui/layout";
import { useCookies } from "react-cookie";
import MetamaskLoginButton from "./MetamaskLoginButton";
import UserProfile from "./UserProfile";

const Header = () => {
  const [cookies] = useCookies(["user"]);

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
      {cookies.user ? (
        <UserProfile account={cookies.user} />
      ) : (
        <MetamaskLoginButton />
      )}
    </Box>
  );
};

export default Header;
