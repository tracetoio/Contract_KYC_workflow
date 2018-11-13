let SPList = artifacts.require("./TraceToSPList.sol");
let RQList = artifacts.require("./TraceToRequestorList.sol");
let VList = artifacts.require("./TraceToVerifierList.sol");
let UnlockProfile = artifacts.require("./TraceToUnlockProfile.sol");

let MetaInfo = artifacts.require("./TraceToMetaInfo.sol");

let ProfileToken = artifacts.require("./TraceToProfileToken.sol");
let ServiceCredit = artifacts.require("./TraceToServiceCredit.sol");
let RMIServiceCredit = artifacts.require("./TraceToRMIServiceCredit.sol");

let settings = require("../settings.json");

module.exports = function(deployer) {
    if(deployer.network != 'test'){
        let _metaInfo;

        deployer.deploy(MetaInfo, settings.admin, settings.t2tContract)
        .then((metaInfo) => {
            _metaInfo = metaInfo;
            return _metaInfo.setSPPercentage(settings.spPercentage);
        }).then(() => {
            return _metaInfo.setVerifierPercentage(settings.verifierPercentage);
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
        }).then(() => {
            return _metaInfo.setVerifierWL(VList.address);
        }).then(() => {
            return deployer.deploy(UnlockProfile, settings.admin, MetaInfo.address);
        }).then(() => {
            return _metaInfo.setUnlockProfile(UnlockProfile.address);
        }).then(() => {
            return deployer.deploy(Profile, settings.admin, MetaInfo.address);
        }).then(() => {
            return deployer.deploy(ServiceCredit, settings.admin, MetaInfo.address);
        }).then(() => {
            return deployer.deploy(RMIServiceCredit, settings.admin, MetaInfo.address);
        });
    }
}
