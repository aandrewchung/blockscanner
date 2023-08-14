const fs = require('fs');
const { isAddress } = require('web3-validator');

// Initialize Web3 with your Ethereum node URL
require('dotenv').config(); // Load environment variables from .env file
const { Web3 } = require('web3');

// Initialize Web3 with your Ethereum node URL
const providerUrl = process.env.CHAIN1_PROVIDER_URL;
const web3 = new Web3(providerUrl);

// Import functions from other files
const {loadUserDatabase, loadChainDatabase, loadUserChainDatabase, saveToUserChainDatabase} = require('./databasefns.js');
const { readContractBytecode } = require('./contractbytecode.js');
const { getUniqueAddressesForChainA, getUniqueAddressesForChainB } = require('./useraddress.js');   

async function findAddressInBytecode(inputAddress, contractAddress) {
    try {
        //checking if valid address (app its deprecated soon this fn tho)
        if (!isAddress(inputAddress)) {
            return false;
        } else if (!isAddress(contractAddress)) {
            return false;
        } 

        //Read bytecode
        const contractBytecode = await readContractBytecode(contractAddress);

        // Manipulate the inputAddress to get rid of '0x' and convert it to lowercase
        const manipulatedInputAddress = inputAddress.slice(2).toLowerCase();
    
        // Check if the manipulatedInputAddress exists in contractBytecode
        if (contractBytecode.includes(manipulatedInputAddress)) {
            console.log(`True, "${manipulatedInputAddress}" exists!`);
            return true;
        } else {
            console.log(`False, "${manipulatedInputAddress}" does not exist!`);
            return false;
        }
        
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
  }

function getTransactionHash(chainIndex, blockNumber, contractAddress) {
    const databasePath = `databases/chain${chainIndex}_database.json`;

    if (fs.existsSync(databasePath)) {
        const data = fs.readFileSync(databasePath, 'utf8');
        const database = JSON.parse(data);
        if (database[blockNumber] && database[blockNumber][contractAddress]) {
        return database[blockNumber][contractAddress];
        }
    }

    return null; // Transaction hash not found
}

async function printConsoleLog(chainIndex, blockNumber, contractAddress, inputAddress) {
    try {
        const transactionHash = getTransactionHash(chainIndex, blockNumber, contractAddress);
        const block = await web3.eth.getBlock(blockNumber);

        if (!block) {
            console.log("Block not found.");
            return;
        }

        const creationTime = new Date(Number(block.timestamp) * 1000); // Convert Unix timestamp to human-readable date
        const etherscanBaseUrl = "https://etherscan.io";

        const logMessage = `
            Contract Address: ${contractAddress}
            Input Address: ${inputAddress}
            Chain Index: ${chainIndex}
            Block Number: ${blockNumber}
            Transaction Hash: ${transactionHash}
            Creation Time: ${creationTime.toISOString()} (${creationTime.toLocaleString()})
            Transaction Link: ${etherscanBaseUrl}/tx/${transactionHash}
        `;

        console.log(logMessage);
    } catch (error) {
        console.error("Error fetching block details:", error);
    }
}

// // Example usage
// const chainIndex = 1;
// const blockNumber = "17442128";
// const contractAddress = "0x05770332d4410b6d7f07fd497e4c00f8f7bfb74a";
// const inputAddress = "0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6";
// printConsoleLog(chainIndex, blockNumber, contractAddress, inputAddress);

//Function to loop thru each newly created contracted for the block
async function compareUserWithChain(chainIndex, blockNumber, blockAddresses) {
    const userData = loadUserDatabase();
    const userAddresses = getUniqueAddressesForChainB(userData, chainIndex); // Get unique user addresses based on chain number

    for (const contractAddress of blockAddresses) { //loop thru newly created contract addy's
        for (const inputAddress of userAddresses) { //loop thru the user addresses
            if (await findAddressInBytecode(inputAddress, contractAddress)) {
                printConsoleLog(chainIndex, blockNumber, contractAddress, inputAddress);
                saveToUserChainDatabase(chainIndex, blockNumber, contractAddress, inputAddress); //save to database            
            }
        }
    }
}

module.exports = {
    compareUserWithChain
};










//////////////////////// Everything below this is usless bc i was doing smth diff////////////////

//Function to loop thru each newly created contracted for the block
async function compareUserWithChainTRASH(chainIndex, blockNumber, blockAddresses, userAddresses) {
    for (const blockAddress of blockAddresses) { //loop thru newly created contract addy's
        for (const userAddress of userAddresses) { //loop thru the user addresses
            if (await findAddressInBytecode(userAddress, blockAddress)) {
                console.log("SAVING TO DATABASE");
                saveToUserChainDatabase(chainIndex, blockNumber, blockAddress, userAddress); //save to database            
            }
        }
    }
}
//Function to go thru each chain database
function checkChains(userData) {
    // Set the start and end chain indices (inclusive of both start and end)
    const startChainIndex = 999;
    const endChainIndex = 999;
    // Loop through the chain indices
    for (let chainIndex = startChainIndex; chainIndex <= endChainIndex; chainIndex++) {
        const chainData = loadChainDatabase(chainIndex); // Load chain data
        const userAddresses = getUniqueAddressesForChainB(userData, chainIndex); // Get unique user addresses based on chain number
        for (const blockNumber in chainData) { // Loop through each block of the chain
            const blockAddresses = chainData[blockNumber]; // Retrieve newly created contract addresses from each block
            if (blockAddresses.length > 0) {  // Check if addresses even exist in the block
                console.log(`Checking Chain ${chainIndex}, Block ${blockNumber} with Block Addresses: ${blockAddresses}`);
                compareUserWithChainTRASH(chainIndex, blockNumber, blockAddresses, userAddresses); // Compare
            }
        }
    }
}

function testCheckChains(userData) {
    checkChains(userData);
}

function test() {
    fs.writeFileSync(`databases/chain_user_database.json`, JSON.stringify({}, null, 2));

    //loading database
    const userData = loadUserDatabase();

    testCheckChains(userData);
    
}

// test();