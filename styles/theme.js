import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    body: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
    heading: "Epilogue, sans-serif",
    monospace: "Roboto Mono",
  },
  colors: {
    black: "#1A1110",
    white: "#fffafa"
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: 300
      }
    }
  },
});

export default theme;
