# Contract_kyc_workflow

## Deployment Guide
1. Creating/Importing T2T token contract
	1. if there is no avalible T2T contract, you can deploy a new one, with parameters <adminAddr, totalSupply, lockingTime, exchangeAddr> or using the deployment script in T2T contracts
	

2. Deploy KYC contracts
	1. Fill in the admin address, t2t contract address, adding ropsten provider and your mnemonic in the script
	2. Deploy by running the following script
	
		```
		admin=<Address-Admin>
        t2t=<Address-t2tContract>
        mnemonic=<Mnemonic-Admin>
        infura=<URL-Infura>
        sed -e "s;%admin%;$admin;g" -e "s;%t2t%;$t2t;g" settings.json.default > settings.json
        sed -e "s;%mnemonic%;$mnemonic;g" -e "s;%infura%;$infura;g" truffle.js.default > truffle.js
		truffle migrate --network ropsten --reset > migrate.out
		``` 
	3. Check Whether there is any error in migrate.out
	4. extract the contract address, it will extract the contract abi and the deployed contract addresses for other applications.

		```
		node extract_contract.js  < migrate.out > environment.json
		```
3. Deploy PR contract and setup the dummy SP/RMISP data
	1. Update provider path and environment.json path instead of the traceto default version.
	2. Fill in the priKey for Admin/RQ/SP/RMISP.
	3. Details will be downloaded for RQ/SP/RMISP, you can change to the local version also.
	4. Run the script
	
		```
		npm i

		admin=<PriKey-Admin>
		rq=<PriKey-Requestor>
		sp=<PriKey-SP>
		rmisp=<PriKey-RMISP>
		v=<PriKey-Verifer>
		
		sed -e "s;%admin%;$admin;g" -e "s;%rq%;$rq;g" -e "s;%sp%;$sp;g" -e "s;%rmisp%;$rmisp;g" -e "s;%v%;$v;g" index.js.default > index.js
		node index.js 
		```
	
## Testing Guide

Please run this script to start all the test cases.

```
truffle test
```

For testing individual contracts, you can use

```
cd ./test/
truffle test <contract_name>.js
```