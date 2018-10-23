var TraceToRequestorList = artifacts.require("../contracts/TraceToRequestorList.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToRequestorList', function(accounts) {
    let tracetoRequestorList;
  
    beforeEach('setup contract for each test', async () => {
        let admin = accounts[8];
        tracetoRequestorList = await TraceToRequestorList.new(admin, {from: accounts[9]})
    })

    it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoRequestorList.owner(), admin)
    })

    it("should be able to add a pending requestor pr contract", async () => {
        let admin = accounts[8];

        let requestor = accounts[1];

        let prContract = '0x1c1e6a5e5a43d3e3a528ef0cb23d32bda70b7a52';

        let country = 'Singapore';
        let name = 'test RQ';
        let email = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await tracetoRequestorList.addPendingRequestorPR(prContract, country, name, email, uriForMoreDetails, hashForMoreDetails, {from: requestor});

        let _isRequestor = await tracetoRequestorList.isRequestorPR.call(prContract);
        let _pendingPRMeta = await tracetoRequestorList.getPendingRequestorPRMeta.call(prContract);
        let _prMeta = await tracetoRequestorList.getRequestorPRMeta.call(prContract);

        assert.equal(_isRequestor, false);

        assert.equal(_pendingPRMeta[0], country);
        assert.equal(_pendingPRMeta[1], name);
        assert.equal(_pendingPRMeta[2], email);
        assert.equal(_pendingPRMeta[3], uriForMoreDetails);
        assert.equal(_pendingPRMeta[4], hashForMoreDetails);

        assert.equal(_prMeta[0], "");
        assert.equal(_prMeta[1], "");
        assert.equal(_prMeta[2], "");
        assert.equal(_prMeta[3], "");
        assert.equal(_prMeta[4], "");
    })

    it("should be able to approve a pending requestor pr contract by owner", async () => {
        let admin = accounts[8];

        let requestor = accounts[1];

        let prContract = '0x1c1e6a5e5a43d3e3a528ef0cb23d32bda70b7a52';

        let country = 'Singapore';
        let name = 'test RQ';
        let email = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await tracetoRequestorList.addPendingRequestorPR(prContract, country, name, email, uriForMoreDetails, hashForMoreDetails, {from: requestor});
        await tracetoRequestorList.approveRequestorPR(prContract, {from: admin});

        let _isRequestor = await tracetoRequestorList.isRequestorPR.call(prContract);
        let _pendingPRMeta = await tracetoRequestorList.getPendingRequestorPRMeta.call(prContract);
        let _prMeta = await tracetoRequestorList.getRequestorPRMeta.call(prContract);

        assert.equal(_isRequestor, true);

        assert.equal(_pendingPRMeta[0], "");
        assert.equal(_pendingPRMeta[1], "");
        assert.equal(_pendingPRMeta[2], "");
        assert.equal(_pendingPRMeta[3], "");
        assert.equal(_pendingPRMeta[4], "");

        assert.equal(_prMeta[0], country);
        assert.equal(_prMeta[1], name);
        assert.equal(_prMeta[2], email);
        assert.equal(_prMeta[3], uriForMoreDetails);
        assert.equal(_prMeta[4], hashForMoreDetails);
    })

    it("should be not able to approve a pending requestor pr contract by not owner", async () => {
        let admin = accounts[8];

        let requestor = accounts[1];

        let prContract = '0x1c1e6a5e5a43d3e3a528ef0cb23d32bda70b7a52';

        let country = 'Singapore';
        let name = 'test RQ';
        let email = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await tracetoRequestorList.addPendingRequestorPR(prContract, country, name, email, uriForMoreDetails, hashForMoreDetails, {from: requestor});
        await utils.expectThrow(tracetoRequestorList.approveRequestorPR(prContract));

        let _isRequestor = await tracetoRequestorList.isRequestorPR.call(prContract);
        let _pendingPRMeta = await tracetoRequestorList.getPendingRequestorPRMeta.call(prContract);
        let _prMeta = await tracetoRequestorList.getRequestorPRMeta.call(prContract);

        assert.equal(_isRequestor, false);

        assert.equal(_pendingPRMeta[0], country);
        assert.equal(_pendingPRMeta[1], name);
        assert.equal(_pendingPRMeta[2], email);
        assert.equal(_pendingPRMeta[3], uriForMoreDetails);
        assert.equal(_pendingPRMeta[4], hashForMoreDetails);

        assert.equal(_prMeta[0], "");
        assert.equal(_prMeta[1], "");
        assert.equal(_prMeta[2], "");
        assert.equal(_prMeta[3], "");
        assert.equal(_prMeta[4], "");
    })

    it("should be able to remove a pending requestor pr contract by owner", async () => {
        let admin = accounts[8];

        let requestor = accounts[1];

        let prContract = '0x1c1e6a5e5a43d3e3a528ef0cb23d32bda70b7a52';

        let country = 'Singapore';
        let name = 'test RQ';
        let email = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await tracetoRequestorList.addPendingRequestorPR(prContract, country, name, email, uriForMoreDetails, hashForMoreDetails, {from: requestor});
        await tracetoRequestorList.approveRequestorPR(prContract,{from: admin});
        await tracetoRequestorList.removeRequestorPR(prContract, {from: admin});

        let _isRequestor = await tracetoRequestorList.isRequestorPR.call(prContract);
        let _pendingPRMeta = await tracetoRequestorList.getPendingRequestorPRMeta.call(prContract);
        let _prMeta = await tracetoRequestorList.getRequestorPRMeta.call(prContract);

        assert.equal(_isRequestor, false);

        assert.equal(_pendingPRMeta[0], "");
        assert.equal(_pendingPRMeta[1], "");
        assert.equal(_pendingPRMeta[2], "");
        assert.equal(_pendingPRMeta[3], "");
        assert.equal(_pendingPRMeta[4], "");

        assert.equal(_prMeta[0], "");
        assert.equal(_prMeta[1], "");
        assert.equal(_prMeta[2], "");
        assert.equal(_prMeta[3], "");
        assert.equal(_prMeta[4], "");
    })


    it("should be not able to remove a pending requestor pr contract by not owner", async () => {
        let admin = accounts[8];

        let requestor = accounts[1];

        let prContract = '0x1c1e6a5e5a43d3e3a528ef0cb23d32bda70b7a52';

        let country = 'Singapore';
        let name = 'test RQ';
        let email = 're@traceto.io';
        let uriForMoreDetails = 'QmZ57FxhFB7rb2JjKPPRqruNn4BNKMDtNfXaWx4D1mY5LX';
        let hashForMoreDetails = '47aaf3be01cb58da5ac1f5d2999ebc5f85e173cc';

        await tracetoRequestorList.addPendingRequestorPR(prContract, country, name, email, uriForMoreDetails, hashForMoreDetails, {from: requestor});
        await tracetoRequestorList.approveRequestorPR(prContract,{from: admin});
        await utils.expectThrow(tracetoRequestorList.removeRequestorPR(prContract));

        let _isRequestor = await tracetoRequestorList.isRequestorPR.call(prContract);
        let _pendingPRMeta = await tracetoRequestorList.getPendingRequestorPRMeta.call(prContract);
        let _prMeta = await tracetoRequestorList.getRequestorPRMeta.call(prContract);

        assert.equal(_isRequestor, true);

        assert.equal(_pendingPRMeta[0], "");
        assert.equal(_pendingPRMeta[1], "");
        assert.equal(_pendingPRMeta[2], "");
        assert.equal(_pendingPRMeta[3], "");
        assert.equal(_pendingPRMeta[4], "");

        assert.equal(_prMeta[0], country);
        assert.equal(_prMeta[1], name);
        assert.equal(_prMeta[2], email);
        assert.equal(_prMeta[3], uriForMoreDetails);
        assert.equal(_prMeta[4], hashForMoreDetails);
    })



});