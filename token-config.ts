export interface ERC20TokenConfig {
  address: string;
  symbol: string;
  name?: string;
  decimals?: number;
}

export const erc20token: ERC20TokenConfig = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  symbol: "ASHF",
  name: "Asharfi",
  decimals: 18,
};
