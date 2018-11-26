pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./lib/Withdrawable.sol";

import "./TraceToProfileToken.sol";
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

    TraceToProfileToken public tracetoProfileToken;
    TraceToMetaInfo public tracetoMetaInfo;
    TraceToServiceCredit public tracetoServiceCredit;
    TraceToRMIServiceCredit public tracetoRMIServiceCredit;

    struct Info {
        mapping(address => Result) results;
        mapping(address => Result) rmiResults;
        string consent;
        uint256 expire;
    }

    mapping(uint256 => Info) profileInfo;

    event ProfileConsent(uint256 profile, string consent);
    event ProfileRMI(uint256 profile);
    event ResultSet(address sp, uint256 profile);
    event RMIResultSet(address sp, uint256 profile);

    event RMI(uint256 profile);
    event RENEW(uint256 profile);

    /**
      * @dev only service providers
      */
    modifier onlySP {
        require(TraceToSPList(tracetoMetaInfo.getSPWL()).isSP(msg.sender));
        _;
    }

    modifier onlyRMISP {
        require(TraceToSPList(tracetoMetaInfo.getRMISPWL()).isSP(msg.sender));
        _;
    }

    /** 
      * @dev constructor of this contract, it will use the constructor of whiltelist contract
      * @param owner Owner of this contract
      * @param _metaInfo the address of meta info contract
      * @param _profileToken the address of profile token contract
      * @param _serviceCredit the address of service credit contract
      * @param _RMIServiceCredit the address of rmi service credit contract
      * @param _pubKey pubKey for SP to encrypt the result 
      */
    constructor( address owner, address _profileToken, address _metaInfo, address _serviceCredit, address _RMIServiceCredit, string _pubKey)
    public {
        transferOwnership(owner);
        tracetoProfileToken = TraceToProfileToken(_profileToken);
        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);
        tracetoServiceCredit = TraceToServiceCredit(_serviceCredit);
        tracetoRMIServiceCredit = TraceToRMIServiceCredit(_RMIServiceCredit);

        pubKey = _pubKey;
    }

    /** 
      * @dev Requestor can set a profile as pending for checking
      * @param _profile the profile id
      * @param _consent the consent from the profile owner
      */
    function addPending(uint256 _profile, string _consent)
    public
    onlyOwner {
        profileInfo[_profile].consent = _consent;

        emit ProfileConsent(_profile, _consent);
        tracetoServiceCredit.addPending(_profile);
    }

    /** 
      * @dev Requestor can set a profile as pending for RMI checking
      * @param _profile the profile id
      */
    function addRMIPending(uint256 _profile)
    public
    onlyOwner {
        emit ProfileRMI(_profile);
        tracetoRMIServiceCredit.addPending(_profile);
    }

    /** 
     * @dev Requestor can request the key for one profile
     * @param _profile the profile id
     * @param _reason the reason for unlocking this profile
     */
    function requestProfileKey(uint256 _profile, string _reason)
    public
    onlyOwner {
        TraceToUnlockProfile(tracetoMetaInfo.getUnlockProfile()).requestProfileKey(_profile, _reason);
    }

    /** 
      * @dev Requestor can set a kyc token after finished
      * @param _profile the profile id
      * @param _encryptedKYCResults the kyc result
      * @param _decay the decay for this profile
      */
    function assignKYCToken(uint256 _profile, string _encryptedKYCResults, uint256 _decay)
    public
    onlyOwner {
        tracetoProfileToken.assignKYCToken(_profile, _encryptedKYCResults, _decay);
    }

    /** 
      * @dev Requestor can set a profile as finished for checking
      * @param _profile the profile id
      * @param _sp the sp who provided the result
      */
    function setFinished(uint256 _profile, address _sp)
    public
    onlyOwner {
        tracetoServiceCredit.setFinished(_profile, _sp);
    }

    /** 
      * @dev Requestor can set a profile as finished for checking
      * @param _profile the profile id
      * @param _sp the sp who provided the result
      */
    function setRMIFinished(uint256 _profile, address _sp)
    public
    onlyOwner {
        tracetoRMIServiceCredit.setFinished(_profile, _sp);
    }

    /** 
      * @dev SP can set the result for one profile
      * @param _profile the profile id
      * @param _result the encrypted result for this profile
      * @param _decay the decay timestamp for this profile
      * @param _expire the expire timestamp for this profile
      */
    function setResult(uint256 _profile, string _result, uint256 _decay, uint256 _expire)
    public
    onlySP {
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
      * @param _profile the profile id
      * @param _result the encrypted result for this profile
      * @param _decay the decay timestamp for this profile
      * @param _expire the expire timestamp for this profile
      */
    function setRMIResult(uint256 _profile, string _result, uint256 _decay, uint256 _expire)
    public
    onlyRMISP {
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
      * @return tokenCount the token deposit in the SC contract
      * @return serviceCount the service count balance
      */
    function getServiceBalance(address _sp)
    public
    view
    returns(uint256 tokenCount, uint256 serviceCount){
        return tracetoServiceCredit.getBalance(_sp);
    }

    /** 
      * @dev get balance for one RMI SP
      * @param _sp the sp going to be checked
      * @return tokenCount the token deposit in the RMI SC contract
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
      * @param _profileHash the profile id 
      * @param _idx the idx of the key piece, will remove if solidity allow string[] returns later
      * @return keyPieces the requested key piece
      */
    function getProfileKey(uint256 _profileHash, uint256 _idx)
    public
    view
    returns(string keyPieces){
        return TraceToUnlockProfile(tracetoMetaInfo.getUnlockProfile()).getKey(_profileHash, _idx);
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
      * @param _profile the profile id
      * @return consent the consent of this profile
      */
    function getConsent(uint256 _profile)
    public
    view
    returns (string consent){
        return profileInfo[_profile].consent;
    }

    /** 
      * @dev get expire date
      * @param _profile the profile id
      * @return expire the expire timestamp
      */
    function getExpireDate(uint256 _profile)
    public
    view
    returns (uint256 expire){
        return profileInfo[_profile].expire;
    }


    /** 
      * @dev get profile result
      * @param _profile the profile id
      * @param _sp the service provider who generated the result
      * @return results the encrypted result
      * @return decay the decay timestamp
      * @return expire the expire timestamp
      */
    function getResult(uint256 _profile, address _sp)
    public
    view
    returns (string results, uint256 decay, uint256 expire){
        return (profileInfo[_profile].results[_sp].result, profileInfo[_profile].results[_sp].decay, profileInfo[_profile].expire);
    }

    /** 
      * @dev get profile rmi result
      * @param _profile the profile id
      * @param _sp the service provider who generated the result
      * @return results the encrypted result
      * @return decay the decay timestamp
      * @return expire the expire timestamp
      */
    function getRMIResult(uint256 _profile, address _sp)
    public
    view
    returns (string results, uint256 decay, uint256 expire){
        return (profileInfo[_profile].rmiResults[_sp].result, profileInfo[_profile].rmiResults[_sp].decay, profileInfo[_profile].expire);
    }

    /** 
      * @dev emit a renew event for one profile
      * @param _profile the profile id
      */
    function emitRENEW(uint256 _profile)
    public
    onlyOwner {
        emit RENEW(_profile);
    }

    /** 
      * @dev emit a rmi event for one profile
      * @param _profile the profile id
      */
    function emitRMI(uint256 _profile)
    public
    onlyOwner {
        emit RMI(_profile);
    }
}