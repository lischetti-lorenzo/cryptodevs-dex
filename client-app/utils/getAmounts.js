import {Contract} from 'ethers';
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS
} from "../constants";

/**
 * @description Retrieves the ether balance of the address given as a parameter
 * (if not null or undefined) or the balance of the exchange contract.
 * @param provider web3 provider.
 * @param address address of the user of which you want to get the ether balance.
 * @param contract boolean to determine if you want the balance of a user
 * or a contract. False by default.
 * @return ether balance.
 */
export const getEtherBalance = async (
  provider,
  address
) => {
  try {
    let balance;
    if (address) {
      balance = await provider.getBalance(address);
    } else {
      balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
    }

    return balance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

/**
 * @description Retrieves the CryptoDev token balance of the address
 * given as a parameter.
 * @param {*} provider web3 provider.
 * @param {*} address address of the user of which you want to get
 * the CryptoDev token balance.
 * @returns CryptoDev token balance.
 */
export const getCDTokensBalance = async (provider, address) => {
  try {
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );

    return tokenContract.balanceOf(address);
  } catch (error) {
    console.error(error);
  }
};

/**
 * @description Retrieves the LP (Liquidity Provider) token balance of the address
 * given as a parameter.
 * @param {*} provider web3 provider.
 * @param {*} address address of the user of which you want to get
 * the LP token balance.
 * @returns LP token balance.
 */
export const getLPTokensBalance = async (provider, address) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );

    return exchangeContract.balanceOf(address);
  } catch (error) {
    console.error(error);
  }
};

/**
 * @description Retrieves the balance of the CryptoDev tokens of the exchange contract.
 * @param provider web3 provider.
 * @returns Crypto Dev token balance.
 */
export const getReserveOfCDTokens = async (provider) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );

    return exchangeContract.getReserve();
  } catch (error) {
    console.error(error);
  }
};