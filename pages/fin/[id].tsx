import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useMoralis } from "react-moralis";
import Header from "../../components/Header";
import styles from "../../styles/Play.module.css";
import { PlayPageProps } from "../play/[id]";

const Fin: NextPage<PlayPageProps> = ({ data }) => {
  const { user } = useMoralis();
  const router = useRouter();
  const [userEthAddress, setUserEthAddress] = useState<string>("");

  useEffect(() => {
    if (user) {
      setUserEthAddress(user.attributes.ethAddress);
    }
  }, [user]);

  return (
    <Box height="100vh" className={styles.root}>
      <Header account={userEthAddress} />
      <Center flexDir="column" height="50vh">
        <Center flexDir="column" pb="8">
          <Heading fontWeight="500">This Match has already ended</Heading>
          {data.winner && (
            <Text fontSize="1.25rem">Winner - {data.winner}</Text>
          )}
        </Center>
        <Button
          colorScheme="green"
          width="fit-content"
          leftIcon={<FaArrowLeft />}
          size="lg"
          onClick={() => router.push("/")}
        >
          Start New Match
        </Button>
      </Center>
    </Box>
  );
};

export default Fin;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  //Try to get token from cookies.
  const { id } = ctx.params;

  let data;
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_SERVER + `/match?match_id=${id}`
    );
    data = await response.json();
    if (!data.winner) {
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    }
  } catch {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }

  if (!data) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
    };
  }

  return {
    props: {
      data,
    },
  };
};
