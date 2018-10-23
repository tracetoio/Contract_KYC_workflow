var T2TContract = artifacts.require("../contracts/TraceToToken.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TracetoVerifierList = artifacts.require("../contracts/TracetoVerifierList.sol");

var TracetoUnlockProfile = artifacts.require("../contracts/TracetoUnlockProfile.sol");

var utils = require("../test/utils.js");
var BigNumber = require('bignumber.js');
contract('TracetoUnlockProfile', function(accounts) {
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

	beforeEach('setup contract for each test', async () => {
		t2tTokenContract = await T2TContract.new(t2tMainWallet, 3000, 0, rq);

		metaInfo = await TraceToMetaInfo.new(admin, t2tTokenContract.address, {from: accounts[9]});
        rqList = await TraceToRequestorList.new(admin, {from: accounts[9]});
        spList = await TraceToSPList.new(admin, {from: accounts[9]});
        rmispList = await TraceToSPList.new(admin, {from: accounts[9]});
        vList = await TracetoVerifierList.new(admin, {from: accounts[9]});

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

        let vname = 'test V';
        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let stake = accounts[5];

        await vList.addPendingVerifier(vname, urlForUploading, hashForUploading, stake, {from: v1});
        await vList.addPendingVerifier(vname, urlForUploading, hashForUploading, stake, {from: v2});
        await vList.addPendingVerifier(vname, urlForUploading, hashForUploading, stake, {from: v3});
        await vList.addPendingVerifier(vname, urlForUploading, hashForUploading, stake, {from: v4});
        await vList.addPendingVerifier(vname, urlForUploading, hashForUploading, stake, {from: v5});
        await vList.approveVerifier(v1, 1, {from: admin});
        await vList.approveVerifier(v2, 1, {from: admin});
        await vList.approveVerifier(v3, 1, {from: admin});
        await vList.approveVerifier(v4, 3, {from: admin});
        await vList.approveVerifier(v5, 3, {from: admin});


        tracetoUnlockProfile = await TracetoUnlockProfile.new(admin, metaInfo.address, {from: accounts[9]});
	})
	it('has an owner', async () => {
        assert.equal(await tracetoUnlockProfile.owner(), admin);
    })
    it('should be able to request key by rqPR', async () => {
    	let profile = "test profile";
    	let reason = "test reason";
        await tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rqPR});

        let _reason = await tracetoUnlockProfile.getReason.call(profile, rqPR);
        assert.equal(_reason, reason);
    })
    it('should be not able to request key by not rqPR', async () => {
    	let profile = "test profile";
    	let reason = "test reason";
        await utils.expectThrow(tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rq}));

        let _reason = await tracetoUnlockProfile.getReason.call(profile, rq);
        assert.equal(_reason, "");
    })
    it('should be able to get keys if shared', async () => {
    	let profile = "test profile";
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
    	let profile = "test profile";
    	let reason = "test reason";
        await tracetoUnlockProfile.requestProfileKey(profile, reason, {from: rqPR});

        let key1 = "key001";
        await tracetoUnlockProfile.setKey(profile, key1, rqPR, {from: v1});
        await utils.expectThrow(tracetoUnlockProfile.getKey.call(profile, 0, {from: rqPR}));
    })
    it('should be able to remove duplicate keys', async () => {
    	let profile = "test profile";
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