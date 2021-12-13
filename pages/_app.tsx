import { ChakraProvider } from "@chakra-ui/react";
import Router from "next/router";
import { MoralisProvider } from "react-moralis";
import "../styles/globals.css";
import theme from "../styles/theme";
import progress from "../widgets/ProgressBar";

/*<---Router Events--->*/
Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

const App = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={theme}>
      <MoralisProvider
        appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
        serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_URL}
      >
        <Component {...pageProps} />
      </MoralisProvider>
    </ChakraProvider>
  );
};

export default App;
