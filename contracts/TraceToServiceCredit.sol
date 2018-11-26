pragma solidity 0.4.24;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./lib/Withdrawable.sol";

import "./TraceToMetaInfo.sol";
import "./TraceToRequestorList.sol";
import "./TraceToSPList.sol";

/**
 * @title TraceToServiceCredit
 * @dev This contract is for keeping the service balance, and notify SP to check new profiles.
 */
contract TraceToServiceCredit is Withdrawable{
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
    mapping(address => uint256) PendingSPPayment;
    mapping(address => uint256) PendingVPayment;

    TraceToMetaInfo public tracetoMetaInfo;

    IERC20 public token;

    /**
      * @dev only requestor who have topped up before
      */
    modifier onlyRequestor {
        require(TraceToRequestorList(tracetoMetaInfo.getRequestorWL()).isRequestorPR(msg.sender) && ServiceCredit[msg.sender].spCount > 0);
        _;
    }

    event Topup(address requestor, address sp, uint256 count);
    event Pending(address requestor, address sp, uint256 profile);
    event Finished(address requestor, address sp, uint256 profile);

    event SPReview(address requestor, address sp, string comments, uint256 reputation);

    /** 
      * @dev constructor of this contract, it will transfer ownership and use the whitelists set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
	constructor(address owner, address _metaInfo)
    public {
        transferOwnership(owner);
        tracetoMetaInfo = TraceToMetaInfo(_metaInfo);

        token = IERC20(tracetoMetaInfo.token());
    }

    /**
      * @dev topup for one sp, it will withdraw t2t token from your wallet as deposit
      * @param _requestor the requestor PR contract address
      * @param _sp the sp address
      * @param _count the service count
      */
    function topup(address _requestor, address _sp, uint256 _count)
    public {
    	require(TraceToRequestorList(tracetoMetaInfo.getRequestorWL()).isRequestorPR(_requestor) && TraceToSPList(tracetoMetaInfo.getSPWL()).isSP(_sp));
    	require(token.transferFrom(msg.sender, address(this), _count.mul(TraceToSPList(tracetoMetaInfo.getSPWL()).getSPRate(_sp))));
        if(!ServiceCredit[_requestor].credits[_sp].isInit){
            ServiceCredit[_requestor].sp.push(_sp);
            ServiceCredit[_requestor].spCount = ServiceCredit[_requestor].spCount.add(1);
            ServiceCredit[_requestor].credits[_sp].isInit = true;
        }

        ServiceCredit[_requestor].credits[_sp].serviceCount = ServiceCredit[_requestor].credits[_sp].serviceCount.add(_count);
        ServiceCredit[_requestor].credits[_sp].tokenCount = ServiceCredit[_requestor].credits[_sp].tokenCount.add(_count.mul(TraceToSPList(tracetoMetaInfo.getSPWL()).getSPRate(_sp)));

        emit Topup(_requestor, _sp, _count);
    }

    /**
      * @dev return the remaining token deposit and service count
      * @param _sp the sp address
      * @return tokenCount the token deposit in this contract
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
      * @param _profile the profile id
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
      * @dev Set a review for a SP, can only call by requestor PR contract
      * @param _sp the sp address
      * @param _comments the comment for this SP
      * @param _reputation the reputation between 0-100
      */
    function setReview(address _sp, string _comments, uint256 _reputation)
    public
    onlyRequestor {
        require(TraceToSPList(tracetoMetaInfo.getSPWL()).isSP(_sp) && _reputation <= 100);
        emit SPReview(msg.sender, _sp, _comments, _reputation);
    }

    /**
      * @dev set the profile as finished for checking, transfer token to sp and verifiers
      * @param _profile the profile id
      * @param _sp the sp who provide the result
      */
    function setFinished(uint256 _profile, address _sp)
    public
    onlyRequestor {
        if(token.allowance(address(this), _sp) == 0){
            require(
                token.approve(
                    _sp,
                    PendingPayment[_profile]
                        .pending[msg.sender]
                        .tokenCount[_sp]
                        .mul(tracetoMetaInfo.getSPPercentage())
                        .div(100)
                        .add(PendingSPPayment[_sp])
                )
            );
            PendingSPPayment[_sp] = 0;
        }else{
            PendingSPPayment[_sp] = PendingSPPayment[_sp]
                                    .add(PendingPayment[_profile]
                                        .pending[msg.sender]
                                        .tokenCount[_sp]
                                        .mul(tracetoMetaInfo.getSPPercentage())
                                        .div(100)
                                    );
        }

        address _v = tracetoMetaInfo.getVerifierWL();
        if(token.allowance(address(this), _v) == 0){
            require(
            token.approve(
                tracetoMetaInfo.getVerifierWL(),
                PendingPayment[_profile]
                    .pending[msg.sender]
                    .tokenCount[_sp]
                    .mul(tracetoMetaInfo.getVerifierPercentage())
                    .div(100)
                    .add(PendingVPayment[_v])
                )
            );
            PendingVPayment[_v] = 0;
        }
        else{
            PendingVPayment[_v] = PendingVPayment[_v]
                                    .add(PendingPayment[_profile]
                                        .pending[msg.sender]
                                        .tokenCount[_sp]
                                        .mul(tracetoMetaInfo.getVerifierPercentage())
                                        .div(100)
                                    );
        }
        
        PendingPayment[_profile].pending[msg.sender].tokenCount[_sp] = 0;
        emit Finished(msg.sender, _sp, _profile);
    }
}