pragma solidity ^0.4.24;


import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Whitelist
 * @dev This contract is the base contract of other whitelist contract.
 */
contract Whitelist is Ownable {
    string public constant ROLE_WHITELISTED = "whitelist";

    struct role {
        mapping (address => bool) bearer;
    }

    mapping (string => role) private roles;

    event RoleAdded(address indexed operator, string role);
    event RoleRemoved(address indexed operator, string role);

    /**
      * @dev Only the wallet in the whitelist.
      */
    modifier onlyIfWhitelisted(address _operator) {
        require(roles[ROLE_WHITELISTED].bearer[_operator]);
        _;
    }


    /** @dev constructor of this contract
      * @param owner Owner of this contract
      */
    constructor( address owner ) public {
        super.transferOwnership(owner);
    }

    /** @dev add an address to whitelist
      * @param _operator the address to be added
      */
    function addAddressToWhitelist(address _operator)
    public
    onlyOwner {
        roles[ROLE_WHITELISTED].bearer[_operator] = true;
        emit RoleAdded(_operator, ROLE_WHITELISTED);
    }

    /** @dev check whether an address is in the whitelist
      * @param _operator the address to be checked
      */
    function isWhitelisted(address _operator)
    public
    view
    returns (bool) {
        return roles[ROLE_WHITELISTED].bearer[_operator];
    }


    /** @dev add a list of address to whitelist
      * @param _operators the list of addresses to be added
      */
    function addAddressesToWhitelist(address[] _operators)
    public
    onlyOwner {
        for (uint256 i = 0; i < _operators.length; i++) {
          addAddressToWhitelist(_operators[i]);
        }
    }

    /** @dev remove an address from whitelist
      * @param _operator the address to be removed
      */
    function removeAddressFromWhitelist(address _operator)
    public
    onlyOwner {
        roles[ROLE_WHITELISTED].bearer[_operator] = false;
        emit RoleRemoved(_operator, ROLE_WHITELISTED);
    }

    /** @dev remove a list of address from whitelist
      * @param _operators the list of addresses to be removed
      */
    function removeAddressesFromWhitelist(address[] _operators)
    public
    onlyOwner {
        for (uint256 i = 0; i < _operators.length; i++) {
          removeAddressFromWhitelist(_operators[i]);
        }
    }

}