const fs = require('fs');
const readline = require('readline');

const contractFolder = './build/contracts/';

let idx = 0;
let contracts = [];

let output = {"TraceToContracts":[]};

fs.readdir(contractFolder, (err, files) => {
	files.forEach(file => {
		contracts.push({
			name: file.slice(0, -5),
			abi: JSON.parse(fs.readFileSync(contractFolder+file, 'utf8')).abi
		})
	});
})

let reader = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

let SPContractExist = false;

let matchContract = function(line){
	for(var i in contracts){
		if(line.indexOf(contracts[i].name+":")>=0){
			if(contracts[i].name == "TraceToSPList" && SPContractExist){
				output.TraceToContracts.push({
					name: "TraceToRMISPList",
					address: line.slice(line.indexOf(":")+2),
					abi: contracts[i].abi
				});
			}else{
				output.TraceToContracts.push({
					name: contracts[i].name,
					address: line.slice(line.indexOf(":")+2),
					abi: contracts[i].abi
				});
				if(contracts[i].name == "TraceToSPList")
					SPContractExist = true;
			}
		}
	}
}

reader.on('line', function(line){
	matchContract(line);
})

reader.on('close', function(){
	for(var i in contracts){
		if(contracts[i].name == "TraceToProfileResult")
			output.TraceToContracts.push({
				name: contracts[i].name,
				abi: contracts[i].abi
			});
		
	}
	console.log(JSON.stringify(output));
});
