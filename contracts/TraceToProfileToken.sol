pragma solidity ^0.4.24;
import "./lib/Ownable.sol";
import "./lib/Token.sol";
import "./lib/SafeMath.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToRequestorList.sol";
import "./TraceToSPList.sol";
import "./TraceToVerifierList.sol";

/**
 * @title TraceToProfileToken
 * @dev This contract is special NFT token contract for profiles and kyc results.
 */
contract TraceToProfileToken is Ownable{
    using SafeMath for uint256;
    struct UserProfileTokens {
        mapping(uint256 => uint256) ProfileTokenIdList;
        uint256 totalProfileTokens;
        bool isInit;
    }

    struct ProfileToken {
        address owner;
        string profileHash;
        string uriForProfileIPFS;
        bool isRMIRequired;
        uint256 totalKYCTokens;
        mapping(uint256 => uint256) kycTokenIdList;
        uint256 expire;
    }

    struct KYCToken {
        uint256 owner;
        address requestor;
        string encryptedKYCResults;
        uint256 decay;
    }

    mapping(uint256 => ProfileToken) profileTokens;
    mapping(uint256 => KYCToken) kycTokens;

    mapping(string => uint256) profileId;

    mapping(address => UserProfileTokens) UserProfileTokenList;

    uint256 profileTokenCount;
    uint256 kycTokenCount;

    TraceToMetaInfo public tracetoMetaInfo;
    TraceToRequestorList public tracetoRequestorList;
    TraceToSPList public tracetoSPList;
    TraceToSPList public tracetoRMISPList;
    TraceToVerifierList public tracetoVerifierList;

    /**
      * @dev Only the tier 3 verifier in the verifier list contract.
      */
    modifier onlyVerifier {
        require(tracetoVerifierList.isVerifier(msg.sender, 3));
        _;
    }

    modifier onlyRequestor {
        require(tracetoRequestorList.isRequestorPR(msg.sender));
        _;
    }

    modifier onlySP {
        require(tracetoSPList.isSP(msg.sender) || tracetoRMISPList.isSP(msg.sender));
        _;
    }

    event ProfileTokenAssigned(address _user, uint256 tokenId, string profileHash, string ipfs);
    event KYCTokenAssigned(uint256 profileTokenId, uint256 kycTokenId);
    event RequestForRMI(uint256 profileTokenId);

    /** 
      * @dev constructor of this contract, it will transfer ownership and use the verifier list set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
    constructor(address owner, address _metaInfo)
    public {
        transferOwnership(owner);

        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);
        tracetoRequestorList = TraceToRequestorList(tracetoMetaInfo.getRequestorWL());
        tracetoSPList = TraceToSPList(tracetoMetaInfo.getSPWL());
        tracetoSPList = TraceToSPList(tracetoMetaInfo.getRMISPWL());
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
    }

    function assignProfileToken(address _user, string _profileHash, string _ipfs)
    public
    onlyVerifier {
        require(profileId[_profileHash] == 0);
        if(!UserProfileTokenList[_user].isInit){
            UserProfileTokenList[_user] = UserProfileTokens(0, true);
        }
        profileTokenCount = profileTokenCount.add(1);
        uint256 _tokenCount = profileTokenCount;

        UserProfileTokenList[_user].ProfileTokenIdList[UserProfileTokenList[_user].totalProfileTokens] = _tokenCount;
        UserProfileTokenList[_user].totalProfileTokens = UserProfileTokenList[_user].totalProfileTokens.add(1);
        
        profileTokens[_tokenCount] = ProfileToken(_user, _profileHash, _ipfs, false, 0, 0);
        profileId[_profileHash] = _tokenCount;
        emit ProfileTokenAssigned(_user, _tokenCount, _profileHash, _ipfs);
    }

    function setExpiry(uint256 _tokenId, uint256 _expire)
    public
    onlySP{
        profileTokens[_tokenId].expire = _expire;
    }

    function assignProfileAsRMI(uint256 _tokenId)
    public
    onlyVerifier {
        profileTokens[_tokenId].isRMIRequired = true;
        emit RequestForRMI(_tokenId);
    }

    function assignKYCToken(uint256 _tokenId, string _encryptedKYCResults, uint256 _decay)
    public
    onlyRequestor {
        kycTokenCount = kycTokenCount.add(1);
        uint256 _tokenCount = kycTokenCount;

        profileTokens[_tokenId].kycTokenIdList[profileTokens[_tokenId].totalKYCTokens] = kycTokenCount;
        profileTokens[_tokenId].totalKYCTokens = profileTokens[_tokenId].totalKYCTokens.add(1);

        kycTokens[_tokenCount] = KYCToken(_tokenId, msg.sender, _encryptedKYCResults, _decay);
        emit KYCTokenAssigned(_tokenId, _tokenCount);
    }

    function ownerOfProfileToken(uint256 tokenId)
    public
    view
    returns (address owner){
        return profileTokens[tokenId].owner;
    }

    function ownerOfKYCToken(uint256 tokenId)
    public
    view
    returns (address owner){
        return profileTokens[kycTokens[tokenId].owner].owner;
    }

    function getProfile(uint256 tokenId)
    public
    view
    returns (string _profileHash, string _profileIPFS, uint256 _expire){
        return (profileTokens[tokenId].profileHash, profileTokens[tokenId].uriForProfileIPFS, profileTokens[tokenId].expire); 
    }

    function getUserProfileTokenCount(address _user)
    public
    view
    returns (uint256 _profileCount){   
        return UserProfileTokenList[_user].totalProfileTokens;
    }

    function getUserProfileTokenList(address _user)
    public
    view
    returns (uint256[] _profileTokens){
        _profileTokens = new uint256[](UserProfileTokenList[_user].totalProfileTokens);
        for (uint256 i = 0; i<UserProfileTokenList[_user].totalProfileTokens; i = i.add(1)){
            _profileTokens[i] = UserProfileTokenList[_user].ProfileTokenIdList[i];
        }
    }

    function getUserProfileToken(string _profileHash)
    public
    view
    returns (uint256 _profileToken){
        require(profileTokens[profileId[_profileHash]].owner == msg.sender);
        return profileId[_profileHash];
    }

    function getKYC(uint256 tokenId)
    public
    view
    returns (address _requestor, string _encryptedKYCResults, uint256 _decay){
        return (kycTokens[tokenId].requestor, kycTokens[tokenId].encryptedKYCResults, kycTokens[tokenId].decay);
    }

    function getProfileKYCCount(uint256 tokenId)
    public
    view
    returns (uint256 _kycCount){
        return profileTokens[tokenId].totalKYCTokens;
    }

    function getProfileKYCs(uint256 tokenId)
    public
    view
    returns (uint256[] _kycTokens){
        _kycTokens = new uint256[](profileTokens[tokenId].totalKYCTokens);
        for (uint256 i = 0; i<profileTokens[tokenId].totalKYCTokens; i = i.add(1)){
            _kycTokens[i] = profileTokens[tokenId].kycTokenIdList[i];
        }
    }

    /**
      * @dev sync whitelist contract with meata info contract
      */
    function syncWithMetaInfo()
    public
    onlyOwner{
        tracetoRequestorList = TraceToRequestorList(tracetoMetaInfo.getRequestorWL());
        tracetoSPList = TraceToSPList(tracetoMetaInfo.getSPWL());
        tracetoSPList = TraceToSPList(tracetoMetaInfo.getRMISPWL());
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
    }

    /**
      * @dev transfer ERC20 token out in emergency cases, can be only called by the contract owner
      * @param _token the token contract address
      * @param amount the amount going to be transfer
      */
    function emergencyERC20Drain(Token _token, uint256 amount )
    public
    onlyOwner  {
        address tracetoMultisig = 0x146f2Fba9EBa1b72d5162a56e3E5da6C0f4808Cc;
        _token.transfer( tracetoMultisig, amount );
    }
}
