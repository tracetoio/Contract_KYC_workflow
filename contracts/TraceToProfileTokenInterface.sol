pragma solidity 0.4.24;

interface TraceToProfileTokenInterface{
    function assignProfileToken(address _user, string _profileHash, string _ipfs) public;
    function setExpiry(uint256 _tokenId, uint256 _expire) public;
    function assignProfileAsRMI(uint256 _tokenId) public;
    function assignKYCToken(uint256 _tokenId, string _encryptedKYCResults, uint256 _decay) public;
    function ownerOfProfileToken(uint256 _tokenId) public view returns (address owner);
    function ownerOfKYCToken(uint256 _tokenId) public view returns (address owner);
    function getProfile(uint256 _tokenId) public view returns (string _profileHash, string _profileIPFS, uint256 _expire);
    function getUserProfileTokenCount(address _user) public view returns (uint256 _profileCount);
    function getUserProfileTokenList(address _user) public view returns (uint256[] _profileTokens);
    function getUserProfileToken(string _profileHash) public view returns (uint256 _profileToken);
    function getKYC(uint256 _tokenId) public view returns (address _requestor, string _encryptedKYCResults, uint256 _decay);
    function getProfileKYCCount(uint256 _tokenId) public view returns (uint256 _kycCount);
    function getProfileKYCs(uint256 _tokenId) public view returns (uint256[] _kycTokens);
}
