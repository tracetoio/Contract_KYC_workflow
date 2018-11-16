var TraceToKYCToken = artifacts.require("../contracts/TraceToKYCToken.sol");
var utils = require("../test/utils.js");

var BigNumber = require('bignumber.js');
contract('TraceToKYCToken', function(accounts) {
	let tracetoKYCToken;
	beforeEach('setup contract for each test', async () => {
		let admin = accounts[8];
		tracetoKYCToken = await TraceToKYCToken.new(admin, {from: accounts[9]});
	})

	it('has an owner', async () => {
        let admin = accounts[8];
        assert.equal(await tracetoKYCToken.owner(), admin)
    })

    it('should be able to assign a token by owner', async() => {
    	let admin = accounts[8];
    	let to = accounts[1];
    	let tokenId = 10;
    	let tokenURI = "test";

    	await tracetoKYCToken.mintUniqueTokenTo(to, tokenId, tokenURI, {from: admin});

    	assert.equal(await tracetoKYCToken.ownerOf(tokenId), to);
    	assert.equal(await tracetoKYCToken.tokenURI(tokenId), tokenURI);
    })

    it('should be not able to assign a token by not owner', async() => {
    	let admin = accounts[8];
    	let to = accounts[1];
    	let tokenId = 10;
    	let tokenURI = "test";

    	await utils.expectThrow(tracetoKYCToken.mintUniqueTokenTo(to, tokenId, tokenURI, {from: to}));

    	await utils.expectThrow(tracetoKYCToken.ownerOf(tokenId));
    	await utils.expectThrow(tracetoKYCToken.tokenURI(tokenId));
    })
})