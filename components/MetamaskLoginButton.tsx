import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { MetamaskIcon } from "./MetamaskIcon";

const MetamaskLoginButton: React.FC = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Button
        colorScheme="orange"
        variant="outline"
        leftIcon={<MetamaskIcon />}
      >
        Connect Metamask
      </Button>
    </Box>
  );
};
export default MetamaskLoginButton;
