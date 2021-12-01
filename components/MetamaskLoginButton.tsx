import { Button } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useCookies } from "react-cookie";
import { MetamaskIcon } from "./MetamaskIcon";

const MetamaskLoginButton: React.FC = () => {
  const [_, setCookie] = useCookies(["user"]);
  const toast = useToast();

  const connectMetamask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCookie("user", JSON.stringify(accounts[0]), {
        path: "/",
        sameSite: true,
      });
    } catch (err) {
      toast({
        title: "Could Not Connect to Metamask",
        description:
          "Please see if Metamask in installed in your browser and you have an account with it",
        isClosable: true,
        duration: 5000,
        status: "error",
        variant: "subtle",
      });
    }
  };

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
        onClick={connectMetamask}
      >
        Connect Metamask
      </Button>
    </Box>
  );
};
export default MetamaskLoginButton;
