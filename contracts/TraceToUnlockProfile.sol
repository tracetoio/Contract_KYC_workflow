pragma solidity ^0.4.24;
import "./lib/Ownable.sol";
import "./lib/Token.sol";
import "./lib/SafeMath.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToRequestorList.sol";
import "./TraceToVerifierList.sol";

/**
 * @title TraceToUnlockProfile
 * @dev This contract is for requestor to request the key for profiles.
 */
contract TraceToUnlockProfile is Ownable{
    using SafeMath for uint256;
    struct ProfileKey {
        string[] keyPieces;
        uint256 keyCount;
        mapping(bytes32 => bool) keyPieceExists;
        bool isInit;
    }

    struct RequestedProfile {
        mapping(uint256 => ProfileKey) RequestedProfiles;
        mapping(uint256 => string) reasons;
    }

    mapping(address => RequestedProfile) requests;

    uint256 minCount = 10;

    TraceToMetaInfo public tracetoMetaInfo;
    TraceToRequestorList public tracetoRequestorList;
    TraceToVerifierList public tracetoVerifierList;

    event ProfileRequested(uint256 profile, string reason, address requestor);
    event KeyShared(uint256 profile, address requestor);

    /**
      * @dev Only the requestor in the requestor list contract.
      */
    modifier onlyRequestor {
        require(tracetoRequestorList.isRequestorPR(msg.sender));
        _;
    }

    modifier onlyVerifier {
        require(tracetoVerifierList.isVerifier(msg.sender, 1));
        _;
    }

    /** 
      * @dev constructor of this contract, it will transfer ownership and use the requestor list and verifier list set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
    constructor(address owner, address _metaInfo)
    public {
        transferOwnership(owner);

        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);
        tracetoRequestorList = TraceToRequestorList(tracetoMetaInfo.getRequestorWL());
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
    }

    /**  
      * @dev request to unlock a new profile
      * @param _profileId the profile hash 
      * @param _reason the reason for unlocking this profile
      */
    function requestProfileKey(uint256 _profileId, string _reason)
    public
    onlyRequestor{
        assert(!requests[msg.sender].RequestedProfiles[_profileId].isInit);

        requests[msg.sender].RequestedProfiles[_profileId].isInit = true;
        requests[msg.sender].reasons[_profileId] = _reason;

        emit ProfileRequested(_profileId, _reason, msg.sender);
    }

    /**  
      * @dev share the encrypted key piece of one profile to one requestor, can be called by verifier only
      * @param _profileId the profile hash 
      * @param _keyPiece the encrypted key piece, the duplicate one will be rejected
      * @param _requestor the requestor who will get this piece
      */
    function setKey(uint256 _profileId, string _keyPiece, address _requestor)
    public
    onlyVerifier{
        assert(!requests[_requestor].RequestedProfiles[_profileId].keyPieceExists[keccak256(bytes(_keyPiece))]);
        requests[_requestor].RequestedProfiles[_profileId].keyPieces.push(_keyPiece);
        requests[_requestor].RequestedProfiles[_profileId].keyCount = requests[_requestor].RequestedProfiles[_profileId].keyCount.add(1);
        requests[_requestor].RequestedProfiles[_profileId].keyPieceExists[keccak256(bytes(_keyPiece))] = true;

        if(requests[_requestor].RequestedProfiles[_profileId].keyCount >= minCount)
            emit KeyShared(_profileId, _requestor);
    }

    /**  
      * @dev get the reason for one request
      * @param _profileId the profile hash 
      * @param _requestor the requestor who requested this profile
      */
    function getReason(uint256 _profileId, address _requestor)
    public
    view
    returns (string reason){
        return requests[_requestor].reasons[_profileId];
    }

    /**  
      * @dev once the key is shared, requestor can retrieve the key via this function
      * @param _profileId the profile hash 
      * @param _idx the idx of the key piece, will remove if solidity allow string[] returns later
      * @return keyPieces the requested key piece
      */
    function getKey(uint256 _profileId, uint256 _idx)
    public
    onlyRequestor
    view
    returns (string _keyPieces){
        assert(requests[msg.sender].RequestedProfiles[_profileId].isInit
            && requests[msg.sender].RequestedProfiles[_profileId].keyCount >= minCount 
            && _idx >= 0 
            && _idx < minCount);

        return requests[msg.sender].RequestedProfiles[_profileId].keyPieces[_idx];
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
