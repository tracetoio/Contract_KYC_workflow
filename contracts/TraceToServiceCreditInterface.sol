pragma solidity 0.4.24;

interface TraceToServiceCreditInterface{
    function topup(address _requestor, address _sp, uint256 _count) public;
    function getBalance(address _sp) public view returns (uint256 tokenCount, uint256 serviceCount);
    function addPending(uint256 _profile) public;
    function setReview(address _sp, string _comments, uint256 _reputation) public;
    function setFinished(uint256 _profile, address _sp) public;
}