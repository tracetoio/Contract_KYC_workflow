pragma solidity 0.4.24;

interface TraceToMetaInfoInterface{
    function setVerifierWL(address _VerifierWL) public;
    function setRequestorWL(address _RequestorWL) public;
    function setSPWL(address _SPWL) public;
    function setRMISPWL(address _SPRMIWL) public;
    function setUnlockProfile(address _UPcontract) public;
    function setSPPercentage(uint256 _SPPercentage) public;
    function setVerifierPercentage(uint256 _VerifierPercentage) public;
    function setMinimalStakeAmount(uint256 _minimalStakeAmount)  public;
    function setInfoTemplate(string _uriForInfoTemplate, string _hashForInfoTemplate) public;
    function getTokenContract() public view returns (address _t2tContract);
    function getVerifierWL() public view returns (address _VerifierWL);
    function getRequestorWL() public view returns (address _RequestorWL);
    function getSPWL() public view returns (address _SPWL);
    function getRMISPWL() public view returns (address _SPRMIWL);
    function getUnlockProfile() public view returns (address _UPcontract);
    function getSPPercentage() public view returns (uint256 _SPPercentage);
    function getVerifierPercentage() public view returns (uint256 _VerifierPercentage);
    function getMinimalStakeAmount()  public view returns (uint256 _minimalStakeAmount);
    function getInfoTemplate() public view returns (string _uriForInfoTemplate, string _hashForInfoTemplate);
  }