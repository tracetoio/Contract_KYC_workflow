var T2TContract = artifacts.require("../contracts/TraceToToken.sol");

var TraceToProfileToken = artifacts.require("../contracts/TraceToProfileToken.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var TraceToServiceCredit = artifacts.require("../contracts/TraceToServiceCredit.sol");
var TraceToRMIServiceCredit = artifacts.require("../contracts/TraceToRMIServiceCredit.sol");

var TraceToProfileResult = artifacts.require("../contracts/TraceToProfileResult.sol");

var utils = require("../test/utils.js");
var BigNumber = require('bignumber.js');
contract('TraceToProfileResult', function(accounts) {
    let t2tTokenContract;
    let metaInfo, rqList, spList, rmispList, vList;
    let tracetoServiceCredit, tracetoRMIServiceCredit, tracetoProfileToken;

    let tracetoProfileResult;

    const t2tMainWallet = accounts[0];

    const rq = accounts[1];
    const sp = accounts[2];
    const rmiSP = accounts[3];
    const t3 = accounts[4];

    const admin = accounts[8];

    const rate = 20;

    beforeEach('setup contract for each test', async () => {
        t2tTokenContract = await T2TContract.new(t2tMainWallet, 3000, 0, rq);

        await t2tTokenContract.transfer(rq, 2000, {from: t2tMainWallet});

        assert.equal(await t2tTokenContract.balanceOf.call(rq), 2000);
        assert.equal(await t2tTokenContract.balanceOf.call(sp), 0);
        assert.equal(await t2tTokenContract.balanceOf.call(rmiSP), 0);
        assert.equal(await t2tTokenContract.balanceOf.call(t3), 0);

        metaInfo = await TraceToMetaInfo.new(admin, t2tTokenContract.address, {from: accounts[9]});
        rqList = await TraceToRequestorList.new(admin, {from: accounts[9]});
        spList = await TraceToSPList.new(admin, {from: accounts[9]});
        rmispList = await TraceToSPList.new(admin, {from: accounts[9]});
        vList = await TraceToVerifierList.new(admin, {from: accounts[9]});

        await metaInfo.setRequestorWL(rqList.address, {from: admin});
        await metaInfo.setSPWL(spList.address, {from: admin});
        await metaInfo.setRMISPWL(rmispList.address, {from: admin});
        await metaInfo.setVerifierWL(vList.address, {from: admin});

        let spPercentage = 40;
        let vPercentage = 30;

        await metaInfo.setSPPercentage(spPercentage, {from: admin});
        await metaInfo.setVerifierPercentage(vPercentage, {from: admin});

        let spname = 'test SP';
        let spemail = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await spList.addPendingSP(rate, spname, spemail, uriForRubrics, hashFroRubrics, lv, {from: sp});
        await spList.approveSP(sp, {from: admin});

        await rmispList.addPendingSP(rate, spname, spemail, uriForRubrics, hashFroRubrics, lv, {from: rmiSP});
        await rmispList.approveSP(rmiSP, {from: admin});

        tracetoServiceCredit = await TraceToServiceCredit.new(admin, metaInfo.address, {from: accounts[9]});
        tracetoRMIServiceCredit = await TraceToRMIServiceCredit.new(admin, metaInfo.address, {from: accounts[9]});

        tracetoProfileToken = await TraceToProfileToken.new(admin, metaInfo.address, {from: accounts[9]});

        let rqcountry = 'Singapore';
        let rqname = 'test RQ';
        let rqemail = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';
        let pubKey = 'RQ_PUBKEY';

        tracetoProfileResult = await TraceToProfileResult.new(rq, tracetoProfileToken.address, metaInfo.address, tracetoServiceCredit.address, tracetoRMIServiceCredit.address, pubKey, {from: accounts[9]});

        await rqList.addPendingRequestorPR(tracetoProfileResult.address, rqcountry, rqname, rqemail, uriForMoreDetails, hashForMoreDetails, {from: rq});
        await rqList.approveRequestorPR(tracetoProfileResult.address, {from: admin});


        await t2tTokenContract.approve(tracetoServiceCredit.address, rate*20, {from: rq});
        await tracetoServiceCredit.topup(tracetoProfileResult.address, sp, 20, {from: rq});

        await t2tTokenContract.approve(tracetoRMIServiceCredit.address, rate*30, {from: rq});
        await tracetoRMIServiceCredit.topup(tracetoProfileResult.address, rmiSP, 30, {from: rq});

        assert.equal(await t2tTokenContract.balanceOf.call(rq), 2000-rate*50);
    })

    it('has an owner', async () => {
        assert.equal(await tracetoProfileResult.owner(), rq)
    })

    it('should be able to get balance', async () => {
        let balance = await tracetoProfileResult.getServiceBalance.call(sp, {from: rq});
        assert.equal(balance[0], rate*20);
        assert.equal(balance[1], 20);

        let rmiBalance = await tracetoProfileResult.getRMIServiceBalance.call(rmiSP, {from: rq});
        assert.equal(rmiBalance[0], rate*30);
        assert.equal(rmiBalance[1], 30);
    })

    it('should be able to set pending', async () => {
        let profile = 1;
        let consent = "test consent";
        await tracetoProfileResult.addPending(profile, consent, {from: rq});
        let balance = await tracetoProfileResult.getServiceBalance.call(sp, {from: rq});
        assert.equal(balance[0], rate*19);
        assert.equal(balance[1], 19);

        await tracetoProfileResult.addRMIPending(profile, {from: rq});
        let rmiBalance = await tracetoProfileResult.getRMIServiceBalance.call(rmiSP, {from: rq});
        assert.equal(rmiBalance[0], rate*29);
        assert.equal(rmiBalance[1], 29);
    })
    it('should be able to set result by sp', async () => {

        let profile = 1;
        let consent = "test conset";
        let pubKey = "RQ_PUBKEY";

        await tracetoProfileResult.addPending(profile, consent, {from: rq});
        await tracetoProfileResult.addRMIPending(profile, {from: rq});

        let _pubkey = await tracetoProfileResult.getPubKey.call();
        let _consent = await tracetoProfileResult.getConsent.call(profile);

        assert.equal(_pubkey, pubKey);
        assert.equal(_consent, consent);

        let profileResult = "test result";
        let decay1 = 1574695773;
        let expire1 = 1574695773;

        let decay2 = 1574695773;
        let expire2 = 1574695773;

        
        await tracetoProfileResult.setResult(profile, profileResult, decay1, expire1, {from: sp});

        let result = await tracetoProfileResult.getResult(profile, sp);
        assert.equal(result[0], profileResult);
        assert.equal(result[1], decay1);
        assert.equal(result[2], expire1);

        await tracetoProfileResult.setRMIResult(profile, profileResult, decay2, expire2, {from: rmiSP});
        
        let rmiResult = await tracetoProfileResult.getRMIResult(profile, rmiSP);
        assert.equal(rmiResult[0], profileResult);
        assert.equal(rmiResult[1], decay2);
        assert.equal(rmiResult[2], expire2);

        result = await tracetoProfileResult.getResult(profile, sp);
        assert.equal(result[0], profileResult);
        assert.equal(result[1], decay1);
        assert.equal(result[2], expire2);
    })
    it('should be not able to set result by not sp', async () => {

        let profile = 1;
        let consent = "test conset";
        let pubKey = "RQ_PUBKEY";

        await tracetoProfileResult.addPending(profile, consent, {from: rq});
        await tracetoProfileResult.addRMIPending(profile, {from: rq});

        let _pubkey = await tracetoProfileResult.getPubKey.call();
        let _consent = await tracetoProfileResult.getConsent.call(profile);

        assert.equal(_pubkey, pubKey);
        assert.equal(_consent, consent);

        let profileResult = "test result";
        let decay1 = 1574695773;
        let expire1 = 1574695773;

        let decay2 = 1574695773;
        let expire2 = 1574695773;

        await utils.expectThrow(tracetoProfileResult.setResult(profile, profileResult, decay1, expire1, {from: admin}));

        let result = await tracetoProfileResult.getResult(profile, sp);
        assert.equal(result[0], "");
        assert.equal(result[1], 0);
        assert.equal(result[2], 0);

        await utils.expectThrow(tracetoProfileResult.setRMIResult(profile, profileResult, decay2, expire2, {from: admin}));
        
        let rmiResult = await tracetoProfileResult.getRMIResult(profile, rmiSP);
        assert.equal(rmiResult[0], "");
        assert.equal(rmiResult[1], 0);
        assert.equal(rmiResult[2], 0);

        result = await tracetoProfileResult.getResult(profile, sp);
        assert.equal(result[0], "");
        assert.equal(result[1], 0);
        assert.equal(result[2], 0);
    })
    it('should be not able to set result with invalid time', async () => {

        let profile = 1;
        let consent = "test conset";
        let pubKey = "RQ_PUBKEY";

        await tracetoProfileResult.addPending(profile, consent, {from: rq});
        await tracetoProfileResult.addRMIPending(profile, {from: rq});

        let _pubkey = await tracetoProfileResult.getPubKey.call();
        let _consent = await tracetoProfileResult.getConsent.call(profile);

        assert.equal(_pubkey, pubKey);
        assert.equal(_consent, consent);

        let profileResult = "test result";
        let decay1Invalid = 100;
        let decay1 = 10500000000;
        let expire1Invalid = 150;
        let expire1 = 10500000000;

        let decay2Invalid = 100;
        let decay2 = 10500000000;
        let expire2Invalid = 100;
        let expire2 = 10500000000;

        await utils.expectThrow(tracetoProfileResult.setResult(profile, profileResult, decay1Invalid, expire1, {from: sp}));
        await utils.expectThrow(tracetoProfileResult.setResult(profile, profileResult, decay1, expire1Invalid, {from: sp}));

        let result = await tracetoProfileResult.getResult(profile, sp);
        assert.equal(result[0], "");
        assert.equal(result[1], 0);
        assert.equal(result[2], 0);

        await utils.expectThrow(tracetoProfileResult.setRMIResult(profile, profileResult, decay2Invalid, expire2, {from: rmiSP}));
        await utils.expectThrow(tracetoProfileResult.setRMIResult(profile, profileResult, decay2, expire2Invalid, {from: rmiSP}));
        
        let rmiResult = await tracetoProfileResult.getRMIResult(profile, rmiSP);
        assert.equal(rmiResult[0], "");
        assert.equal(rmiResult[1], 0);
        assert.equal(rmiResult[2], 0);

        result = await tracetoProfileResult.getResult(profile, sp);
        assert.equal(result[0], "");
        assert.equal(result[1], 0);
        assert.equal(result[2], 0);
    })
    it('should be able to set finished by rq', async () => {

        let profile = 1;
        let consent = "test conset";
        let pubKey = "RQ_PUBKEY";

        await tracetoProfileResult.addPending(profile, consent, {from: rq});
        await tracetoProfileResult.addRMIPending(profile, {from: rq});

        assert.equal(await t2tTokenContract.allowance.call(tracetoServiceCredit.address, sp), 0);
        assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), 0);

        await tracetoProfileResult.setFinished(profile, sp, {from: rq});

        assert.equal(await t2tTokenContract.allowance.call(tracetoServiceCredit.address, sp), rate*40/100);
        assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), 0);
        
        await tracetoProfileResult.setRMIFinished(profile, rmiSP, {from: rq});

        assert.equal(await t2tTokenContract.allowance.call(tracetoServiceCredit.address, sp), rate*40/100);
        assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), rate*40/100);
    })

    it('should be not able to set finished by not rq', async () => {

        let profile = 1;
        let consent = "test conset";
        let pubKey = "RQ_PUBKEY";

        await tracetoProfileResult.addPending(profile, consent, {from: rq});
        await tracetoProfileResult.addRMIPending(profile, {from: rq});

        assert.equal(await t2tTokenContract.allowance.call(tracetoServiceCredit.address, sp), 0);
        assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), 0);

        await utils.expectThrow(tracetoProfileResult.setFinished(profile, sp, {from: admin}));

        assert.equal(await t2tTokenContract.allowance.call(tracetoServiceCredit.address, sp), 0);
        assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), 0);
        
        await utils.expectThrow(tracetoProfileResult.setRMIFinished(profile, rmiSP, {from: admin}));

        assert.equal(await t2tTokenContract.allowance.call(tracetoServiceCredit.address, sp), 0);
        assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), 0);
    })

})