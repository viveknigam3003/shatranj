interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

//https://chainid.network/chains.json
export const networks: { [key: string]: AddEthereumChainParameter } = {
  "polygon-testnet-mumbai": {
    chainName: "Polygon Testnet Mumbai",
    rpcUrls: [
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-mumbai.chainstacklabs.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    chainId: `0x${Number(80001).toString(16)}`,
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  },
  polygon: {
    chainName: "Polygon Mainnet",
    rpcUrls: [
      "https://polygon-rpc.com/",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    chainId: `0x${Number(137).toString(16)}`,
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  localhost: {
    chainName: "Localhost 8545",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ['https://127.0.0.1:8545'],
    chainId: `0x${Number(1337).toString(16)}`
  }
};
