var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");

var T2TContract = artifacts.require("../contracts/TraceToToken.sol");
var TraceToStakeWallet = artifacts.require("../contracts/TraceToStakeWallet.sol");
var TraceToPendingToken = artifacts.require("../contracts/TraceToPendingToken.sol");
var TraceToMetaInfo = artifacts.require("../contracts/TraceToMetaInfo.sol");

var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToVerifierList', function(accounts) {
    let tracetoVerifierList, t2tContract, tracetoStakeWallet;

    let minStakeAmount = 500;
  
    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        let v1 = accounts[1];
        let v2 = accounts[2];
        let v3 = accounts[3];
        let v4 = accounts[4];

        tracetoVerifierList = await TraceToVerifierList.new(admin, {from: accounts[9]})
        t2tContract = await T2TContract.new(admin, 4000, 0, v1);

        await t2tContract.transfer(v1, 800, {from: admin});
        await t2tContract.transfer(v2, 800, {from: admin});
        await t2tContract.transfer(v3, 800, {from: admin});
        await t2tContract.transfer(v4, 800, {from: admin});

        assert.equal(await t2tContract.balanceOf.call(admin), 800);
        assert.equal(await t2tContract.balanceOf.call(v1), 800);
        assert.equal(await t2tContract.balanceOf.call(v2), 800);
        assert.equal(await t2tContract.balanceOf.call(v3), 800);
        assert.equal(await t2tContract.balanceOf.call(v4), 800);

        let tracetoMetaInfo = await TraceToMetaInfo.new(admin, t2tContract.address, {from: accounts[9]})
        await tracetoMetaInfo.setVerifierWL(tracetoVerifierList.address, {from: admin});
        await tracetoMetaInfo.setMinimalStakeAmount(minStakeAmount, {from: admin});

        tracetoStakeWallet = await TraceToStakeWallet.new(tracetoMetaInfo.address, t2tContract.address, {from: accounts[9]});
        await tracetoVerifierList.setTraceToStakeWallet(tracetoStakeWallet.address, {from: admin});

        tracetoPendingToken = await TraceToPendingToken.new(tracetoMetaInfo.address, 100, {from: accounts[9]});
        await tracetoVerifierList.setTraceToPendingToken(tracetoPendingToken.address, {from: admin});
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoVerifierList.owner(), admin);
    })

    it("should be able to add a pending v if approved", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 100);
        assert.equal(_pendingVMeta[1], urlForUploading);
        assert.equal(_pendingVMeta[2], hashForUploading);

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");

        assert.equal(_vList.length, 0);
    })

    it("should be not able to add a pending v if not approved", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await utils.expectThrow(tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v}));

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 0);
        assert.equal(_pendingVMeta[1], "");
        assert.equal(_pendingVMeta[2], "");

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");

        assert.equal(_vList.length, 0);
    })

    it("should be able to approve a pending v by owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await tracetoVerifierList.approveVerifier(v, 2, {from: admin});

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_isVerifier, true);

        assert.equal(_pendingVMeta[0], 0);
        assert.equal(_pendingVMeta[1], "");
        assert.equal(_pendingVMeta[2], "");

        assert.equal(_vMeta[0], 100);
        assert.equal(_vMeta[1], urlForUploading);
        assert.equal(_vMeta[2], hashForUploading);

        assert.equal(_vList.length, 1);
    })

    it("should be not able to approve a pending v by not owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await utils.expectThrow(tracetoVerifierList.approveVerifier(v, 2, {from: v}));

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 100);
        assert.equal(_pendingVMeta[1], urlForUploading);
        assert.equal(_pendingVMeta[2], hashForUploading);

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");

        assert.equal(_vList.length, 0);
    })

    it("should be able to remove a v by owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await tracetoVerifierList.approveVerifier(v, 2, {from: admin});
        await tracetoVerifierList.removeVerifier(v, {from: admin});

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 0);
        assert.equal(_pendingVMeta[1], "");
        assert.equal(_pendingVMeta[2], "");

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");

        assert.equal(_vList.length, 0);
    })

    it("should be not able to remove a v by not owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await tracetoVerifierList.approveVerifier(v, 2, {from: admin});
        await utils.expectThrow(tracetoVerifierList.removeVerifier(v, {from: v}));

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_isVerifier, true);

        assert.equal(_pendingVMeta[0], 0);
        assert.equal(_pendingVMeta[1], "");
        assert.equal(_pendingVMeta[2], "");

        assert.equal(_vMeta[0], 100);
        assert.equal(_vMeta[1], urlForUploading);
        assert.equal(_vMeta[2], hashForUploading);

        assert.equal(_vList.length, 1);
    })

    it("should be able to approve more than one v by owner", async () => {
        let admin = accounts[8];

        let v1 = accounts[1];
        let v2 = accounts[2];
        let v3 = accounts[3];
        let v4 = accounts[4];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v1});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v2});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v3});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v4});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v1});
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v2});
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v3});
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v4});
        await tracetoVerifierList.approveVerifier(v1, 2, {from: admin});
        await tracetoVerifierList.approveVerifier(v2, 2, {from: admin});
        await tracetoVerifierList.approveVerifier(v3, 2, {from: admin});
        await tracetoVerifierList.approveVerifier(v4, 2, {from: admin});

        let _vList = await tracetoVerifierList.getVerifierList.call(2);


        assert.equal(_vList.length, 4);
        assert.equal(_vList[0], v1);
        assert.equal(_vList[1], v2);
        assert.equal(_vList[2], v3);
        assert.equal(_vList[3], v4);

        await tracetoVerifierList.removeVerifier(v3, {from: admin});

        _vList = await tracetoVerifierList.getVerifierList.call(2);

        assert.equal(_vList.length, 3);
        assert.equal(_vList[0], v1);
        assert.equal(_vList[1], v2);
        assert.equal(_vList[2], v4);
    })

    it("should be able to approve other tier v by owner", async () => {
        let admin = accounts[8];

        let v1 = accounts[1];
        let v2 = accounts[2];
        let v3 = accounts[3];
        let v4 = accounts[4];

        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v1});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v2});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v3});
        await t2tContract.approve(tracetoStakeWallet.address, minStakeAmount, {from: v4});

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';

        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v1});
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v2});
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v3});
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v4});
        await tracetoVerifierList.approveVerifier(v1, 1, {from: admin});
        await tracetoVerifierList.approveVerifier(v2, 2, {from: admin});
        await tracetoVerifierList.approveVerifier(v3, 3, {from: admin});
        await tracetoVerifierList.approveVerifier(v4, 2, {from: admin});

        let _t1vList = await tracetoVerifierList.getVerifierList.call(1);
        let _t2vList = await tracetoVerifierList.getVerifierList.call(2);
        let _t3vList = await tracetoVerifierList.getVerifierList.call(3);


        assert.equal(_t1vList.length, 1);
        assert.equal(_t2vList.length, 2);
        assert.equal(_t3vList.length, 1);
        assert.equal(_t1vList[0], v1);
        assert.equal(_t2vList[0], v2);
        assert.equal(_t2vList[1], v4);
        assert.equal(_t3vList[0], v3);

        await tracetoVerifierList.updateVerifierTier(v2, 3, {from: admin});

        _t1vList = await tracetoVerifierList.getVerifierList.call(1);
        _t2vList = await tracetoVerifierList.getVerifierList.call(2);
        _t3vList = await tracetoVerifierList.getVerifierList.call(3);

        assert.equal(_t1vList.length, 1);
        assert.equal(_t2vList.length, 1);
        assert.equal(_t3vList.length, 2);
        assert.equal(_t1vList[0], v1);
        assert.equal(_t2vList[0], v4);
        assert.equal(_t3vList[0], v3);
        assert.equal(_t3vList[1], v2);

        await tracetoVerifierList.updateVerifierTier(v1, 5, {from: admin});
        await tracetoVerifierList.updateVerifierTier(v2, 0, {from: admin});
        await tracetoVerifierList.updateVerifierTier(v3, 1, {from: admin});

        _t1vList = await tracetoVerifierList.getVerifierList.call(1);
        _t2vList = await tracetoVerifierList.getVerifierList.call(2);
        _t3vList = await tracetoVerifierList.getVerifierList.call(3);

        assert.equal(_t1vList.length, 2);
        assert.equal(_t2vList.length, 1);
        assert.equal(_t3vList.length, 1);
        assert.equal(_t1vList[0], v2);
        assert.equal(_t1vList[1], v3);
        assert.equal(_t2vList[0], v4);
        assert.equal(_t3vList[0], v1);
    })

});