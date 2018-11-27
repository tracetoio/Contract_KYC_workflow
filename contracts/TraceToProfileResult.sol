pragma solidity 0.4.24;
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
 * @dev This contract is for requestor to receive checking result
 * It is deployed by the requestor. The requestor adds the profile that
 * needs to be KYCed in addPending and then the service provider's
 * return the result by writing to the setResult function with the
 * uri location of the result which is encrypted with requestor's keys
 * It additionally, will be only valid till its respective decay period
 * We also have two types of service provider's one that requires a specific set of info
 * and another the RMI(Request for more information) type of service providers,
 * that can ask additional info from users
 */
contract TraceToProfileResult is Withdrawable{ 
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
    constructor( address owner,
      address _profileToken,
      address _metaInfo,
      address _serviceCredit,
      address _RMIServiceCredit,
      string _pubKey)
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
     * @dev Requestor can request the key for one profile, this key will be used to unlock the
     * full information of the user, if the verifier's give the key to the requestor's.
     * @param _profile the profile id
     * @param _reason the reason for unlocking this profile
     */
    function requestProfileKey(uint256 _profile, string _reason)
    public
    onlyOwner {
        TraceToUnlockProfile(tracetoMetaInfo.getUnlockProfile()).requestProfileKey(_profile, _reason);
    }

    /** 
      * @dev Requestor can set a kyc token after finished.
      * @notice A kyc token is an additional badge that is given by each requestor to a user
      * on successfull completion of a KYC as per the rubrics/specifications of that requestor.
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
      * @dev Requestor can set a profile as finished to denote flow complete for a profile.
      * @param _profile the profile id
      * @param _sp the sp who provided the result
      */
    function setFinished(uint256 _profile, address _sp)
    public
    onlyOwner {
        tracetoServiceCredit.setFinished(_profile, _sp);
    }

    /** 
      * @dev Requestor can set a profile as finished to denote RMI flow complete for a profile
      * @param _profile the profile id
      * @param _sp the sp who provided the result
      */
    function setRMIFinished(uint256 _profile, address _sp)
    public
    onlyOwner {
        tracetoRMIServiceCredit.setFinished(_profile, _sp);
    }

    /** 
      * @dev SP can set the service result for one profile
      * @param _profile the profile id
      * @param _result the encrypted result for this profile
      * @param _decay the decay timestamp for this profile
      * @param _expire the expire timestamp for this profile
      */
    function setResult(uint256 _profile, string _result, uint256 _decay, uint256 _expire)
    public
    onlySP
    payable {
        require(_decay > now && _expire > now);
        if(profileInfo[_profile].expire == 0 || profileInfo[_profile].expire > _expire){
            profileInfo[_profile].expire = _expire;
        }

        profileInfo[_profile].results[msg.sender].result = _result;
        profileInfo[_profile].results[msg.sender].decay = _decay;

        emit ResultSet(msg.sender, _profile);
    }

    /** 
      * @dev RMI SP can set the service result for one profile
      * @param _profile the profile id
      * @param _result the encrypted result for this profile
      * @param _decay the decay timestamp for this profile
      * @param _expire the expire timestamp for this profile
      */
    function setRMIResult(uint256 _profile, string _result, uint256 _decay, uint256 _expire)
    public
    onlyRMISP
    payable {
        require(_decay > now && _expire > now);
        if(profileInfo[_profile].expire == 0 || profileInfo[_profile].expire > _expire){
            profileInfo[_profile].expire = _expire;
        }

        profileInfo[_profile].rmiResults[msg.sender].result = _result;
        profileInfo[_profile].rmiResults[msg.sender].decay = _decay;

        emit RMIResultSet(msg.sender, _profile);
    }

    /** 
      * @dev Set a review for a SP
      * @param _sp the sp address
      * @param _comments the comment for this SP
      * @param _reputation the reputation between [1, 10]
      */
    function setReview(address _sp, string _comments, uint256 _reputation)
    public
    onlyOwner {
        tracetoServiceCredit.setReview(_sp, _comments, _reputation);
    }

    /** 
      * @dev Set a review for a RMI SP
      * @param _sp the sp address
      * @param _comments the comment for this SP
      * @param _reputation the reputation between [1, 10]
      */
    function setRMIReview(address _sp, string _comments, uint256 _reputation)
    public
    onlyOwner {
        tracetoRMIServiceCredit.setReview(_sp, _comments, _reputation);
    }

    /** 
      * @dev get balance for one SP, 
      * @notice here when the requestor topup's he gets a certain amount of services. 
      * The token count is the amount paid for those services.
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
      * @dev get key for requested profile, this is used once the verifier's have provided keys.
      * @param _profileHash the profile id 
      * @param _idx the idx of the key piece
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
      * @return returns the encrypted result
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
      * @dev get profile RMI result
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