pragma solidity 0.4.24;

import "./TraceToServiceCredit.sol";

/**
 * @title TraceToRMIServiceCredit
 * @dev This contract is for keeping the RMI service balance, and notify SP to check RMI profiles
 */
contract TraceToRMIServiceCredit is TraceToServiceCredit{
    /** 
      * @dev constructor of this contract, it will transfer ownership and use the whitelists set in meta info contract 
      * @param owner Owner of this contract
      * @param _metaInfo meta info contract address
      */
    constructor(address owner, address _metaInfo) TraceToServiceCredit(owner, _metaInfo) public {}

    /**
      * @dev topup for one sp, it will withdraw t2t token from your wallet as deposit
      * @param _requestor the requestor PR contract address
      * @param _sp the sp address
      * @param _count the service count
      */
    function topup(address _requestor, address _sp, uint256 _count)
    public {
        require(TraceToRequestorListInterface(tracetoMetaInfo.getRequestorWL()).isRequestorPR(_requestor) && TraceToSPListInterface(tracetoMetaInfo.getRMISPWL()).isSP(_sp));
        require(token.transferFrom(msg.sender, address(this), _count.mul(TraceToSPListInterface(tracetoMetaInfo.getRMISPWL()).getSPRate(_sp))));
        if(!ServiceCredit[_requestor].credits[_sp].isInit){
            ServiceCredit[_requestor].sp.push(_sp);
            ServiceCredit[_requestor].spCount = ServiceCredit[_requestor].spCount.add(1);
            ServiceCredit[_requestor].credits[_sp].isInit = true;
        }

        ServiceCredit[_requestor].credits[_sp].serviceCount = ServiceCredit[_requestor].credits[_sp].serviceCount.add(_count);
        ServiceCredit[_requestor].credits[_sp].tokenCount = ServiceCredit[_requestor].credits[_sp].tokenCount.add(_count.mul(TraceToSPListInterface(tracetoMetaInfo.getRMISPWL()).getSPRate(_sp)));

        emit Topup(_requestor, _sp, _count);
    }
}