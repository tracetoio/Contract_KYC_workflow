var TraceToProfileToken = artifacts.require("../contracts/TraceToProfileToken.sol");

var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");
var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToProfileToken', function(accounts) {
    let tracetoProfile;

    let metaInfo, rqList, spList, rmispList, vList;

    let t2tContract = '0x39d8b52a31615af0a2c86b5b02a475b667a9da44';

    const rq = accounts[1];
    const sp = accounts[2];
    const rmiSP = accounts[3];
    const t3V = accounts[4];

    const user = accounts[6];

    const admin = accounts[8];

    beforeEach('setup contract for each test', async () => {
        metaInfo = await TraceToMetaInfo.new(admin, t2tContract, {from: accounts[9]});
        rqList = await TraceToRequestorList.new(admin, {from: accounts[9]});
        spList = await TraceToSPList.new(admin, {from: accounts[9]});
        rmispList = await TraceToSPList.new(admin, {from: accounts[9]});
        vList = await TraceToVerifierList.new(admin, {from: accounts[9]});

        await metaInfo.setRequestorWL(rqList.address, {from: admin});
        await metaInfo.setSPWL(spList.address, {from: admin});
        await metaInfo.setRMISPWL(rmispList.address, {from: admin});
        await metaInfo.setVerifierWL(vList.address, {from: admin});

        let rqcountry = 'Singapore';
        let rqname = 'test RQ';
        let rqemail = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';
        let pubKey = 'RQ_PUBKEY';

        await rqList.addPendingRequestorPR(rq, rqcountry, rqname, rqemail, uriForMoreDetails, hashForMoreDetails, {from: rq});
        await rqList.approveRequestorPR(rq, {from: admin});

        let rate = 10;
        let spname = 'test SP';
        let spemail = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await spList.addPendingSP(rate, spname, spemail, uriForRubrics, hashFroRubrics, lv, {from: sp});
        await spList.approveSP(sp, {from: admin});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await vList.addPendingVerifier(urlForUploading, hashForUploading, {from: t3V});
        await vList.approveVerifier(t3V, 3, {from: admin});

        tracetoProfileToken = await TraceToProfileToken.new(admin, metaInfo.address, {from: accounts[9]});
    })

    it('has an owner', async () => {
        assert.equal(await tracetoProfileToken.owner(), admin)
    })

    it('should be able to add a profile token by t3V', async () => {
        let profile = 'profileHash';
        let ipfs = 'ProfileIPFSHash';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile, ipfs, {from: t3V});

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _profileData = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData[0], profile);
        assert.equal(_profileData[1], ipfs);
        assert.equal(_profileData[2], 0);
    })

    it('should be able to set expiry by sp', async () => {
        let profile = 'profileHash';
        let ipfs = 'ProfileIPFSHash';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile, ipfs, {from: t3V});

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _profileData = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData[0], profile);
        assert.equal(_profileData[1], ipfs);
        assert.equal(_profileData[2], 0);

        let expiry = 24;
        await tracetoProfileToken.setExpiry(_profileList[0], expiry, {from: sp});

        _profileData = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData[0], profile);
        assert.equal(_profileData[1], ipfs);
        assert.equal(_profileData[2], expiry);
    })

    it('should be not able to set expiry by not sp', async () => {
        let profile = 'profileHash';
        let ipfs = 'ProfileIPFSHash';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile, ipfs, {from: t3V});

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _profileData = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData[0], profile);
        assert.equal(_profileData[1], ipfs);
        assert.equal(_profileData[2], 0);

        let expiry = 24;
        await utils.expectThrow(tracetoProfileToken.setExpiry(_profileList[0], expiry, {from: admin}));
        await utils.expectThrow(tracetoProfileToken.setExpiry(_profileList[0], expiry, {from: user}));

        _profileData = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData[0], profile);
        assert.equal(_profileData[1], ipfs);
        assert.equal(_profileData[2], 0);
    })

    it('should be able to add multiple profiles by t3V', async () => {
        let profile1 = 'profileHash1';
        let profile2 = 'profileHash2';
        let profile3 = 'profileHash3';
        let ipfs1 = 'ProfileIPFSHash1';
        let ipfs2 = 'ProfileIPFSHash2';
        let ipfs3 = 'ProfileIPFSHash3';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile1, ipfs1, {from: t3V});
        await tracetoProfileToken.assignProfileToken(user, profile2, ipfs2, {from: t3V});
        await tracetoProfileToken.assignProfileToken(user, profile3, ipfs3, {from: t3V});

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 3);
        assert.equal(_profileList.length, 3);

        let _profileData1 = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData1[0], profile1);
        assert.equal(_profileData1[1], ipfs1);
        assert.equal(_profileData1[2], 0);

        let _profileData2 = await tracetoProfileToken.getProfile(_profileList[1]);
        assert.equal(_profileData2[0], profile2);
        assert.equal(_profileData2[1], ipfs2);
        assert.equal(_profileData2[2], 0);

        let _profileData3 = await tracetoProfileToken.getProfile(_profileList[2]);
        assert.equal(_profileData3[0], profile3);
        assert.equal(_profileData3[1], ipfs3);
        assert.equal(_profileData3[2], 0);
    })

    it('should be not able to add the same profiles by t3V', async () => {
        let profile = 'profileHash';
        let ipfs1 = 'ProfileIPFSHash1';
        let ipfs2 = 'ProfileIPFSHash2';
        let ipfs3 = 'ProfileIPFSHash3';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile, ipfs1, {from: t3V});
        await utils.expectThrow(tracetoProfileToken.assignProfileToken(user, profile, ipfs2, {from: t3V}));
        await utils.expectThrow(tracetoProfileToken.assignProfileToken(user, profile, ipfs3, {from: t3V}));

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _profileData1 = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData1[0], profile);
        assert.equal(_profileData1[1], ipfs1);
        assert.equal(_profileData1[2], 0);
    })

    it('should be not able to add profiles by not t3V', async () => {
        let profile1 = 'profileHash1';
        let profile2 = 'profileHash2';
        let profile3 = 'profileHash3';
        let ipfs1 = 'ProfileIPFSHash1';
        let ipfs2 = 'ProfileIPFSHash2';
        let ipfs3 = 'ProfileIPFSHash3';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile1, ipfs1, {from: t3V});
        await utils.expectThrow(tracetoProfileToken.assignProfileToken(user, profile2, ipfs2, {from: user}));
        await utils.expectThrow(tracetoProfileToken.assignProfileToken(user, profile3, ipfs3, {from: admin}));

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _profileData1 = await tracetoProfileToken.getProfile(_profileList[0]);
        assert.equal(_profileData1[0], profile1);
        assert.equal(_profileData1[1], ipfs1);
        assert.equal(_profileData1[2], 0);
    })

    it('should be able to add a kyc token by rq', async () => {
        let profile = 'profileHash';
        let ipfs = 'ProfileIPFSHash';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile, ipfs, {from: t3V});

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _kycCount = await tracetoProfileToken.getProfileKYCCount(_profileList[0]);
        let _kycList = await tracetoProfileToken.getProfileKYCs(_profileList[0]);

        assert.equal(_kycCount, 0);
        assert.equal(_kycList.length, 0);

        let kycReuslt = "reuslt";
        let decay = 15;

        await tracetoProfileToken.assignKYCToken(_profileList[0], kycReuslt, decay, {from: rq});

        _kycCount = await tracetoProfileToken.getProfileKYCCount(_profileList[0]);
        _kycList = await tracetoProfileToken.getProfileKYCs(_profileList[0]);

        assert.equal(_kycCount, 1);
        assert.equal(_kycList.length, 1);

        let _kycData1 = await tracetoProfileToken.getKYC(_kycList[0]);
        assert.equal(_kycData1[0], rq);
        assert.equal(_kycData1[1], kycReuslt);
        assert.equal(_kycData1[2], decay);
    })

    it('should be not able to add a kyc token by not rq', async () => {
        let profile = 'profileHash';
        let ipfs = 'ProfileIPFSHash';

        let _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        let _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 0);
        assert.equal(_profileList.length, 0);

        await tracetoProfileToken.assignProfileToken(user, profile, ipfs, {from: t3V});

        _profileCount = await tracetoProfileToken.getUserProfileTokenCount(user);
        _profileList = await tracetoProfileToken.getUserProfileTokenList(user);

        assert.equal(_profileCount, 1);
        assert.equal(_profileList.length, 1);

        let _kycCount = await tracetoProfileToken.getProfileKYCCount(_profileList[0]);
        let _kycList = await tracetoProfileToken.getProfileKYCs(_profileList[0]);

        assert.equal(_kycCount, 0);
        assert.equal(_kycList.length, 0);

        let kycReuslt = "reuslt";
        let decay = 15;

        await tracetoProfileToken.assignKYCToken(_profileList[0], kycReuslt, decay, {from: rq});
        await utils.expectThrow(tracetoProfileToken.assignKYCToken(_profileList[0], kycReuslt, decay, {from: admin}));
        await utils.expectThrow(tracetoProfileToken.assignKYCToken(_profileList[0], kycReuslt, decay, {from: user}));

        _kycCount = await tracetoProfileToken.getProfileKYCCount(_profileList[0]);
        _kycList = await tracetoProfileToken.getProfileKYCs(_profileList[0]);

        assert.equal(_kycCount, 1);
        assert.equal(_kycList.length, 1);

        let _kycData1 = await tracetoProfileToken.getKYC(_kycList[0]);
        assert.equal(_kycData1[0], rq);
        assert.equal(_kycData1[1], kycReuslt);
        assert.equal(_kycData1[2], decay);
    })
})