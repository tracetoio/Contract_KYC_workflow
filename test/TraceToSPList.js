var TraceToSPList = artifacts.require("../contracts/TraceToSPList.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToSPList', function(accounts) {
    let tracetoSPList;

    let uintMax = new BigNumber(2).pow(256);
  
    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        tracetoSPList = await TraceToSPList.new(admin, {from: accounts[9]})
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoSPList.owner(), admin)
    })

    it("should be able to add a pending sp", async () => {
        let admin = accounts[8];

        let sp = accounts[1];

        let rate = 20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp});

        let _isSP = await tracetoSPList.isSP.call(sp);
        let _pendingSPMeta = await tracetoSPList.getPendingSPDetail.call(sp);
        let _spMeta = await tracetoSPList.getSPDetail.call(sp);
        await utils.expectThrow(tracetoSPList.getSPList.call(0, 1));
        let _spRate = await tracetoSPList.getSPRate.call(sp);

        assert.equal(_isSP, false);

        assert.equal(_pendingSPMeta[0], rate);
        assert.equal(_pendingSPMeta[1], name);
        assert.equal(_pendingSPMeta[2], email);
        assert.equal(_pendingSPMeta[3], uriForRubrics);
        assert.equal(_pendingSPMeta[4], hashFroRubrics);
        assert.equal(_pendingSPMeta[5], lv);

        assert.equal(_spMeta[0], 0);
        assert.equal(_spMeta[1], "");
        assert.equal(_spMeta[2], "");
        assert.equal(_spMeta[3], "");
        assert.equal(_spMeta[4], "");
        assert.equal(_spMeta[5], 0);

        assert.equal(_spRate, 0);
    })

    it("should be not able to add a pending sp with negative rate", async () => {
        let admin = accounts[8];

        let sp = accounts[1];

        let rate = -20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp});

        let _isSP = await tracetoSPList.isSP.call(sp);
        let _pendingSPMeta = await tracetoSPList.getPendingSPDetail.call(sp);
        let _spMeta = await tracetoSPList.getSPDetail.call(sp);
        await utils.expectThrow(tracetoSPList.getSPList.call(0, 1));
        let _spRate = await tracetoSPList.getSPRate.call(sp)

        assert.equal(_isSP, false);

        assert.equal(_pendingSPMeta[0].minus(uintMax.minus(20)), 0);
        assert.equal(_pendingSPMeta[1], name);
        assert.equal(_pendingSPMeta[2], email);
        assert.equal(_pendingSPMeta[3], uriForRubrics);
        assert.equal(_pendingSPMeta[4], hashFroRubrics);
        assert.equal(_pendingSPMeta[5], lv);

        assert.equal(_spMeta[0], 0);
        assert.equal(_spMeta[1], "");
        assert.equal(_spMeta[2], "");
        assert.equal(_spMeta[3], "");
        assert.equal(_spMeta[4], "");
        assert.equal(_spMeta[5], 0);

        assert.equal(_spRate, 0);
    })

    it("should be able to approve a pending sp by owner", async () => {
        let admin = accounts[8];

        let sp = accounts[1];

        let rate = 20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp});
        await tracetoSPList.approveSP(sp, {from: admin});

        let _isSP = await tracetoSPList.isSP.call(sp);
        let _pendingSPMeta = await tracetoSPList.getPendingSPDetail.call(sp);
        let _spMeta = await tracetoSPList.getSPDetail.call(sp);
        let _spList = await tracetoSPList.getSPList.call(0, 1);
        let _spRate = await tracetoSPList.getSPRate.call(sp);

        assert.equal(_isSP, true);

        assert.equal(_pendingSPMeta[0], 0);
        assert.equal(_pendingSPMeta[1], "");
        assert.equal(_pendingSPMeta[2], "");
        assert.equal(_pendingSPMeta[3], "");
        assert.equal(_pendingSPMeta[4], "");
        assert.equal(_pendingSPMeta[5], 0);

        assert.equal(_spMeta[0], rate);
        assert.equal(_spMeta[1], name);
        assert.equal(_spMeta[2], email);
        assert.equal(_spMeta[3], uriForRubrics);
        assert.equal(_spMeta[4], hashFroRubrics);
        assert.equal(_spMeta[5], lv);

        assert.equal(_spList.length, 1);
        assert.equal(_spList[0], sp);
        assert.equal(_spRate, rate);
    })

    it("should be not able to approve a pending sp by not owner", async () => {
        let admin = accounts[8];

        let sp = accounts[1];

        let rate = 20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp});
        await utils.expectThrow(tracetoSPList.approveSP(sp, {from: sp}));

        let _isSP = await tracetoSPList.isSP.call(sp);
        let _pendingSPMeta = await tracetoSPList.getPendingSPDetail.call(sp);
        let _spMeta = await tracetoSPList.getSPDetail.call(sp);
        await utils.expectThrow(tracetoSPList.getSPList.call(0, 1));
        let _spRate = await tracetoSPList.getSPRate.call(sp);

        assert.equal(_isSP, false);

        assert.equal(_pendingSPMeta[0], rate);
        assert.equal(_pendingSPMeta[1], name);
        assert.equal(_pendingSPMeta[2], email);
        assert.equal(_pendingSPMeta[3], uriForRubrics);
        assert.equal(_pendingSPMeta[4], hashFroRubrics);
        assert.equal(_pendingSPMeta[5], lv);

        assert.equal(_spMeta[0], 0);
        assert.equal(_spMeta[1], "");
        assert.equal(_spMeta[2], "");
        assert.equal(_spMeta[3], "");
        assert.equal(_spMeta[4], "");
        assert.equal(_spMeta[5], 0);

        assert.equal(_spRate, 0);
    })

    it("should be able to remove a sp by owner", async () => {
        let admin = accounts[8];

        let sp = accounts[1];

        let rate = 20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp});
        await tracetoSPList.approveSP(sp, {from: admin});
        await tracetoSPList.removeSP(sp, {from: admin});

        let _isSP = await tracetoSPList.isSP.call(sp);
        let _pendingSPMeta = await tracetoSPList.getPendingSPDetail.call(sp);
        let _spMeta = await tracetoSPList.getSPDetail.call(sp);
        await utils.expectThrow(tracetoSPList.getSPList.call(0, 1));
        let _spRate = await tracetoSPList.getSPRate.call(sp);

        assert.equal(_isSP, false);

        assert.equal(_pendingSPMeta[0], 0);
        assert.equal(_pendingSPMeta[1], "");
        assert.equal(_pendingSPMeta[2], "");
        assert.equal(_pendingSPMeta[3], "");
        assert.equal(_pendingSPMeta[4], "");
        assert.equal(_pendingSPMeta[5], 0);

        assert.equal(_spMeta[0], 0);
        assert.equal(_spMeta[1], "");
        assert.equal(_spMeta[2], "");
        assert.equal(_spMeta[3], "");
        assert.equal(_spMeta[4], "");
        assert.equal(_spMeta[5], 0);

        assert.equal(_spRate, 0);
    })
    it("should be not able to remove a sp by not owner", async () => {
        let admin = accounts[8];

        let sp = accounts[1];

        let rate = 20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp});
        await tracetoSPList.approveSP(sp, {from: admin});
        await utils.expectThrow(tracetoSPList.removeSP(sp, {from: sp}));

        let _isSP = await tracetoSPList.isSP.call(sp);
        let _pendingSPMeta = await tracetoSPList.getPendingSPDetail.call(sp);
        let _spMeta = await tracetoSPList.getSPDetail.call(sp);
        let _spList = await tracetoSPList.getSPList.call(0, 1);
        let _spRate = await tracetoSPList.getSPRate.call(sp);

        assert.equal(_isSP, true);

        assert.equal(_pendingSPMeta[0], 0);
        assert.equal(_pendingSPMeta[1], "");
        assert.equal(_pendingSPMeta[2], "");
        assert.equal(_pendingSPMeta[3], "");
        assert.equal(_pendingSPMeta[4], "");
        assert.equal(_pendingSPMeta[5], 0);

        assert.equal(_spMeta[0], rate);
        assert.equal(_spMeta[1], name);
        assert.equal(_spMeta[2], email);
        assert.equal(_spMeta[3], uriForRubrics);
        assert.equal(_spMeta[4], hashFroRubrics);
        assert.equal(_spMeta[5], lv);

        assert.equal(_spList.length, 1);
        assert.equal(_spList[0], sp);
        assert.equal(_spRate, rate);
    })

    it("should be able to approve more than one sp by owner", async () => {
        let admin = accounts[8];

        let sp1 = accounts[1];
        let sp2 = accounts[2];
        let sp3 = accounts[3];
        let sp4 = accounts[4];

        let rate = 20;
        let name = 'test SP';
        let email = 'sp@traceto.io';
        let uriForRubrics = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashFroRubrics = '0x47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc000000000000000000000000';
        let lv = 2;

        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp1});
        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp2});
        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp3});
        await tracetoSPList.addPendingSP(rate, name, email, uriForRubrics, hashFroRubrics, lv, {from: sp4});
        await tracetoSPList.approveSP(sp1, {from: admin});
        await tracetoSPList.approveSP(sp2, {from: admin});
        await tracetoSPList.approveSP(sp3, {from: admin});
        await tracetoSPList.approveSP(sp4, {from: admin});

        let _spList = await tracetoSPList.getSPList.call(0, 4);

        assert.equal(_spList.length, 4);
        assert.equal(_spList[0], sp1);
        assert.equal(_spList[1], sp2);
        assert.equal(_spList[2], sp3);
        assert.equal(_spList[3], sp4);

        await tracetoSPList.removeSP(sp2, {from: admin});

        _spList = await tracetoSPList.getSPList.call(0, 3);

        assert.equal(_spList.length, 3);
        assert.equal(_spList[0], sp1);
        assert.equal(_spList[1], sp4);
        assert.equal(_spList[2], sp3);
    })

});