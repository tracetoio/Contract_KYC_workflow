pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./lib/Token.sol";

/**
 * @title TraceToMetaInfo
 * @dev This contract is for sharing meta data for other traceto contracts.
 */
contract TraceToMetaInfo is Ownable{
    using SafeMath for uint256;

    address public token;

    address public requestorWL;
    address public spWL;
    address public spRMIWL;
    address public verifierWL;

    address public unlockProfile;

    address public stakeWallet;
    address public verifierTokenDistribution;

    uint256 public SPPercentage;
    uint256 public VerifierPercentage;

    uint256 public minimalStakeAmount;

    string public uriForInfoTemplate;
    string public hashForInfoTemplate;

    /** 
      * @dev constructor of this contract, it will transfer ownership and fix the t2t token address
      * @param owner Owner of this contract
      * @param _token t2t token address
      */
    constructor(address owner, address _token)
    public {
        transferOwnership(owner); // tier 3 Verifier should own this contract
        token = _token;
    }

    /**  
      * @dev set verifier whitelist contract
      * @param _VerifierWL the address of verifier whitelist contract
      */
    function setVerifierWL(address _VerifierWL)
    public
    onlyOwner {
        verifierWL = _VerifierWL;
    }

    /**  
      * @dev set requestor whitelist contract
      * @param _RequestorWL the address of requestor whitelist contract
      */
    function setRequestorWL(address _RequestorWL)
    public
    onlyOwner {
        requestorWL = _RequestorWL;
    }

    /**  
      * @dev set service provider whitelist contract
      * @param _SPWL the address of service provider whitelist contract
      */
    function setSPWL(address _SPWL)
    public
    onlyOwner {
        spWL = _SPWL;
    }

    /**  
      * @dev set service provider whitelist contract
      * @param _SPRMIWL the address of RMI service provider whitelist contract
      */
    function setRMISPWL(address _SPRMIWL)
    public
    onlyOwner {
      spRMIWL = _SPRMIWL;
    }

    /**  
      * @dev set verifier token distribution contract
      * @param _verifierTokenDistribution the address of verifier token distribution contract
      */
    function setVerifierTokenDistribution(address _verifierTokenDistribution)
    public
    onlyOwner {
        verifierTokenDistribution = _verifierTokenDistribution; 
    }

    /**  
      * @dev set stake wallet contract
      * @param _stakeWallet the address of stake wallet contract
      */
    function setStakeWallet(address _stakeWallet)
    public
    onlyOwner {
        stakeWallet = _stakeWallet;
    }

    /**  
      * @dev set unlock profile contract
      * @param _UPcontract the address of unlock profile contract
      */
    function setUnlockProfile(address _UPcontract)
    public
    onlyOwner {
        unlockProfile = _UPcontract;
    }

    /**  
      * @dev set proportion for how much token will transfer to service provider
      * @param _SPPercentage the percentage of costs for service provider
      */
    function setSPPercentage(uint256 _SPPercentage)
    public
    onlyOwner {
        require(_SPPercentage.add(VerifierPercentage) < 90);
        SPPercentage = _SPPercentage;
    }

    /**  
      * @dev set proportion for how much token will transfer to verifier
      * @param _VerifierPercentage the percentage for verifier
      */
    function setVerifierPercentage(uint256 _VerifierPercentage)
    public
    onlyOwner {
        require(_VerifierPercentage.add(SPPercentage) < 90);
        VerifierPercentage = _VerifierPercentage;
    }

    /**  
      * @dev set amount for how much token verifiers need to deposit before joining
      * @param _minimalStakeAmount the amount of usdt
      */
    function setMinimalStakeAmount(uint256 _minimalStakeAmount) 
    public
    onlyOwner {
        minimalStakeAmount = _minimalStakeAmount;
    }

    /**  
      * @dev set the infomation template 
      * @param _uriForInfoTemplate the IPFS link for Info template
      * @param _hashForInfoTemplate the hash of the JSON object
      */
    function setInfoTemplate(string _uriForInfoTemplate, string _hashForInfoTemplate)
    public
    onlyOwner {
        uriForInfoTemplate = _uriForInfoTemplate;
        hashForInfoTemplate = _hashForInfoTemplate;
    }

    /**  
      * @dev get t2t token contract
      * @return _t2tContract the address of t2t token contract
      */
    function getTokenContract()
    public
    view
    returns (address _t2tContract) {
        return token;
    }

    /**  
      * @dev get verifier whitelist contract
      * @return _VerifierWL the address of verifier whitelist contract
      */
    function getVerifierWL()
    public
    view
    returns (address _VerifierWL) {
        return verifierWL;
    }

    /**  
      * @dev get requestor whitelist contract
      * @return _RequestorWL the address of requestor whitelist contract
      */
    function getRequestorWL()
    public
    view
    returns (address _RequestorWL) {
        return requestorWL;
    }

    /**  
      * @dev get service provider whitelist contract
      * @return _SPWL the address of service provider whitelist contract
      */
    function getSPWL()
    public
    view
    returns (address _SPWL) {
        return spWL;
    }

    /**  
      * @dev get service provider whitelist contract
      * @return _SPRMIWL the address of RMI service provider whitelist contract
      */
    function getRMISPWL()
    public
    view
    returns (address _SPRMIWL) {
      return spRMIWL;
    }

    /**  
      * @dev get verifier token distribution contract
      * @return _verifierTokenDistribution the address of verifier token distribution contract
      */
    function getVerifierTokenDistribution()
    public
    view
    returns (address _verifierTokenDistribution) {
        return verifierTokenDistribution; 
    }

    /**  
      * @dev get stake wallet contract
      * @return _stakeWallet the address of stake wallet contract
      */
    function getStakeWallet()
    public
    view
    returns (address _stakeWallet) {
        return stakeWallet;
    }

    
    /**  
      * @dev get unlock profile contract
      * @return _UPcontract the address of unlock profile contract
      */
    function getUnlockProfile()
    public
    view
    returns (address _UPcontract) {
        return unlockProfile;
    }

    /**  
      * @dev get proportion for how much token will transfer to service provider
      * @return _SPPercentage the percentage for service provider
      */
    function getSPPercentage()
    public
    view
    returns (uint256 _SPPercentage) {
        return SPPercentage;
    }

    /**  
      * @dev get proportion for how much token will transfer to verifier
      * @return _VerifierPercentage the percentage for verifier
      */
    function getVerifierPercentage()
    public
    view
    returns (uint256 _VerifierPercentage) {
        return VerifierPercentage;
    }

    /**  
      * @dev get amount for how much token verifiers need to deposit before joining
      * @return _minimalStakeAmount the amount of usdt
      */
    function getMinimalStakeAmount() 
    public
    view
    returns (uint256 _minimalStakeAmount)  {
        return minimalStakeAmount;
    }

    /**  
      * @dev get the infomation template 
      * @return _uriForInfoTemplate the IPFS link for Info template
      * @return _hashForInfoTemplate the hash of the JSON object
      */
    function getInfoTemplate()
    public
    view
    returns (string _uriForInfoTemplate, string _hashForInfoTemplate) {
        return (uriForInfoTemplate, hashForInfoTemplate);
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