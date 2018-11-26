pragma solidity 0.4.24;


import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @dev This allows to recover any tokens or Ethers received in a contract.
 * This will prevent any accidental loss of tokens.
 */
contract Withdrawable is Ownable {
    event TokenWithdraw(IERC20 token, uint amount, address sendTo);
    event EtherWithdraw(uint amount, address sendTo);

    /**
     * @dev Withdraw all ERC20 compatible tokens
     * @param token ERC20 The address of the token contract
     */
    function withdrawToken(IERC20 token, uint amount, address sendTo)
    external
    onlyOwner {
        require(token.transfer(sendTo, amount));
        emit TokenWithdraw(token, amount, sendTo);
    }

    /**
     * @dev Withdraw Ethers
     */
    function withdrawEther(uint amount, address sendTo)
    external
    onlyOwner {
        sendTo.transfer(amount);
        emit EtherWithdraw(amount, sendTo);
    }
}