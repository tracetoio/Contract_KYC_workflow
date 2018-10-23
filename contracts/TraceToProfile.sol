pragma solidity ^0.4.24;
import "./lib/Ownable.sol";
import "./lib/Token.sol";
import "./lib/SafeMath.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToVerifierList.sol";

/**
 * @title TraceToProfile
 * @dev This contract is for storing the mapping between wallets, profiles and ipfs links.
 */
contract TraceToProfile is Ownable{
    using SafeMath for uint256;
    struct UserProfile {
        mapping(uint256 => string) ProfileList;
        uint256 totalProfiles;
        bool isInit;
    }

    mapping(bytes32 => UserProfile) UserProfileList;

    mapping(string => string) ProfileIPFS;

    TraceToMetaInfo public tracetoMetaInfo;
    TraceToVerifierList public tracetoVerifierList;

    /**
      * @dev Only the tier 3 verifier in the verifier list contract.
      */
    modifier onlyVerifier {
        require(tracetoVerifierList.isVerifier(msg.sender, 3));
        _;
    }

    event SetProfile(bytes32 _user, string _profileHash);

    /** 
      * @dev constructor of this contract, it will transfer ownership and use the verifier list set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
    constructor(address owner, address _metaInfo)
    public {
        transferOwnership(owner);

        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
    }

    /**  
      * @dev adding a new profile for one user
      * @param _user hash for user's wallet address
      * @param _profileHash the profile hash 
      * @param _ipfs the IPFS link for this profile
      */
    function addProfile(bytes32 _user, string _profileHash, string _ipfs)
    public
    onlyVerifier {
        if(!UserProfileList[_user].isInit){
            UserProfileList[_user] = UserProfile(0, true);
        }
        UserProfileList[_user].ProfileList[UserProfileList[_user].totalProfiles] = _profileHash;
        UserProfileList[_user].totalProfiles = UserProfileList[_user].totalProfiles.add(1);
        ProfileIPFS[_profileHash] = _ipfs;
        emit SetProfile(_user, _profileHash);
    }

    /**  
      * @dev get IPFS link for one profile
      * @param profile the profile hash 
      * @return _profileIPFS the IPFS link for this profile
      */
    function getIPFSLink(string profile)
    public
    view
    returns (string _profileIPFS){
        return ProfileIPFS[profile]; 
    }

    /**  
      * @dev get profile for one user
      * @param _user hash for user's wallet address
      * @return _profile the latest profile for this user
      */
    function getUserProfile(bytes32 _user)
    public
    view
    returns (string _profile){   
        return UserProfileList[_user].ProfileList[UserProfileList[_user].totalProfiles.sub(1)];
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
