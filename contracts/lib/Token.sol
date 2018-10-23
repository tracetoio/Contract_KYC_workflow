pragma solidity ^0.4.24;

/**
 * @title Token
 * @dev This contract is provided to make the interface of ERC20 tokens known to the compiler.
 */
contract Token{
	function balanceOf(address _owner) public returns (uint256);
    function transferFrom(address from, address to, uint value) public returns (bool);
    function transfer(address to, uint value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    function allowance(address owner, address spender) public view returns (uint256);
}