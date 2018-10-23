var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToMetaInfo', function(accounts) {
    let tracetoMetaInfo;

    let t2tContract = '0x39d8b52a31615af0a2c86b5b02a475b667a9da44';
    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        tracetoMetaInfo = await TraceToMetaInfo.new(admin, t2tContract, {from: accounts[9]})
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoMetaInfo.owner(), admin)
    })

    it("should be able to set contract", async () => {
        let admin = accounts[8];

        let rqList = '0x25bde469cc7c9954d9bde77601c6f5034a8a9ba1';
        let spList = '0x01ac02f1096eab19def3a7e3566fd364b3dbc6e8';
        let rmispList = '0xa907f9b1648b30ed0166d3a3b60fa9cd9ac33ecd';
        let vList = '0x1cbc065e31b766ff83e4e11abac0588cdb10fd2b';

        let unlockContract = '0xb456b16dba932510f19ce994da786e27293b11c3';

        await tracetoMetaInfo.setRequestorWL(rqList, {from: admin});
        await tracetoMetaInfo.setSPWL(spList, {from: admin});
        await tracetoMetaInfo.setRMISPWL(rmispList, {from: admin});
        await tracetoMetaInfo.setVerifierWL(vList, {from: admin});
        await tracetoMetaInfo.setUnlockProfile(unlockContract, {from: admin});

        let _rqList = await tracetoMetaInfo.getRequestorWL.call();
        let _spList = await tracetoMetaInfo.getSPWL.call();
        let _rmispList = await tracetoMetaInfo.getRMISPWL.call();
        let _vList = await tracetoMetaInfo.getVerifierWL.call();
        let _unlockContract = await tracetoMetaInfo.getUnlockProfile.call();

        assert.equal(_rqList, rqList);
        assert.equal(_spList, spList);
        assert.equal(_rmispList, rmispList);
        assert.equal(_vList, vList);
        assert.equal(_unlockContract, unlockContract);
    })

    it("should not be able to set contract from not owner", async () => {
        let rqList = '0x25bde469cc7c9954d9bde77601c6f5034a8a9ba1';
        let spList = '0x01ac02f1096eab19def3a7e3566fd364b3dbc6e8';
        let rmispList = '0xa907f9b1648b30ed0166d3a3b60fa9cd9ac33ecd';
        let vList = '0x1cbc065e31b766ff83e4e11abac0588cdb10fd2b';

        let unlockContract = '0xb456b16dba932510f19ce994da786e27293b11c3';

        await utils.expectThrow(tracetoMetaInfo.setVerifierWL(rqList));
        await utils.expectThrow(tracetoMetaInfo.setRequestorWL(spList));
        await utils.expectThrow(tracetoMetaInfo.setSPWL(rmispList));
        await utils.expectThrow(tracetoMetaInfo.setRMISPWL(vList));
        await utils.expectThrow(tracetoMetaInfo.setUnlockProfile(unlockContract));
    })

    it("should be able to set data", async () => {
        const admin = accounts[8];

        let spPercentage = 40;
        let vPercentage = 30;

        let infoTemplate = '{"test":{"keyA":"valueB"}}';
        let infoTemplateHash = 'fcc677307ad7e929d0b0b00acd77c6089a74cb04';

        await tracetoMetaInfo.setSPPercentage(spPercentage, {from: admin});
        await tracetoMetaInfo.setVerifierPercentage(vPercentage, {from: admin});
        await tracetoMetaInfo.setInfoTemplate(infoTemplate, infoTemplateHash, {from: admin});

        let _spPercentage = await tracetoMetaInfo.getSPPercentage.call();
        let _vPercentage = await tracetoMetaInfo.getVerifierPercentage.call();
        let _infoTemp = await tracetoMetaInfo.getInfoTemplate.call();

        assert.equal(_spPercentage, spPercentage);
        assert.equal(_vPercentage, vPercentage);
        assert.equal(_infoTemp[0], infoTemplate);
        assert.equal(_infoTemp[1], infoTemplateHash);
    })

    it("should be not able to set invalid", async () => {
        const admin = accounts[8];

        let spPercentage = 40;
        let vPercentage = 30;

        await tracetoMetaInfo.setSPPercentage(spPercentage, {from: admin});
        await tracetoMetaInfo.setVerifierPercentage(vPercentage, {from: admin});

        let _spPercentage = await tracetoMetaInfo.getSPPercentage.call();
        let _vPercentage = await tracetoMetaInfo.getVerifierPercentage.call();
        assert.equal(_spPercentage, spPercentage);
        assert.equal(_vPercentage, vPercentage);

        let spPercentageInvalid = 70;
        let vPercentageInvalid = 80;

        await utils.expectThrow(tracetoMetaInfo.setSPPercentage(spPercentageInvalid, {from: admin}));
        await utils.expectThrow(tracetoMetaInfo.setVerifierPercentage(vPercentageInvalid, {from: admin}));
        _spPercentage = await tracetoMetaInfo.getSPPercentage.call();
        _vPercentage = await tracetoMetaInfo.getVerifierPercentage.call();
        assert.equal(_spPercentage, spPercentage);
        assert.equal(_vPercentage, vPercentage);
    })


    it("should not be able to set data from not owner", async () => {
        let spPercentage = 40;
        let vPercentage = 30;

        let infoTemplate = '{"test":{"keyA":"valueB"}}';
        let infoTemplateHash = 'fcc677307ad7e929d0b0b00acd77c6089a74cb04';

        await utils.expectThrow(tracetoMetaInfo.setSPPercentage(spPercentage));
        await utils.expectThrow(tracetoMetaInfo.setVerifierPercentage(vPercentage));
        await utils.expectThrow(tracetoMetaInfo.setInfoTemplate(infoTemplate, infoTemplateHash));
    })
});