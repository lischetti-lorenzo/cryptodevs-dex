import {Contract, utils} from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

/**
 * @description Returns the number of Eth/CryptoDev tokens that will be received 
 * when the user swaps the swap given amount of Crypto Dev tokens/Eth.
 * @param swapAmount Given swap amount.
 * @param provider web3 provider.
 * @param isEth True if we are sending eth to get CryptoDev tokens. False otherwise.
 * @param ethBalance Contract eth balance.
 * @param cdTokenReserve Contract CryptoDev token reserve.
 * @returns Number of Eth/CryptoDev tokens that will be received.
 */
 export const getAmountOfTokensReceivedFromSwap = async (
  swapAmount,
  provider,
  isEth,
  ethBalance,
  reservedCD
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    provider
  );
  let amountOfTokens;
  if (isEth) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      swapAmount,
      ethBalance,
      reservedCD
    );
  } else {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      swapAmount,
      reservedCD,
      ethBalance
    );
  }

  return amountOfTokens;
};

export const swapTokens = async (
  signer,
  isEth,
  swapAmount,
  tokenToBeReceivedAfterSwap
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );

  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  );

  let tx;
  if (isEth) {
    tx = await exchangeContract.ethToCryptoDevToken(
      tokenToBeReceivedAfterSwap,
      {value: swapAmount}
    );
  } else  {
    tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      swapAmount.toString()
    );
    await tx.wait();

    tx = await exchangeContract.cryptoDevTokenToEth(swapAmount, tokenToBeReceivedAfterSwap);
  }

  await tx.wait();
};