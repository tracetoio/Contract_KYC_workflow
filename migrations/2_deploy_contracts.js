let SPList = artifacts.require("./TraceToSPList.sol");
let RQList = artifacts.require("./TraceToRequestorList.sol");
let VList = artifacts.require("./TraceToVerifierList.sol");
let UnlockProfile = artifacts.require("./TraceToUnlockProfile.sol");

let StakeWallet = artifacts.require("./TraceToStakeWallet.sol");
let PendingToken = artifacts.require("./TraceToPendingToken.sol");

let MetaInfo = artifacts.require("./TraceToMetaInfo.sol");

let ProfileToken = artifacts.require("./TraceToProfileToken.sol");
let ServiceCredit = artifacts.require("./TraceToServiceCredit.sol");
let RMIServiceCredit = artifacts.require("./TraceToRMIServiceCredit.sol");

let settings = require("../settings.json");

module.exports = function(deployer) {
    if(deployer.network != 'test'){
        let _metaInfo, _vList;

        deployer.deploy(MetaInfo, settings.admin, settings.t2tContract)
        .then((metaInfo) => {
            _metaInfo = metaInfo;
            return _metaInfo.setSPPercentage(settings.spPercentage);
        }).then(() => {
            return _metaInfo.setVerifierPercentage(settings.verifierPercentage);
        }).then(() => {
            return _metaInfo.setMinimalStakeAmount(settings.minStakeAmount);
        }).then(() => {
            return deployer.deploy(SPList, settings.admin);
        }).then(() => {
            return _metaInfo.setSPWL(SPList.address);
        }).then(() => {
            return deployer.deploy(SPList, settings.admin);
        }).then(() => {
            return _metaInfo.setRMISPWL(SPList.address);
        }).then(() => {
            return deployer.deploy(RQList, settings.admin);
        }).then(() => {
            return _metaInfo.setRequestorWL(RQList.address);
        }).then(() => {
            return deployer.deploy(VList, settings.admin);
        }).then((vlist) => {
            _vList = vlist;
            return _metaInfo.setVerifierWL(VList.address);
        }).then(() => {
            return deployer.deploy(UnlockProfile, settings.admin, MetaInfo.address);
        }).then(() => {
            return _metaInfo.setUnlockProfile(UnlockProfile.address);
        }).then(() => {
            return deployer.deploy(ProfileToken, settings.admin, MetaInfo.address);
        }).then(() => {
            return deployer.deploy(ServiceCredit, settings.admin, MetaInfo.address);
        }).then(() => {
            return deployer.deploy(RMIServiceCredit, settings.admin, MetaInfo.address);
        }).then(() => {
            return deployer.deploy(StakeWallet, MetaInfo.address, settings.tusd);
        }).then(() => {
            return _vList.setTraceToStakeWallet(StakeWallet.address);
        }).then(() => {
            return deployer.deploy(PendingToken, MetaInfo.address, settings.blkWindow);
        }).then(() => {
            return _vList.setTraceToPendingToken(PendingToken.address);
        });
    }
}
