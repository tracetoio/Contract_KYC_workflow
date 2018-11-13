pragma solidity ^0.4.24;
import "./lib/Ownable.sol";
import "./lib/SafeMath.sol";
import "./lib/Token.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToVerifierList.sol";

/**
 * @title TraceToPendingToken
 * @dev This contract is to lock and distribute tokens to verifiers.
 */
contract TraceToPendingToken is Ownable{
    using SafeMath for uint256;
    struct Balance{
        mapping(uint256 => uint256) balance;
        uint256 currentBlk;
    }

    uint256 windowSize;

    mapping(address => Balance) verifierBalance;

    TraceToMetaInfo public tracetoMetaInfo;

    Token public token;
    TraceToVerifierList public tracetoVerifierList;

    modifier onlyVerifier {
        require(tracetoVerifierList.isVerifier(msg.sender, 1) && verifierBalance[msg.sender].currentBlk > 0);
        _;
    }

    event Pay(address verifier, uint256 amount);
    event Withdraw(address verifier, uint256 amount);

    /** 
      * @dev constructor of this contract, it will transfer ownership and fix the windowSize
      * @param _metaInfo the address of metainfo contract, used to retrieve vlist and min stake
      * @param _windowSize the window for locking the tokens.
      */
    constructor(address _metaInfo, uint256 _windowSize)
    public {
        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);

        transferOwnership(tracetoMetaInfo.getVerifierWL());

        token = Token(tracetoMetaInfo.token());
        tracetoVerifierList = TraceToVerifierList(tracetoMetaInfo.getVerifierWL());
        windowSize = _windowSize;
    }

    /** 
      * @dev init a verifier by verifer list contract
      * @param _verifier the address of verifer
      */
    function initVerifier(address _verifier)
    public
    onlyOwner{
        verifierBalance[_verifier].currentBlk = block.number.div(windowSize);
    }

    /** 
      * @dev pay a verifier through verifer list contract by other contracts
      * @param _sender the address of the token sender
      * @param _verifier the address of verifier who is going to receive the token
      * @param _tokenAmount the amount of token to pay
      */
    function pay(address _sender, address _verifier, uint256 _tokenAmount)
    public
    onlyOwner {
        assert(token.transferFrom(_sender, address(this), _tokenAmount));
        verifierBalance[_verifier].balance[block.number.div(windowSize)] = verifierBalance[_verifier].balance[block.number.div(windowSize)].add(_tokenAmount);
        emit Pay(_verifier, _tokenAmount);
    }

    /** 
      * @dev withdraw by verifiers, it will approve the tokens before the latest locking window
      */
    function withdraw()
    public
    onlyVerifier{
        uint256 balance = 0;
        for(uint256 idx = verifierBalance[msg.sender].currentBlk; idx < block.number.div(windowSize)-1; idx = idx.add(1)){
            balance = balance.add(verifierBalance[msg.sender].balance[idx]);
            delete verifierBalance[msg.sender].balance[idx];
        }
        verifierBalance[msg.sender].currentBlk = block.number.div(windowSize)-1;
        token.approve(msg.sender, balance.add(token.allowance(address(this), msg.sender)));
        emit Withdraw(msg.sender, balance);
    }
}