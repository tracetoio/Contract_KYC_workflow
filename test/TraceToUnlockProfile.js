var T2TContract = artifacts.require("../contracts/TraceToToken.sol");
var TraceToStakeWallet = artifacts.require("../contracts/TraceToStakeWallet.sol");
var TraceToPendingToken = artifacts.require("../contracts/TraceToPendingToken.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var TraceToUnlockProfile = artifacts.require("../contracts/TraceToUnlockProfile.sol");

var utils = require("../test/utils.js");
var BigNumber = require('bignumber.js');
contract('TraceToUnlockProfile', function(accounts) {
	let t2tTokenContract;
	let tracetoUnlockProfile;

    let metaInfo, rqList, spList, rmispList, vList;

	const t2tMainWallet = accounts[0];

	const rq = accounts[1];
	const rqPR = accounts[2];
	const v1 = accounts[3];
	const v2 = accounts[4];
	const v3 = accounts[5];
	const v4 = accounts[6];
	const v5 = accounts[7];

	const admin = accounts[8];

	const rate = 20;

    const profileIdx = 1;

	beforeEach('setup contract for each test', async () => {
		t2tTokenContract = await T2TContract.new(t2tMainWallet, 4000, 0, rq);

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

        let minStakeAmount = 100;

        await metaInfo.setSPPercentage(spPercentage, {from: admin});
        await metaInfo.setVerifierPercentage(vPercentage, {from: admin});

        let rqcountry = 'Singapore';
        let rqname = 'test RQ';
        let rqemail = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await rqList.addPendingRequestorPR(rqPR, rqcountry, rqname, rqemail, uriForMoreDetails, hashForMoreDetails, {from: rq});
        await rqList.approveRequestorPR(rqPR, {from: admin});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let stake = accounts[5];

        await t2tTokenContract.transfer(v1, 800, {from: t2tMainWallet});
        await t2tTokenContract.transfer(v2, 800, {from: t2tMainWallet});
        await t2tTokenContract.transfer(v3, 800, {from: t2tMainWallet});
        await t2tTokenContract.transfer(v4, 800, {from: t2tMainWallet});
        await t2tTokenContract.transfer(v5, 800, {from: t2tMainWallet});

        assert.equal(await t2tTokenContract.balanceOf.call(t2tMainWallet), 0);
        assert.equal(await t2tTokenContract.balanceOf.call(v1), 800);
        assert.equal(await t2tTokenContract.balanceOf.call(v2), 800);
        assert.equal(await t2tTokenContract.balanceOf.call(v3), 800);
        assert.equal(await t2tTokenContract.balanceOf.call(v4), 800);
        assert.equal(await t2tTokenContract.balanceOf.call(v5), 800);

        await metaInfo.setVerifierWL(vList.address, {from: admin});
        await metaInfo.setMinimalStakeAmount(minStakeAmount, {from: admin});

        tracetoStakeWallet = await TraceToStakeWallet.new(metaInfo.address, t2tTokenContract.address, {from: accounts[9]});
        await vList.setTraceToStakeWallet(tracetoStakeWallet.address, {from: admin});

        tracetoPendingToken = await TraceToPendingToken.new(metaInfo.address, 100, {from: accounts[9]});
        await vList.setTraceToPendingToken(tracetoPendingToken.address, {from: admin});

        await t2tTokenContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v1});
        await t2tTokenContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v2});
        await t2tTokenContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v3});
        await t2tTokenContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v4});
        await t2tTokenContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v5});

        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: v1});
        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: v2});
        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: v3});
        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: v4});
        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: v5});
        await vList.approveVerifier(v1, 1, {from: admin});
        await vList.approveVerifier(v2, 1, {from: admin});
        await vList.approveVerifier(v3, 1, {from: admin});
        await vList.approveVerifier(v4, 3, {from: admin});
        await vList.approveVerifier(v5, 3, {from: admin});


        tracetoUnlockProfile = await TraceToUnlockProfile.new(admin, metaInfo.address, {from: accounts[9]});
	})
	it('has an owner', async () => {
        assert.equal(await tracetoUnlockProfile.owner(), admin);
    })
    it('should be able to request key by rqPR', async () => {
    	let profile = profileIdx;
    	let reason = "test reason";
        await tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rqPR});

        let _reason = await tracetoUnlockProfile.getReason.call(profile, rqPR);
        assert.equal(_reason, reason);
    })
    it('should be not able to request key by not rqPR', async () => {
    	let profile = profileIdx;
    	let reason = "test reason";
        await utils.expectThrow(tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rq}));

        let _reason = await tracetoUnlockProfile.getReason.call(profile, rq);
        assert.equal(_reason, "");
    })
    it('should be able to get keys if shared', async () => {
    	let profile = profileIdx;
    	let reason = "test reason";
        await tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rqPR});

        let key0 = "key000";
        let key1 = "key001";
        let key2 = "key002";
        let key3 = "key003";
        let key4 = "key004";
        let key5 = "key005";
        let key6 = "key006";
        let key7 = "key007";
        let key8 = "key008";
        let key9 = "key009";
        await tracetoUnlockProfile.setKey(profile, key0, rqPR, {from: v1});
        await tracetoUnlockProfile.setKey(profile, key1, rqPR, {from: v2});
        await tracetoUnlockProfile.setKey(profile, key2, rqPR, {from: v3});
        await tracetoUnlockProfile.setKey(profile, key3, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key4, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key5, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key6, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key7, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key8, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key9, rqPR, {from: v5});
        assert.equal(await tracetoUnlockProfile.getKey.call(profile, 0, {from: rqPR}), key0);
    })
    it('should be not able to get key if there is not enough keys', async () => {
    	let profile = profileIdx;
    	let reason = "test reason";
        await tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rqPR});

        let key1 = "key001";
        await tracetoUnlockProfile.setKey(profile, key1, rqPR, {from: v1});
        await utils.expectThrow(tracetoUnlockProfile.getKey.call(profile, 0, {from: rqPR}));
    })
    it('should be able to remove duplicate keys', async () => {
    	let profile = profileIdx;
    	let reason = "test reason";
        await tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rqPR});

        let key0 = "key000";
        let key1 = "key001";
        let key2 = "key002";
        let key3 = "key003";
        let key4 = "key004";
        await tracetoUnlockProfile.setKey(profile, key0, rqPR, {from: v1});
        await tracetoUnlockProfile.setKey(profile, key1, rqPR, {from: v2});
        await tracetoUnlockProfile.setKey(profile, key2, rqPR, {from: v3});
        await tracetoUnlockProfile.setKey(profile, key3, rqPR, {from: v4});
        await tracetoUnlockProfile.setKey(profile, key4, rqPR, {from: v4});
        await utils.expectThrow(tracetoUnlockProfile.setKey(profile, key0, rqPR, {from: v4}));
        await utils.expectThrow(tracetoUnlockProfile.setKey(profile, key1, rqPR, {from: v4}));
        await utils.expectThrow(tracetoUnlockProfile.setKey(profile, key2, rqPR, {from: v4}));
        await utils.expectThrow(tracetoUnlockProfile.setKey(profile, key3, rqPR, {from: v4}));
        await utils.expectThrow(tracetoUnlockProfile.setKey(profile, key4, rqPR, {from: v5}));

        await utils.expectThrow(tracetoUnlockProfile.getKey.call(profile, 0, {from: rqPR}));
    })
})