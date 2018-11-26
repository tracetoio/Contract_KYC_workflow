var TraceToVerifierList = artifacts.require("../contracts/TraceToVerifierList.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToVerifierList', function(accounts) {
    let tracetoVerifierList;

    let emptyAddr = "0x0000000000000000000000000000000000000000";
  
    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        tracetoVerifierList = await TraceToVerifierList.new(admin, {from: accounts[9]})
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoVerifierList.owner(), admin)
    })

    it("should be able to add a pending v", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        await utils.expectThrow(tracetoVerifierList.getVerifierList.call(2, 0, 1));

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 100);
        assert.equal(_pendingVMeta[1], urlForUploading);
        assert.equal(_pendingVMeta[2], hashForUploading);

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");
    })

    it("should be able to approve a pending v by owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await tracetoVerifierList.approveVerifier(v, 2, {from: admin});

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2, 0, 1);

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

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await utils.expectThrow(tracetoVerifierList.approveVerifier(v, 2, {from: v}));

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        await utils.expectThrow(tracetoVerifierList.getVerifierList.call(2, 0, 1));

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 100);
        assert.equal(_pendingVMeta[1], urlForUploading);
        assert.equal(_pendingVMeta[2], hashForUploading);

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");
    })

    it("should be able to remove a v by owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await tracetoVerifierList.approveVerifier(v, 2, {from: admin});
        await tracetoVerifierList.removeVerifier(v, {from: admin});

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        await utils.expectThrow(tracetoVerifierList.getVerifierList.call(2, 0, 1));

        assert.equal(_isVerifier, false);

        assert.equal(_pendingVMeta[0], 0);
        assert.equal(_pendingVMeta[1], "");
        assert.equal(_pendingVMeta[2], "");

        assert.equal(_vMeta[0], 0);
        assert.equal(_vMeta[1], "");
        assert.equal(_vMeta[2], "");
    })

    it("should be not able to remove a v by not owner", async () => {
        let admin = accounts[8];

        let v = accounts[1];

        let urlForUploading = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForUploading = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        
        await tracetoVerifierList.addPendingVerifier(urlForUploading, hashForUploading, {from: v});
        await tracetoVerifierList.approveVerifier(v, 2, {from: admin});
        await utils.expectThrow(tracetoVerifierList.removeVerifier(v, {from: v}));

        let _isVerifier = await tracetoVerifierList.isVerifier.call(v, 2);
        let _pendingVMeta = await tracetoVerifierList.getPendingVerifierDetail.call(v);
        let _vMeta = await tracetoVerifierList.getVerifierDetail.call(v);
        let _vList = await tracetoVerifierList.getVerifierList.call(2, 0, 1);

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

        let _vList = await tracetoVerifierList.getVerifierList.call(2, 0, 4);

        assert.equal(_vList.length, 4);
        assert.equal(_vList[0], v1);
        assert.equal(_vList[1], v2);
        assert.equal(_vList[2], v3);
        assert.equal(_vList[3], v4);

        await tracetoVerifierList.removeVerifier(v3, {from: admin});

        _vList = await tracetoVerifierList.getVerifierList.call(2, 0, 3);

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

        let _t1vList = await tracetoVerifierList.getVerifierList.call(1, 0, 1);
        let _t2vList = await tracetoVerifierList.getVerifierList.call(2, 0, 2);
        let _t3vList = await tracetoVerifierList.getVerifierList.call(3, 0, 1);

        assert.equal(_t1vList.length, 1);
        assert.equal(_t2vList.length, 2);
        assert.equal(_t3vList.length, 1);
        assert.equal(_t1vList[0], v1);
        assert.equal(_t2vList[0], v2);
        assert.equal(_t2vList[1], v4);
        assert.equal(_t3vList[0], v3);

        await tracetoVerifierList.updateVerifierTier(v2, 3, {from: admin});

        _t1vList = await tracetoVerifierList.getVerifierList.call(1, 0, 1);
        _t2vList = await tracetoVerifierList.getVerifierList.call(2, 0, 1);
        _t3vList = await tracetoVerifierList.getVerifierList.call(3, 0, 2);

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

        _t1vList = await tracetoVerifierList.getVerifierList.call(1, 0, 2);
        _t2vList = await tracetoVerifierList.getVerifierList.call(2, 0, 1);
        _t3vList = await tracetoVerifierList.getVerifierList.call(3, 0, 1);

        assert.equal(_t1vList.length, 2);
        assert.equal(_t2vList.length, 1);
        assert.equal(_t3vList.length, 1);
        assert.equal(_t1vList[0], v2);
        assert.equal(_t1vList[1], v3);
        assert.equal(_t2vList[0], v4);
        assert.equal(_t3vList[0], v1);
    })

});