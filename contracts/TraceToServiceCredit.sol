pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./lib/Token.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToRequestorList.sol";
import "./TraceToSPList.sol";

/**
 * @title TraceToServiceCredit
 * @dev This contract is for keeping the service balance, and notify SP to check new profiles.
 */
contract TraceToServiceCredit is Ownable{
    using SafeMath for uint256;
	struct Credit{
        uint256 serviceCount;
        uint256 tokenCount;
        bool isInit;
    }

    struct Service{
    	mapping(address => Credit) credits;

    	address[] sp;
    	uint256 spCount;
    }

    mapping(address => Service) ServiceCredit;

    struct Payment{
        mapping(address => uint256) tokenCount;
    }

    struct RequestorPayment{
        mapping(address => Payment) pending;
    }

    mapping(uint256 => RequestorPayment) PendingPayment; 

    TraceToMetaInfo public tracetoMetaInfo;

    Token public token;
    TraceToRequestorList public tracetoRequestorList;
    TraceToSPList public tracetoSPList;

    /**
      * @dev only requestor who have topped up before
      */
    modifier onlyRequestor {
        require(tracetoRequestorList.isRequestorPR(msg.sender) && ServiceCredit[msg.sender].spCount > 0);
        _;
    }

    /**
      * @dev only service providers
      */
    modifier onlySP {
        require(tracetoSPList.isSP(msg.sender));
        _;
    }

    event Topup(address requestor, address sp, uint256 count);
    event Pending(address requestor, address sp, uint256 profile);
    event Finished(address requestor, address sp, uint256 profile);

    /** 
      * @dev constructor of this contract, it will transfer ownership and use the whitelists set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
	constructor(address owner, address _metaInfo)
    public {
        transferOwnership(owner);
        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);

        token = Token(tracetoMetaInfo.token());

        tracetoRequestorList = TraceToRequestorList(tracetoMetaInfo.getRequestorWL());
        tracetoSPList = TraceToSPList(tracetoMetaInfo.getSPWL());
    }

    /**
      * @dev topup for one sp, it will withdraw t2t token from your wallet
      * @param _requestor the requestor PR contract address
      * @param _sp the sp address
      * @param _count the service count
      */
    function topup(address _requestor, address _sp, uint256 _count)
    public
    payable {
    	require(tracetoRequestorList.isRequestorPR(_requestor) && tracetoSPList.isSP(_sp));
    	assert(token.transferFrom(msg.sender, address(this), _count.mul(tracetoSPList.getSPRate(_sp))));
        if(!ServiceCredit[_requestor].credits[_sp].isInit){
            ServiceCredit[_requestor].sp.push(_sp);
            ServiceCredit[_requestor].spCount = ServiceCredit[_requestor].spCount.add(1);
            ServiceCredit[_requestor].credits[_sp].isInit = true;
        }

        ServiceCredit[_requestor].credits[_sp].serviceCount = ServiceCredit[_requestor].credits[_sp].serviceCount.add(_count);
        ServiceCredit[_requestor].credits[_sp].tokenCount = ServiceCredit[_requestor].credits[_sp].tokenCount.add(_count.mul(tracetoSPList.getSPRate(_sp)));

        emit Topup(_requestor, _sp, _count);
    }

    /**
      * @dev set the profile as pending, deduct the balance
      * @param _sp the sp address
      * @return tokenCount the token balance
      * @return serviceCount the service count balance
      */
    function getBalance(address _sp)
    public
    view
    returns (uint256 tokenCount, uint256 serviceCount){
        if(!ServiceCredit[msg.sender].credits[_sp].isInit){
            return (0, 0);
        }else{
            return (ServiceCredit[msg.sender].credits[_sp].tokenCount, ServiceCredit[msg.sender].credits[_sp].serviceCount);
        }
    }

    /**
      * @dev set the profile as pending, deduct the balance
      * @param _profile the profile hash
      */
    function addPending(uint256 _profile)
    public
    onlyRequestor {
        for(uint256 idx = 0; idx < ServiceCredit[msg.sender].spCount; idx = idx.add(1)){
            address _sp = ServiceCredit[msg.sender].sp[idx];
            if(ServiceCredit[msg.sender].credits[_sp].serviceCount > 0){
                uint256 _price = ServiceCredit[msg.sender].credits[_sp].tokenCount.div(ServiceCredit[msg.sender].credits[_sp].serviceCount);
                ServiceCredit[msg.sender].credits[_sp].tokenCount = ServiceCredit[msg.sender].credits[_sp].tokenCount.sub(_price);
                ServiceCredit[msg.sender].credits[_sp].serviceCount = ServiceCredit[msg.sender].credits[_sp].serviceCount.sub(1);

                PendingPayment[_profile].pending[msg.sender].tokenCount[_sp] = PendingPayment[_profile].pending[msg.sender].tokenCount[_sp].add(_price);
                emit Pending(msg.sender, _sp, _profile);
            }
        }
    }

    /**
      * @dev set the profile as finished for checking, transfer token to sp and verifiers
      * @param _profile the profile hash
      * @param _sp the sp who provide the result
      */
    function setFinished(uint256 _profile, address _sp)
    public
    onlyRequestor {
        assert(
            token.approve(
                _sp,
                PendingPayment[_profile]
                    .pending[msg.sender]
                    .tokenCount[_sp]
                    .mul(tracetoMetaInfo.getSPPercentage())
                    .div(100)
                    .add(token.allowance(address(this), _sp))
            )
        );
        assert(
            token.approve(
                tracetoMetaInfo.getVerifierWL(),
                PendingPayment[_profile]
                    .pending[msg.sender]
                    .tokenCount[_sp]
                    .mul(tracetoMetaInfo.getVerifierPercentage())
                    .div(100)
                    .add(token.allowance(address(this), _sp))
            )
        );
        PendingPayment[_profile].pending[msg.sender].tokenCount[_sp] = 0;
        emit Finished(msg.sender, _sp, _profile);
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