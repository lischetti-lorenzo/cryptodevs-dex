// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
  address public cryptoDevTokenAddress;

  // Exchange is inheriting ERC20, because our exchange need to mint 
  // and create Crypto Dev LP tokens, and it would keep track of Crypto Dev LP tokens
  constructor(address _cryptoDevToken) ERC20('CryptoDev LP Token', 'CDLP') {
    require(_cryptoDevToken != address(0), 'TOKEN_ADDR_NULL');
    cryptoDevTokenAddress = _cryptoDevToken;
  }

  function getReserve() public view returns (uint) {
    return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
  }

  function addLiquidity(uint _amount) public payable returns (uint) {
    uint liquidity;
    uint ethBalance = address(this).balance;
    uint cryptoDevTokenReserve = getReserve();
    ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);
    if (cryptoDevTokenReserve == 0) {
      cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
      liquidity = ethBalance;
      _mint(msg.sender, liquidity);
    } else {
      uint ethReserve = ethBalance - msg.value;
      uint cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) / ethReserve;
      require(_amount >= cryptoDevTokenAmount, 'LESS_TOKENS_THAN_REQUIRED');
      cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevTokenAmount);
      liquidity = (totalSupply() * msg.value) / ethReserve;
      _mint(msg.sender, liquidity);
    }
    return liquidity;
  }

  function removeLiquidity(uint _amount) public returns (uint, uint) {
    require(_amount > 0, 'AMOUNT_LESS_THAN_ZERO');
    uint ethReserve = address(this).balance;
    uint _totalSupply = totalSupply();

    uint ethAmount = (_amount * ethReserve) / _totalSupply;
    uint cryptoDevTokenAmount = (_amount * getReserve()) / _totalSupply;
    _burn(msg.sender, _amount);

    (bool sent, ) = payable(msg.sender).call{value: ethAmount}('');
    ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);
    require(sent, 'FAILED_SEND_ETHER');
    return(ethAmount, cryptoDevTokenAmount);
  }

  function getAmountOfTokens(
    uint256 inputAmount,
    uint256 inputReserve,
    uint256 outputReserve
  ) public pure returns (uint256) {
    require(inputReserve > 0 && outputReserve > 0, 'INVALID_RESERVES');
    uint256 inputAmountWithoutFee = inputAmount * 99;

    uint256 numerator = inputAmountWithoutFee * outputReserve;
    uint256 denominator = (inputReserve * 100) + inputAmountWithoutFee;
    return numerator / denominator;
  }

  function ethToCryptoDevToken(uint256 _minTokens) public payable {
    uint256 tokensBought = getAmountOfTokens(
      msg.value,
      address(this).balance - msg.value,
      getReserve()
    );

    require(tokensBought >= _minTokens, 'INSUFFICIENT_OUTPUT_TOKEN_AMOUNT');
    ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
  }

  function cryptoDevTokenToEth(uint _tokenAmount, uint _minEth) public {
    uint ethBought = getAmountOfTokens(
      _tokenAmount,
      getReserve(),
      address(this).balance
    );

    require(ethBought >= _minEth, 'INSUFFICIENT_OUTPUT_ETH_AMOUNT');
    ERC20(cryptoDevTokenAddress).transferFrom(
      msg.sender,
      address(this),
      _tokenAmount
    );
    (bool sent, ) = payable(msg.sender).call{value: ethBought}('');
    require(sent, 'FAILED_SEND_ETHER');
  }
}