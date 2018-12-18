pragma solidity 0.4.24;
import "./lib/Whitelist.sol";

interface TraceToRequestorListInterface{
    function addPendingRequestorPR(address _requestorPR, string _country, string _name, string _email, string _uriForMoreDetails, string _hashForMoreDetails) public;
    function approveRequestorPR(address _requestorPR) public;
    function removeRequestorPR(address _requestorPR) public;
    function isRequestorPR(address _requestorPR)  public view returns(bool _isRequestorPR);
    function getPendingRequestorPRMeta(address _requestorPR) public view returns(string _country, string _name, string _email, string _uriForMoreDetails, string _hashForMoreDetails);
    function getRequestorPRMeta(address _requestorPR) public view returns(string _country, string _name, string _email, string _uriForMoreDetails, string _hashForMoreDetails);
}