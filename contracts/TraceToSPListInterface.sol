pragma solidity 0.4.24;

interface TraceToSPListInterface{
    function addPendingSP(uint256 _rate, string _companyName, string _email, string _uriForRubrics, string _hashFroRubrics, uint256 _lv) public;
    function approveSP(address _sp) public;
    function removeSP(address _sp) public;
    function setRate(uint256 _rate) public;
    function getSPList(uint256 _startIdx, uint256 _length) public view returns (address[] SPs);
    function isSP(address _sp) public view returns (bool _isSP);
    function getSPRate(address _sp) public view returns (uint256 _rate);
    function getPendingSPDetail(address _sp) public view returns (uint256 _rate, string _companyName, string _email, string _uriForRubrics, string _hashFroRubrics, uint256 _lv);
    function getSPDetail(address _sp) public view returns (uint256 _rate, string _companyName, string _email, string _uriForRubrics, string _hashFroRubrics, uint256 _lv);
}