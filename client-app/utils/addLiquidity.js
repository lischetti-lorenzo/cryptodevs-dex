import {Contract, utils} from 'ethers';
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS
} from "../constants";

/**
 * @description Add liquidity to the exchange, if the user is adding
 * initial liquidity, user decides the ether and CD tokens he wants to add
 * to the exchange. If he is adding the liquidity after the initial liquidity
 * has already been added then we calculate the Crypto Dev tokens he can add,
 * given the Eth he wants to add by keeping the ratios constant.
 * @param signer web3 signer.
 * @param addCDAmount amount of CryptoDev tokens to be added to the exchange balance.
 * @param addEthAmountWei amount of Ether to be added to the exchange.
 */
export const addLiquidity = async (
  signer,
  addCDAmount,
  addEthAmountWei
) => {
  try {
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );
  
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );

    const approveTx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      addCDAmount.toString()
    );
    await approveTx.wait();

    const addLiquidityTx = await exchangeContract.addLiquidity(
      addCDAmount.toString(),
      {value: addEthAmountWei}
    );
    await addLiquidityTx.wait();
  } catch (error) {
    console.error(error);
  }  
};

/**
 * @description Calculates the CryptoDev tokens that need to be added to the liquidity
 * given a specific amount of ether.
 * @param addEther Amount of ether to be added to the exchange contract balance.
 * @param ethContractBalance Eth contract balance.
 * @param cdTokenContractReserve CryptoDev token contract reserve.
 * @returns Amount of CrytpDev tokens to be added.
 */
export const calculateCDAmount = async (
  addEther = "0",
  ethContractBalance,
  cdTokenContractReserve
) => {
  const addEtherAmountWei = utils.parseEther(addEther);

  // Ratio needs to be maintained when we add liquidty. We need to let
  // the user know for a specific amount of ether how many `CD` tokens
  // He can add so that the price impact is not large.
  // The followed ratio is:
  // (amount of Crypto Dev tokens to be added) / (Crypto Dev tokens balance) = (Eth that would be added) / (Eth reserve in the contract)  
  return addEtherAmountWei.mul(cdTokenContractReserve).div(ethContractBalance);
}