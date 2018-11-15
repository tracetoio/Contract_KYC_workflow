pragma solidity ^0.4.24;

import "./TraceToKYCToken.sol";

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./lib/Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToRequestorList.sol";
import "./TraceToVerifierList.sol";



/**
 * @title TraceToProfile
 * @dev This contract is for storing the mapping between wallets, profiles and ipfs links.
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
        uint256 totalKYCTokens;
        mapping(uint256 => uint256) kycTokenIdList;
    }


    mapping(uint256 => ProfileToken) profileTokens;
    mapping(address => address) public kycTokenContracts;

    mapping(address => UserProfileTokens) UserProfileTokenList;

    uint256 profileTokenCount;
    uint256 kycTokenCount;

    TraceToMetaInfo public tracetoMetaInfo;
    TraceToRequestorList public traceToRequestorList;
    TraceToVerifierList public tracetoVerifierList;

    /**
      * @dev Only the tier 3 verifier in the verifier list contract.
      */
    modifier onlyVerifier {
        require(tracetoVerifierList.isVerifier(msg.sender, 3));
        _;
    }

    modifier onlyRequestor {
        require(traceToRequestorList.isRequestorPR(msg.sender));
        _;
    }

    event ProfileTokenAssigned(address user, uint256 tokenId, string profileHash);
    event KYCTokenContractDeployed(address requestorPR, address kycTokenContract);

    /** 
      * @dev constructor of this contract, it will transfer ownership and use the verifier list set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
    constructor(address owner, address _metaInfo)
    public {
        transferOwnership(owner);

        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);
        traceToRequestorList = TraceToRequestorList(tracetoMetaInfo.getRequestorWL());
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
    }

    function assignProfileToken(address _user, string _profileHash, string _ipfs)
    public
    onlyVerifier {
        if(!UserProfileTokenList[_user].isInit){
            UserProfileTokenList[_user] = UserProfileTokens(0, true);
        }
        profileTokenCount = profileTokenCount.add(1);
        uint256 _tokenCount = profileTokenCount;

        UserProfileTokenList[_user].ProfileTokenIdList[UserProfileTokenList[_user].totalProfileTokens] = _tokenCount;
        UserProfileTokenList[_user].totalProfileTokens = UserProfileTokenList[_user].totalProfileTokens.add(1);
        
        profileTokens[_tokenCount] = ProfileToken(_user, _profileHash, _ipfs, 0);
        emit ProfileTokenAssigned(_user, _tokenCount, _profileHash);
    }

    function initKYCTokenContract()
    public
    onlyRequestor{
        require(kycTokenContracts[msg.sender]==address(0));
        TraceToKYCToken kycToken = new TraceToKYCToken(msg.sender);
        kycTokenContracts[msg.sender] = kycToken;
        emit KYCTokenContractDeployed(msg.sender, kycToken);
    }

    function ownerOfProfileToken(uint256 tokenId)
    public
    view
    returns (address owner){
        return profileTokens[tokenId].owner;
    }

    function getProfile(uint256 tokenId)
    public
    view
    returns (string _profileHash, string _profileIPFS){
        return (profileTokens[tokenId].profileHash, profileTokens[tokenId].uriForProfileIPFS); 
    }

    function getUserProfileTokenCount(address _user)
    public
    view
    returns (uint256 _profileCount){   
        return UserProfileTokenList[_user].totalProfileTokens;
    }

    function getUserProfileTokens(address _user)
    public
    view
    returns (uint256[] _profileTokens){
        _profileTokens = new uint256[](UserProfileTokenList[_user].totalProfileTokens);
        for (uint256 i = 0; i<UserProfileTokenList[_user].totalProfileTokens; i = i.add(1)){
            _profileTokens[i] = UserProfileTokenList[_user].ProfileTokenIdList[i];
        }
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
