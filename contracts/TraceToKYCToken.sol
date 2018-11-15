pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";

contract TraceToKYCToken is ERC721Full, Ownable{
	string public constant _name = "TraceToKYCToken";
  	string public constant _symbol = "TKT";
	constructor (address _owner) public ERC721Full(_name, _symbol)
    {
    	transferOwnership(_owner);
    }

    /**
    * Custom accessor to create a unique token
    */
    function mintUniqueTokenTo(
        address _to,
        uint256 _tokenId,
        string  _tokenURI
    ) public onlyOwner
    {
        super._mint(_to, _tokenId);
        super._setTokenURI(_tokenId, _tokenURI);
    }
}