var TraceToProfileToken = artifacts.require("../contracts/TraceToProfileToken.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var T2TContract = artifacts.require("../contracts/TraceToToken.sol");
var TraceToStakeWallet = artifacts.require("../contracts/TraceToStakeWallet.sol");
var TraceToPendingToken = artifacts.require("../contracts/TraceToPendingToken.sol");

var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');

contract('TraceToProfileToken', function(accounts) {
    let tracetoProfileTokenToken;

    let emptyAddress = "0x0000000000000000000000000000000000000000";

    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        let rq1 = accounts[4];
        let rq2 = accounts[5];
        let t3V = accounts[6];

        t2tContract = await T2TContract.new(admin, 4000, 0, t3V);

        metaInfo = await TraceToMetaInfo.new(admin, t2tContract.address, {from: accounts[9]});
        rqList = await TraceToRequestorList.new(admin, {from: accounts[9]});
        spList = await TraceToSPList.new(admin, {from: accounts[9]});
        rmispList = await TraceToSPList.new(admin, {from: accounts[9]});
        vList = await TraceToVerifierList.new(admin, {from: accounts[9]});

        await metaInfo.setRequestorWL(rqList.address, {from: admin});
        await metaInfo.setSPWL(spList.address, {from: admin});
        await metaInfo.setRMISPWL(rmispList.address, {from: admin});
        await metaInfo.setVerifierWL(vList.address, {from: admin});
        
        let country = "A";
        let name = "B";
        let email = "C";
        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await rqList.addPendingRequestorPR(rq1, country, name, email, urlForUploading, hashForUploading, {from: rq1});
        await rqList.addPendingRequestorPR(rq2, country, name, email, urlForUploading, hashForUploading, {from: rq2});
        await rqList.approveRequestorPR(rq1, {from: admin});
        await rqList.approveRequestorPR(rq2, {from: admin});

        await t2tContract.transfer(t3V, 800, {from: admin});

        assert.equal(await t2tContract.balanceOf.call(admin), 3200);
        assert.equal(await t2tContract.balanceOf.call(t3V), 800);

        tracetoStakeWallet = await TraceToStakeWallet.new(metaInfo.address, t2tContract.address, {from: accounts[9]});
        await vList.setTraceToStakeWallet(tracetoStakeWallet.address, {from: admin});

        tracetoPendingToken = await TraceToPendingToken.new(metaInfo.address, 100, {from: accounts[9]});
        await vList.setTraceToPendingToken(tracetoPendingToken.address, {from: admin});

        let minStakeAmount = 500;
        await metaInfo.setMinimalStakeAmount(minStakeAmount, {from: admin});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: t3V});

        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: t3V});
        await vList.approveVerifier(t3V, 3, {from: admin});

        tracetoProfileToken = await TraceToProfileToken.new(admin, metaInfo.address, {from: accounts[9]});
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoProfileToken.owner(), admin)
    })

    it('should be able to add a profile by t3V', async () => {
        let t3V = accounts[6];
        
        let user = accounts[1];
        let profile = 'profileHash';
        let ipfs = 'ProfileIPFSHash';

        tracetoProfileToken.assignProfileToken(user, profile, ipfs, {from: t3V});

        let _profileTokens = await tracetoProfileToken.getUserProfileTokens(user);

        let _profile = await tracetoProfileToken.getProfile(_profileTokens[0]);

        assert.equal(_profile[0], profile);
        assert.equal(_profile[1], ipfs);
    })

    it('should be able to add multiple profiles by t3V', async () => {
        let t3V = accounts[6];
        
        let user = accounts[1];

        let profile0 = 'profileHash1';
        let profile1 = 'profileHash2';
        let profile2 = 'profileHash3';
        let ipfs0 = 'ProfileIPFSHash1';
        let ipfs1 = 'ProfileIPFSHash2';
        let ipfs2 = 'ProfileIPFSHash3';

        await tracetoProfileToken.assignProfileToken(user, profile0, ipfs0, {from: t3V});
        await tracetoProfileToken.assignProfileToken(user, profile1, ipfs1, {from: t3V});
        await tracetoProfileToken.assignProfileToken(user, profile2, ipfs2, {from: t3V});

        let _profileTokens = await tracetoProfileToken.getUserProfileTokens(user);
        let _profile0 = await tracetoProfileToken.getProfile(_profileTokens[0]);
        let _profile1 = await tracetoProfileToken.getProfile(_profileTokens[1]);
        let _profile2 = await tracetoProfileToken.getProfile(_profileTokens[2]);

        assert.equal(_profile0[0], profile0);
        assert.equal(_profile0[1], ipfs0);
        assert.equal(_profile1[0], profile1);
        assert.equal(_profile1[1], ipfs1);
        assert.equal(_profile2[0], profile2);
        assert.equal(_profile2[1], ipfs2);
    })

    it('should be not able to add profiles by not t3V', async () => {
        let t3V = accounts[6];
        let admin = accounts[8];
        
        let user = accounts[1];

        let profile1 = 'profileHash1';
        let profile2 = 'profileHash2';
        let profile3 = 'profileHash3';
        let ipfs1 = 'ProfileIPFSHash1';
        let ipfs2 = 'ProfileIPFSHash2';
        let ipfs3 = 'ProfileIPFSHash3';

        await utils.expectThrow(tracetoProfileToken.assignProfileToken(user, profile1, ipfs1));
        await utils.expectThrow(tracetoProfileToken.assignProfileToken(user, profile2, ipfs2, {from: admin}));
        await tracetoProfileToken.assignProfileToken(user, profile3, ipfs3, {from: t3V});


        let _profileTokens = await tracetoProfileToken.getUserProfileTokens(user);
        let _profile0 = await tracetoProfileToken.getProfile(_profileTokens[0]);

        assert.equal(_profileTokens.length, 1);
        assert.equal(_profile0[0], profile3);
        assert.equal(_profile0[1], ipfs3);
    })

    it('should be able to init kyc token contract by rq', async () => {
        let rq = accounts[4];
        let admin = accounts[8];

        assert.equal(await tracetoProfileToken.kycTokenContracts(rq), emptyAddress);

        await tracetoProfileToken.initKYCTokenContract({from: rq});

        assert.notEqual(await tracetoProfileToken.kycTokenContracts(rq), emptyAddress);
    })

    it('should be not able to init kyc twice token contract by rq', async () => {
        let rq = accounts[4];
        let admin = accounts[8];

        await tracetoProfileToken.initKYCTokenContract({from: rq});
        await utils.expectThrow(tracetoProfileToken.initKYCTokenContract({from: rq}));
    })

    it('should be able to init different kyc token contract by rqs', async () => {
        let rq1 = accounts[4];
        let rq2 = accounts[5];
        let admin = accounts[8];

        assert.equal(await tracetoProfileToken.kycTokenContracts(rq1), emptyAddress);
        assert.equal(await tracetoProfileToken.kycTokenContracts(rq2), emptyAddress);

        await tracetoProfileToken.initKYCTokenContract({from: rq1});
        await tracetoProfileToken.initKYCTokenContract({from: rq2});

        assert.notEqual(await tracetoProfileToken.kycTokenContracts(rq1), emptyAddress);
        assert.notEqual(await tracetoProfileToken.kycTokenContracts(rq2), emptyAddress);
        assert.notEqual(await tracetoProfileToken.kycTokenContracts(rq1), await tracetoProfileToken.kycTokenContracts(rq2));
    })

    it('should be not able to init kyc token contract by not rq', async () => {
        let user = accounts[3];
        let admin = accounts[8];

        await utils.expectThrow(tracetoProfileToken.initKYCTokenContract());
        await utils.expectThrow(tracetoProfileToken.initKYCTokenContract({from: user}));
        await utils.expectThrow(tracetoProfileToken.initKYCTokenContract({from: admin}));
    })
})