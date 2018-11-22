var T2TContract = artifacts.require("../contracts/TraceToToken.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var TraceToRMIServiceCredit = artifacts.require("../contracts/TraceToRMIServiceCredit.sol");

var utils = require("../test/utils.js");
var BigNumber = require('bignumber.js');
contract('TraceToRMIServiceCredit', function(accounts) {
	let t2tTokenContract;
	let tracetoRMIServiceCredit;

    let metaInfo, rqList, spList, rmispList, vList;

	const t2tMainWallet = accounts[0];

	const rq = accounts[1];
	const rqPR = accounts[2];
	const sp = accounts[3];
	const rmiSP = accounts[4];
	const t3 = accounts[5];

	const admin = accounts[8];

	const rate = 20;

	beforeEach('setup contract for each test', async () => {
		t2tTokenContract = await T2TContract.new(t2tMainWallet, 3000, 0, rq);

		await t2tTokenContract.transfer(rq, 2000, {from: t2tMainWallet});

		assert.equal(await t2tTokenContract.balanceOf.call(rq), 2000);
		assert.equal(await t2tTokenContract.balanceOf.call(rqPR), 0);
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

        let rqcountry = 'Singapore';
        let rqname = 'test RQ';
        let rqemail = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await rqList.addPendingRequestorPR(rqPR, rqcountry, rqname, rqemail, uriForMoreDetails, hashForMoreDetails, {from: rq});
        await rqList.approveRequestorPR(rqPR, {from: admin});

        let spname = 'test SP';
        let spemail = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await rmispList.addPendingSP(rate, spname, spemail, uriForRubrics, hashFroRubrics, lv, {from: rmiSP});
        await rmispList.approveSP(rmiSP, {from: admin});

        tracetoRMIServiceCredit = await TraceToRMIServiceCredit.new(admin, metaInfo.address, {from: accounts[9]});
	})

	it('has an owner', async () => {
        assert.equal(await tracetoRMIServiceCredit.owner(), admin)
    })

    it('should revert if not approved', async () => {
    	await utils.expectThrow(tracetoRMIServiceCredit.topup(rqPR, rmiSP, 20, {from: rq}));

    	let balance = await tracetoRMIServiceCredit.getBalance.call(rmiSP, {from: rqPR});
    	assert.equal(balance[0], 0);
    	assert.equal(balance[1], 0);
    })

	it('should revert if not rmi sp', async () => {
    	await utils.expectThrow(tracetoRMIServiceCredit.topup(rqPR, rq, 20, {from: rq}));

    	let balance = await tracetoRMIServiceCredit.getBalance.call(rq, {from: rqPR});
    	assert.equal(balance[0], 0);
    	assert.equal(balance[1], 0);
    })

    it('should be able to topup by rq if approved', async () => {
    	await t2tTokenContract.approve(tracetoRMIServiceCredit.address, rate*20, {from: rq});
    	await tracetoRMIServiceCredit.topup(rqPR, rmiSP, 20, {from: rq});

    	let balance = await tracetoRMIServiceCredit.getBalance.call(rmiSP, {from: rqPR});
    	assert.equal(balance[0], rate*20);
    	assert.equal(balance[1], 20);
    })

    it('should be not able to topup a negative count by rq if approved', async () => {
        await t2tTokenContract.approve(tracetoRMIServiceCredit.address, rate*20, {from: rq});
        await utils.expectThrow(tracetoRMIServiceCredit.topup(rqPR, sp, -20, {from: rq}));

        let balance = await tracetoRMIServiceCredit.getBalance.call(sp, {from: rqPR});
        assert.equal(balance[0], rate*0);
        assert.equal(balance[1], 0);
    })

    it('should be able to set a profile as pending', async () => {
    	await t2tTokenContract.approve(tracetoRMIServiceCredit.address, rate*20, {from: rq});
    	await tracetoRMIServiceCredit.topup(rqPR, rmiSP, 20, {from: rq});

    	let profile = 7;
    	await tracetoRMIServiceCredit.addPending(profile, {from: rqPR});

    	let balance = await tracetoRMIServiceCredit.getBalance.call(rmiSP, {from: rqPR});
    	assert.equal(balance[0], rate*19);
    	assert.equal(balance[1], 19);
    })

    it('should be not able to set a profile as pending if there is not enough balance', async () => {
    	let profile = 7;

    	await utils.expectThrow(tracetoRMIServiceCredit.addPending(profile, {from: rqPR}));

    	let balance = await tracetoRMIServiceCredit.getBalance.call(rmiSP, {from: rqPR});
    	assert.equal(balance[0], 0);
    	assert.equal(balance[1], 0);
    })

    it('should be able to approve tokens to rmiSP after finished', async () => {
    	await t2tTokenContract.approve(tracetoRMIServiceCredit.address, rate*20, {from: rq});
    	await tracetoRMIServiceCredit.topup(rqPR, rmiSP, 20, {from: rq});

    	let profile = 7;
    	await tracetoRMIServiceCredit.addPending(profile, {from: rqPR});
    	await tracetoRMIServiceCredit.setFinished(profile, rmiSP, {from: rqPR});

    	assert.equal(await t2tTokenContract.allowance.call(tracetoRMIServiceCredit.address, rmiSP), rate*40/100);
    })
})