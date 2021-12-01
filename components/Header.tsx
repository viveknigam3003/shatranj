import { Box, GridItem, Heading } from "@chakra-ui/layout";
import { useCookies } from "react-cookie";
import MetamaskLoginButton from "./MetamaskLoginButton";
import UserProfile from "./UserProfile";

const Header = () => {
  const [cookies] = useCookies(["user"]);

  return (
    <>
      <GridItem colStart={3} colSpan={6}>
        <Box px="4rem" py="2rem">
          <Heading fontSize="2rem" letterSpacing="wider">
            SHATRANJ
          </Heading>
        </Box>
      </GridItem>
      <GridItem colStart={9} colSpan={2}>
        {cookies.user ? (
          <UserProfile user={cookies.user} />
        ) : (
          <MetamaskLoginButton />
        )}
      </GridItem>
    </>
  );
};

export default Header;
