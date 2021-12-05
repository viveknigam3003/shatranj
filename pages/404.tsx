import { Button } from "@chakra-ui/button";
import { Flex, Heading, Text } from "@chakra-ui/layout";
import { NextPage } from "next";
import styles from "../styles/Home.module.css";

const Custom404: NextPage = () => {
  return (
    <Flex
      height="100vh"
      className={styles.root}
      flexDir="column"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      py="2rem"
    >
      <Heading fontSize={{ base: "2.5rem", lg: "5rem", xl: "6rem" }}>
        404
      </Heading>
      <Text fontSize={{ base: "1.25rem", xl: "1.5rem" }} color="gray.500">
        This knight seems lost! The treasure you seek is not here.
      </Text>
      <Button as="a" colorScheme="whiteAlpha" variant="ghost" my="4" href="/">
        Back to palace
      </Button>
    </Flex>
  );
};

export default Custom404;
