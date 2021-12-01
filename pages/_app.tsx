import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/roboto-mono";
import "@fontsource/mulish";
import "@fontsource/mulish/600.css";
import "@fontsource/mulish/800.css";
import theme from "../styles/theme";

const App = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default App;
