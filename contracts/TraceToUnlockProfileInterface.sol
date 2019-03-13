pragma solidity 0.4.24;

interface TraceToUnlockProfileInterface{
    function requestProfileKey(uint256 _profileHash, string _reason) public;
    function setKey(uint256 _profileHash, string _keyPiece, address _requestor) public;
    function getReason(uint256 _profileHash, address _requestor) public view returns (string reason);
    function getKey(uint256 _profileHash, uint256 _idx) public view returns (string _keyPieces);
}
