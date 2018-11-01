var TraceToProfile = artifacts.require("../contracts/TraceToProfile.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToProfile', function(accounts) {
    let tracetoProfile;

    let metaInfo, rqList, spList, rmispList, vList;

    let t2tContract = '0x39d8b52a31615af0a2c86b5b02a475b667a9da44';

    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        metaInfo = await TraceToMetaInfo.new(admin, t2tContract, {from: accounts[9]});
        rqList = await TraceToRequestorList.new(admin, {from: accounts[9]});
        spList = await TraceToSPList.new(admin, {from: accounts[9]});
        rmispList = await TraceToSPList.new(admin, {from: accounts[9]});
        vList = await TraceToVerifierList.new(admin, {from: accounts[9]});

        await metaInfo.setRequestorWL(rqList.address, {from: admin});
        await metaInfo.setSPWL(spList.address, {from: admin});
        await metaInfo.setRMISPWL(rmispList.address, {from: admin});
        await metaInfo.setVerifierWL(vList.address, {from: admin});

        let t3V = accounts[6];
        let name = 'test V';
        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let stake = accounts[5];

        await vList.addPendingVerifier(name, urlForUploading, hashForUploading, stake, {from: t3V});
        await vList.approveVerifier(t3V, 3, {from: admin});

        tracetoProfile = await TraceToProfile.new(admin, metaInfo.address, {from: accounts[9]});
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoProfile.owner(), admin)
    })

    it('should be able to add a profile by t3V', async () => {
    	let t3V = accounts[6];
    	
    	let user = 'AddrHash';
    	let profile = 'profileHash';
    	let ipfs = 'ProfileIPFSHash';

    	tracetoProfile.addProfile(user, profile, ipfs, {from: t3V});

    	let _profile = await tracetoProfile.getUserProfile(user);
    	let _ipfs = await tracetoProfile.getIPFSLink(profile);

    	assert.equal(_profile, profile);
    	assert.equal(_ipfs, ipfs);
    })

    it('should be able to add multiple profiles by t3V', async () => {
    	let t3V = accounts[6];
    	
    	let user = 'AddrHash';

    	let profile1 = 'profileHash1';
    	let profile2 = 'profileHash2';
    	let profile3 = 'profileHash3';
    	let ipfs1 = 'ProfileIPFSHash1';
    	let ipfs2 = 'ProfileIPFSHash2';
    	let ipfs3 = 'ProfileIPFSHash3';

    	await tracetoProfile.addProfile(user, profile1, ipfs1, {from: t3V});
    	let _profile1 = await tracetoProfile.getUserProfile(user);

    	await tracetoProfile.addProfile(user, profile2, ipfs2, {from: t3V});
    	let _profile2 = await tracetoProfile.getUserProfile(user);

    	await tracetoProfile.addProfile(user, profile3, ipfs3, {from: t3V});
    	let _profile3 = await tracetoProfile.getUserProfile(user);

    	let _ipfs1 = await tracetoProfile.getIPFSLink(profile1);
    	let _ipfs2 = await tracetoProfile.getIPFSLink(profile2);
    	let _ipfs3 = await tracetoProfile.getIPFSLink(profile3);

    	assert.equal(_profile1, profile1);
    	assert.equal(_profile2, profile2);
    	assert.equal(_profile3, profile3);
    	assert.equal(_ipfs1, ipfs1);
    	assert.equal(_ipfs2, ipfs2);
    	assert.equal(_ipfs3, ipfs3);
    })

    it('should be not able to add profiles by not t3V', async () => {
    	let t3V = accounts[6];
    	let admin = accounts[8];
    	
    	let user = 'AddrHash';

    	let profile1 = 'profileHash1';
    	let profile2 = 'profileHash2';
    	let profile3 = 'profileHash3';
    	let ipfs1 = 'ProfileIPFSHash1';
    	let ipfs2 = 'ProfileIPFSHash2';
    	let ipfs3 = 'ProfileIPFSHash3';

    	await tracetoProfile.addProfile(user, profile1, ipfs1, {from: t3V});
    	let _profile1 = await tracetoProfile.getUserProfile(user);

    	await utils.expectThrow(tracetoProfile.addProfile(user, profile2, ipfs2));
    	let _profile2 = await tracetoProfile.getUserProfile(user);

    	await utils.expectThrow(tracetoProfile.addProfile(user, profile3, ipfs3, {from: admin}));
    	let _profile3 = await tracetoProfile.getUserProfile(user);

    	let _ipfs1 = await tracetoProfile.getIPFSLink(profile1);
    	let _ipfs2 = await tracetoProfile.getIPFSLink(profile2);
    	let _ipfs3 = await tracetoProfile.getIPFSLink(profile3);

    	assert.equal(_profile1, profile1);
    	assert.equal(_profile2, profile1);
    	assert.equal(_profile3, profile1);
    	assert.equal(_ipfs1, ipfs1);
    	assert.equal(_ipfs2, "");
    	assert.equal(_ipfs3, "");
    })
})