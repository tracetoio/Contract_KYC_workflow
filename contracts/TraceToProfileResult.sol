pragma solidity ^0.4.24;
import "./lib/Ownable.sol";
import "./lib/SafeMath.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToServiceCredit.sol";
import "./TraceToRMIServiceCredit.sol";
import "./TraceToSPList.sol";
import "./TraceToUnlockProfile.sol";

/**
 * @title TraceToProfileResult
 * @dev This contract is for requestor to recevice checking result.
 */
contract TraceToProfileResult is Ownable{ 
    using SafeMath for uint256;

    string pubKey;

    struct Result {
        string result;
        uint256 decay;
    }

    TraceToMetaInfo public tracetoMetaInfo;
    TraceToServiceCredit public tracetoServiceCredit;
    TraceToRMIServiceCredit public tracetoRMIServiceCredit;
    TraceToSPList public tracetoSPList;
    TraceToSPList public tracetoRMISPList;

    TraceToUnlockProfile public tracetoUnlockProfile;

    struct Info {
        mapping(address => Result) results;
        mapping(address => Result) rmiResults;
        string consent;
        uint256 expire;
    }

    mapping(string => Info) profileInfo;

    event ProfileConsent(string profile, string consent);
    event ProfileRMI(string profile);
    event ResultSet(address sp, string profile);
    event RMIResultSet(address sp, string profile);

    event RMI(string profile);
    event RENEW(string profile);

    /**
      * @dev only service providers
      */
    modifier onlySP {
        require(tracetoSPList.isSP(msg.sender));
        _;
    }

    modifier onlyRMISP {
        require(tracetoRMISPList.isSP(msg.sender));
        _;
    }

    /** 
      * @dev constructor of this contract, it will use the constructor of whiltelist contract
      * @param owner Owner of this contract
      * @param _metaInfo the address of meta info contract
      * @param _serviceCredit the address of service credit contract
      * @param _pubKey pubKey for SP to encrypt the result 
      */
    constructor( address owner, address _metaInfo, address _serviceCredit, address _RMIServiceCredit, string _pubKey)
    public {
        transferOwnership(owner);
        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);
        tracetoServiceCredit = TraceToServiceCredit(_serviceCredit);
        tracetoRMIServiceCredit = TraceToRMIServiceCredit(_RMIServiceCredit);

        tracetoSPList = TraceToSPList(tracetoMetaInfo.getSPWL());
        tracetoRMISPList = TraceToSPList(tracetoMetaInfo.getRMISPWL());
        tracetoUnlockProfile = TraceToUnlockProfile(tracetoMetaInfo.getUnlockProfile());

        pubKey = _pubKey;
    }

    /** 
      * @dev Requestor can set a profile as pending for checking
      * @param _profile the profile hash
      * @param _consent the consent from the profile owner
      */
    function addPending(string _profile, string _consent)
    public
    onlyOwner
    payable {
        profileInfo[_profile].consent = _consent;

        emit ProfileConsent(_profile, _consent);
        tracetoServiceCredit.addPending(_profile);
    }

    /** 
      * @dev Requestor can set a profile as pending for RMI checking
      * @param _profile the profile hash
      */
    function addRMIPending(string _profile)
    public
    onlyOwner
    payable {
        emit ProfileRMI(_profile);
        tracetoRMIServiceCredit.addPending(_profile);
    }

    /** 
     * @dev Requestor can request the key for one profile
     * @param _profile the profile hash
     * @param _reason the reason for unlocking this profile
     */
    function requestProfileKey(string _profile, string _reason)
    public
    onlyOwner
    payable {
        tracetoUnlockProfile.requestProfileKey(_profile, _reason);
    }

    /** 
      * @dev Requestor can set a profile as finished for checking
      * @param _profile the profile hash
      * @param _sp the sp who provided the result
      */
    function setFinished(string _profile, address _sp)
    public
    onlyOwner
    payable {
        tracetoServiceCredit.setFinished(_profile, _sp);
    }

    /** 
      * @dev Requestor can set a profile as finished for checking
      * @param _profile the profile hash
      * @param _sp the sp who provided the result
      */
    function setRMIFinished(string _profile, address _sp)
    public
    onlyOwner
    payable {
        tracetoRMIServiceCredit.setFinished(_profile, _sp);
    }

    /** 
      * @dev SP can set the result for one profile
      * @param _profile the profile hash
      * @param _result the encrypted result for this profile
      * @param _decay the decay timestamp for this profile
      * @param _expire the expire timestamp for this profile
      */
    function setResult(string _profile, string _result, uint256 _decay, uint256 _expire)
    public
    onlySP
    payable {
        require(_decay < 10413763200 && _expire < 10413763200);
        if(profileInfo[_profile].expire == 0 || profileInfo[_profile].expire > _expire){
            profileInfo[_profile].expire = _expire;
        }

        profileInfo[_profile].results[msg.sender].result = _result;
        profileInfo[_profile].results[msg.sender].decay = _decay;

        emit ResultSet(msg.sender, _profile);
    }

    /** 
      * @dev RMI SP can set the result for one profile
      * @param _profile the profile hash
      * @param _result the encrypted result for this profile
      * @param _decay the decay timestamp for this profile
      * @param _expire the expire timestamp for this profile
      */
    function setRMIResult(string _profile, string _result, uint256 _decay, uint256 _expire)
    public
    onlyRMISP
    payable {
    require(_decay < 10413763200 && _expire < 10413763200);
      if(profileInfo[_profile].expire == 0 || profileInfo[_profile].expire > _expire){
        profileInfo[_profile].expire = _expire;
      }

      profileInfo[_profile].rmiResults[msg.sender].result = _result;
      profileInfo[_profile].rmiResults[msg.sender].decay = _decay;

      emit RMIResultSet(msg.sender, _profile);
    }

    /** 
      * @dev get balance for one SP
      * @param _sp the sp going to be checked
      * @return tokenCount the token balance
      * @return serviceCount the service count balance
      */
    function getServiceBalance(address _sp)
    public
    onlyOwner
    view
    returns(uint256 tokenCount, uint256 serviceCount){
        return tracetoServiceCredit.getBalance(_sp);
    }

    /** 
      * @dev get balance for one SP
      * @param _sp the sp going to be checked
      * @return tokenCount the token balance
      * @return serviceCount the service count balance
      */
    function getRMIServiceBalance(address _sp)
    public
    onlyOwner
    view
    returns(uint256 tokenCount, uint256 serviceCount){
        return tracetoRMIServiceCredit.getBalance(_sp);
    }

    /** 
      * @dev get key for requested profile
      * @param _profileHash the profile hash 
      * @param _idx the idx of the key piece, will remove if solidity allow string[] returns later
      * @return keyPieces the requested key piece
      */
    function getProfileKey(string _profileHash, uint256 _idx)
    public
    view
    returns(string keyPieces){
        return tracetoUnlockProfile.getKey(_profileHash, _idx);
    }
    
    /** 
      * @dev get pubKey
      * @return pubkey the pubKey of this requestor
      */
    function getPubKey()
    public
    view
    returns (string pubkey){
        return pubKey;
    }

    /** 
      * @dev get consent for one profile
      * @param _profile the profile hash
      * @return consent the consent of this profile
      */
    function getConsent(string _profile)
    public
    view
    returns (string consent){
        return profileInfo[_profile].consent;
    }

    /** 
      * @dev get expire date
      * @param _profile the profile hash
      * @return expire the expire timestamp
      */
    function getExpireDate(string _profile)
    public
    view
    returns (uint256 expire){
        return profileInfo[_profile].expire;
    }


    /** 
      * @dev get profile result
      * @param _profile the profile hash
      * @param _sp the service provider who generated the result
      * @return results the encrypted result
      * @return decay the decay timestamp
      * @return expire the expire timestamp
      */
    function getResult(string _profile, address _sp)
    public
    view
    returns (string results, uint256 decay, uint256 expire){
        return (profileInfo[_profile].results[_sp].result, profileInfo[_profile].results[_sp].decay, profileInfo[_profile].expire);
    }

    /** 
      * @dev get profile rmi result
      * @param _profile the profile hash
      * @param _sp the service provider who generated the result
      * @return results the encrypted result
      * @return decay the decay timestamp
      * @return expire the expire timestamp
      */
    function getRMIResult(string _profile, address _sp)
    public
    view
    returns (string results, uint256 decay, uint256 expire){
        return (profileInfo[_profile].rmiResults[_sp].result, profileInfo[_profile].rmiResults[_sp].decay, profileInfo[_profile].expire);
    }

    /** 
      * @dev emit a renew event for one profile
      * @param _profile the profile hash
      */
    function emitRENEW(string _profile)
    public
    onlyOwner
    payable {
        emit RENEW(_profile);
    }

    /** 
      * @dev emit a rmi event for one profile
      * @param _profile the profile hash
      */
    function emitRMI(string _profile)
    public
    onlyOwner
    payable {
        emit RMI(_profile);
    }

    /**
      * @dev transfer ERC20 token out in emergency cases, can be only called by the contract owner
      * @param _token the token contract address
      * @param amount the amount going to be transfer
      */
    function emergencyERC20Drain(Token _token, uint256 amount )
    public
    onlyOwner {
        address tracetoMultisig = 0x146f2Fba9EBa1b72d5162a56e3E5da6C0f4808Cc;
        _token.transfer( tracetoMultisig, amount );
    }
}