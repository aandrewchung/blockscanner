//SHIT FILE SHIT FILE

function printStringInTerminal(str) {
    console.log(str);
}

function createJsonRequest(address, apiKey) {
    var urlString = "https://api.etherscan.io/api" +
        "?module=contract" +
        "&action=getabi" +
        "&address=ADDRESS" +
        "&apikey=APIKEY";

    urlString = urlString.replace("ADDRESS", address);
    urlString = urlString.replace("APIKEY", apiKey);

    return urlString;
}

var contractAddress = "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359"
var apiKey = "52WHGQESINDIXKDBJGZUVMVY3558CH1GWJ"

var jsonRequest = createJsonRequest(contractAddress, apiKey)
printStringInTerminal(jsonRequest)

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider());
var version = web3.version.api;
        
$.getJSON('https://api.etherscan.io/api?module=contract&action=getabi&address=0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359', function (data) {
    var contractABI = "";
    contractABI = JSON.parse(data.result);
    if (contractABI != ''){
        var MyContract = web3.eth.contract(contractABI);
        var myContractInstance = MyContract.at("0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359");
        var result = myContractInstance.memberId("0xfe8ad7dd2f564a877cc23feea6c0a9cc2e783715");
        console.log("result1 : " + result);            
        var result = myContractInstance.members(1);
        console.log("result2 : " + result);
    } else {
        console.log("Error" );
    }            
});

