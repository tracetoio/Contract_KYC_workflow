pragma solidity ^0.4.24;
import "./lib/Whitelist.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./lib/Withdrawable.sol";
    
/**
 * @title TraceToSPList
 * @dev This contract is the whitelist contract for service providers.
 */
contract TraceToSPList is Whitelist{
    using SafeMath for uint256;
    
    struct meta {
        uint256 ratePerService;
        uint256 reputation;
        string companyName;
        string email;
        string uriForRubrics;
        string hashFroRubrics;
        uint256 lv;
        uint256 idx;
    }

    mapping(address => meta) pendingMetaInfo;
    mapping(address => meta) metaInfo;

    address[] spList;

    event NewPendingSP(address sp);
    event RateUpdated(address sp, uint256 rate);

    /**
      * @dev only service providers
      */
    modifier onlySP {
        require(isSP(msg.sender));
        _;
    }

    /** 
      * @dev constructor of this contract, it will use the constructor of whiltelist contract
      * @param owner Owner of this contract
      */
    constructor( address owner ) Whitelist(owner) public {}

    /**  
      * @dev add the current wallet as a pending sp
      * @param _rate the service price for this sp
      * @param _companyName the company name for this sp
      * @param _uriForRubrics IPFS link for a JSON object data which contains rubrics
      * @param _hashFroRubrics hash for the JSON object data
      * @param _lv level of infomation they are checking
      */
    function addPendingSP(uint256 _rate, string _companyName, string _email, string _uriForRubrics, string _hashFroRubrics, uint256 _lv)
    public {
        pendingMetaInfo[msg.sender] = meta(_rate, 100, _companyName, _email, _uriForRubrics, _hashFroRubrics, _lv, 0);

        emit NewPendingSP(msg.sender);
    }

    /**
      * @dev Approve a pending sp, only can be called by the owner
      * @param _sp the address of this sp
      */
    function approveSP(address _sp)
    public
    onlyOwner  {
        spList.push(_sp);
        metaInfo[_sp] = pendingMetaInfo[_sp];
        metaInfo[_sp].idx = spList.length - 1;

        delete pendingMetaInfo[_sp];
        addAddressToWhitelist(_sp);
    }

    /**
      * @dev Remove a sp, only can be called by the owner
      * @param _sp the address of this sp
      */
    function removeSP(address _sp)
    public
    onlyOwner  {
        if(spList.length == 1){
            delete spList[0];
        }else{
            spList[metaInfo[_sp].idx] = spList[spList.length-1];
        }
        spList.length = spList.length-1;
        delete metaInfo[_sp];

        removeAddressFromWhitelist(_sp);
    }

    /**
      * @dev Update reputation for a sp, only can be called by the owner
      * @param _sp the address of this sp
      * @param _reputation the updated reputation
      */
    function setReputation(address _sp, uint256 _reputation)
    public
    onlyOwner {
        metaInfo[_sp].reputation = _reputation;
    }

    /**
      * @dev Update the service price for verifiers themselves, only can be called by the verifiers
      * @param _rate the updated price
      */
    function setRate(uint256 _rate)
    public
    onlySP{
        metaInfo[msg.sender].ratePerService = _rate;
        emit RateUpdated(msg.sender, _rate);
    }

    /**
      * @dev get the full list of SPs
      * @return SPs the list of SPs
      */
    function getSPList()
    public
    view
    returns (address[] SPs){
        return spList;
    }

    /**
      * @dev check whether a wallet is a sp
      * @param _sp the wallet going to be checked
      * @return _isSP true if the user is a sp
      */
    function isSP(address _sp)
    public
    view
    returns (bool _isSP){
        return isWhitelisted(_sp);
    }

    /**
      * @dev get the price for a SP
      * @param _sp the wallet that is going to be checked
      * @return _rate the price in t2t
      */
    function getSPRate(address _sp)
    public
    view
    returns (uint256 _rate){
        return metaInfo[_sp].ratePerService;
    }

    /**
      * @dev check/get details of a pending sp
      * @return _rate the service price for this sp
      * @return _companyName the company name for this sp
      * @return _uriForRubrics IPFS link for a JSON object data which contains rubrics, for the format of rubrics please check docs.traceto.io
      * @return _hashFroRubrics hash for the JSON object data
      * @return _lv level of infomation they are checking
      */
    function getPendingSPDetail(address _sp)
    public
    view
    returns (uint256 _rate, uint256 _reputation, string _companyName, string _email, string _uriForRubrics, string _hashFroRubrics, uint256 _lv){
        return (pendingMetaInfo[_sp].ratePerService, pendingMetaInfo[_sp].reputation, pendingMetaInfo[_sp].companyName, pendingMetaInfo[_sp].email, pendingMetaInfo[_sp].uriForRubrics, pendingMetaInfo[_sp].hashFroRubrics, pendingMetaInfo[_sp].lv);
    }

    /**
      * @dev check get details of a sp
      * @return _rate the service price for this sp
      * @return _companyName the company name for this sp
      * @return _uriForRubrics IPFS link for a JSON object data which contains rubrics
      * @return _hashFroRubrics hash for the JSON object data
      * @return _lv level of infomation they are checking
      */
    function getSPDetail(address _sp)
    public
    view
    returns (uint256 _rate, uint256 _reputation, string _companyName, string _email, string _uriForRubrics, string _hashFroRubrics, uint256 _lv){
        return (metaInfo[_sp].ratePerService, metaInfo[_sp].reputation, metaInfo[_sp].companyName, metaInfo[_sp].email, metaInfo[_sp].uriForRubrics, metaInfo[_sp].hashFroRubrics, metaInfo[_sp].lv);
    }
}