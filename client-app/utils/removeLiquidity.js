import {BigNumber, Contract} from 'ethers';
import {EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS} from '../constants';

/**
 * Removes the given amount of LP tokens from liquidity and also the calculated
 * amount of `ether` and `CryptoDev` tokens.
 * @param signer web3 signer.
 * @param lpAmountToRemove Amount of lp tokens to remove.
 */
export const removeLiquidity = async (signer, lpAmountToRemove) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );

    const tx = await exchangeContract.removeLiquidity(lpAmountToRemove);
    await tx.wait();
  } catch (error) {
    console.error(error);
  }
};

/**
 * @description Calculates the amount of `Eth` and `CryptoDev` tokens
 * that would be returned back to user after he removes a specific amount
 * of LP tokens from the contract
 * @param provider web3 provider.
 * @param lpTokensToRemove Amount of lp tokens to remove from liquidity.
 * @param ethBalance Contract eth balance.
 * @param cryptoDevTokenReserve Contract CryptoDev token reserve
 * @returns Eth and CryptoDev token amounts to remove from the exchange contract.
 */
export const getTokensAfterRemove = async (
  provider,
  lpTokensToRemove,
  ethBalance,
  cryptoDevTokenReserve
) => {
  const zero = BigNumber.from(0);
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );

    const lpTotalSupply = await exchangeContract.totalSupply();
    const ethToRemove = lpTotalSupply.eq(zero) ? zero : lpTokensToRemove.mul(ethBalance).div(lpTotalSupply);
    const cdTokensToRemove = lpTotalSupply.eq(zero) ? zero : lpTokensToRemove.mul(cryptoDevTokenReserve).div(lpTotalSupply);
    return {
      ethToRemove,
      cdTokensToRemove
    };
  } catch (error) {
    console.error(error);
  }
};