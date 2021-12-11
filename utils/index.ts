/**
 * Generates a unique random id string when called
 */
export const uid = () => Math.random().toString(36).substr(2, 9);

/**
 * Truncates the account hash like Metamask does
 * @param hash Web3 Account Hash
 * @returns Truncated Value of the Hash
 */
export const truncateHash = (hash: string) => {
  return hash.substring(0, 5) + "..." + hash.substring(hash.length - 4);
};
