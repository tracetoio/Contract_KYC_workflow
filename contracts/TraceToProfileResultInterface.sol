pragma solidity 0.4.24;

interface TraceToProfileResultInterface{
    function addPending(uint256 _profile, string _consent) public;
    function addRMIPending(uint256 _profile) public;
    function requestProfileKey(uint256 _profile, string _reason) public;
    function assignKYCToken(uint256 _profile, string _encryptedKYCResults, uint256 _decay) public;
    function setFinished(uint256 _profile, address _sp) public;
    function setRMIFinished(uint256 _profile, address _sp) public;
    function setResult(uint256 _profile, string _result, uint256 _decay, uint256 _expire) public payable;
    function setRMIResult(uint256 _profile, string _result, uint256 _decay, uint256 _expire) public payable;
    function setReview(address _sp, string _comments, uint256 _reputation) public;
    function setRMIReview(address _sp, string _comments, uint256 _reputation) public;
    function getServiceBalance(address _sp) public view returns(uint256 tokenCount, uint256 serviceCount);
    function getRMIServiceBalance(address _sp) public view returns(uint256 tokenCount, uint256 serviceCount);
    function getProfileKey(uint256 _profileHash, uint256 _idx) public view returns(string keyPieces);
    function getPubKey() public view returns (string pubkey);
    function getConsent(uint256 _profile) public view returns (string consent);
    function getExpireDate(uint256 _profile) public view returns (uint256 expire);
    function getResult(uint256 _profile, address _sp) public view returns (string results, uint256 decay, uint256 expire);
    function getRMIResult(uint256 _profile, address _sp) public view returns (string results, uint256 decay, uint256 expire);
    function emitRENEW(uint256 _profile) public;
    function emitRMI(uint256 _profile) public;
}