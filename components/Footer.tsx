import { Flex, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import styles from "../styles/Home.module.css";

const Footer: React.FC = () => {
  return (
    <Flex
      width="100%"
      flexDir="column"
      justifyContent="center"
      alignItems="center"
      className={styles.footer}
    >
      <Text color="gray.500">Developed by Team Web23</Text>
      <HStack color="gray.500" p="2">
        <Link passHref href="/about">
          <Text className={styles.link}>About</Text>
        </Link>
        <Link passHref href="/instruction">
          <Text className={styles.link}>How to play</Text>
        </Link>
      </HStack>
    </Flex>
  );
};

export default Footer;
