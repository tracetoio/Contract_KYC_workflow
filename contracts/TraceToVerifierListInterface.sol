pragma solidity 0.4.24;

interface TraceToVerifierListInterface{
    function addPendingVerifier(string _urlForUploading, string _hashForUploading) public;
    function approveVerifier(address _verifier, uint256 _tier) public;
    function removeVerifier(address _verifier) public;
    function updateVerifierTier(address _verifier, uint256 _tier) public;
    function setReputation(address _verifier, uint256 _reputation) public;
    function setUrl(string _url, string _hash) public;
    function getVerifierList(uint256 _tier, uint256 _startIdx, uint256 _length) public view returns (address[] verifiers);
    function isVerifier(address _verifier, uint256 _tier) public view returns (bool _isVerifier);
    function getPendingVerifierDetail(address _verifier) public view returns (uint256 _reputation, string _urlForUploading, string _hashForUploading);
    function getVerifierDetail(address _verifier) public view returns (uint256 _reputation, string _urlForUploading, string _hashForUploading);
}