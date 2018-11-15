pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./lib/Token.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToVerifierList.sol";

/**
 * @title TracetoStakeWallet
 * @dev This contract is the whitelist contract for verifiers.
 */
contract TraceToStakeWallet is Ownable{
    using SafeMath for uint256;
    mapping(address => Balances) balances;

    struct Balances{
        uint256 totalAmount;
        uint256 counts;
        mapping(uint256 => Balance) balanceList;
    }

    struct Balance{
        uint256 amount;
        uint256 blockNo;
    }

    Token public TUSD;
    TraceToMetaInfo public tracetoMetaInfo;
    TraceToVerifierList public tracetoVerifierList;

    modifier onlyVerifier {
        require(tracetoVerifierList.isVerifier(msg.sender, 1) && balances[msg.sender].totalAmount > 0);
        _;
    }

    event Deposit(address verifier, uint256 amount);
    event Withdraw(address verifier, uint256 amount);
    
    /** 
      * @dev constructor of this contract, it will transfer ownership and fix the tusd token address
      * @param _metaInfo the address of metainfo contract, used to retrieve vlist and min stake
      * @param _tusd it should be 0xdac17f958d2ee523a2206206994597c13d831ec7.
      */
    constructor(address _metaInfo, address _tusd)
    public {
        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);

        transferOwnership(tracetoMetaInfo.getVerifierWL());
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
        TUSD = Token(_tusd);
    }

    /** 
      * @dev deposit for a joining verifier with minimal stake
      * @param _verifier the address of joining verifier
      */
    function preDeposit(address _verifier)
    public
    onlyOwner {
        uint256 tokenAmount = tracetoMetaInfo.getMinimalStakeAmount();
        assert(TUSD.transferFrom(_verifier, address(this), tokenAmount));
        balances[_verifier] = Balances(tokenAmount, 1);
        balances[_verifier].balanceList[balances[_verifier].counts] = Balance(tokenAmount, block.number);
        emit Deposit(_verifier, tokenAmount);
    }

    /** 
      * @dev deposit for a verifier himself, must call by verifier
      * @param _amount the amount to deposit
      */
    function deposit(uint256 _amount)
    public
    onlyVerifier {
        assert(TUSD.transferFrom(msg.sender, address(this), _amount));
        balances[msg.sender].totalAmount = balances[msg.sender].totalAmount.add(_amount);
        balances[msg.sender].counts = balances[msg.sender].counts.add(1);
        balances[msg.sender].balanceList[balances[msg.sender].counts] = Balance(_amount, block.number);
        emit Deposit(msg.sender, _amount);
    }

    /** 
      * @dev withdraw for a quiting verifier with minimal stake
      * @param _verifier the address of quiting verifier
      */
    function withdraw(address _verifier)
    public
    onlyOwner{
        TUSD.approve(_verifier, balances[msg.sender].totalAmount.add(TUSD.allowance(address(this), msg.sender)));
        emit Withdraw(msg.sender, balances[msg.sender].totalAmount);
        delete balances[_verifier];
    }
}