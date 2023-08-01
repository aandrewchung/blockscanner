const fs = require('fs');
const {loadUserDatabase, loadChainDatabase, loadUserChainDatabase, saveToDatabase} = require('./databasefns.js');
const { readContractBytecode } = require('./contractbytecode.js');
const { getUniqueAddressesForChainA, getUniqueAddressesForChainB } = require('./useraddress.js');

// Initialize Web3 with your Ethereum node URL
const { Web3 } = require('web3');
const providerUrl = 'https://mainnet.infura.io/v3/1c9ccac844a046aba5d3e142f29bf976';
const web3 = new Web3(providerUrl);


async function findAddressInBytecode(inputAddress, contractAddress) {
    try {
        //checking if valid address (app its deprecated soon this fn tho)
        if (!web3.utils.isAddress(inputAddress)) {
            return false;
        } else if (!web3.utils.isAddress(contractAddress)) {
            return false;
        } 

        const contractBytecode = await readContractBytecode(contractAddress);
        
        // Check if the inputAddress starts with '0x' (idk if this is needed w the isAddress from above)
        if (!inputAddress.startsWith('0x')) {
            console.error("Error: The input format for the contract is incorrect. It should start with '0x'.");
            return false;
        }

        // Manipulate the inputAddress to get rid of '0x' and convert it to lowercase
        const manipulatedInputAddress = inputAddress.slice(2).toLowerCase();
    
        // Check if the manipulatedInputAddress exists in contractBytecode
        if (contractBytecode.includes(manipulatedInputAddress)) {
            console.log("True, this string exists!");
            return true;
        } else {
            console.log("False, this string does not exist!");
            return false;
        }
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
  }

//Function to loop thru each newly created contracted for the block
async function compareUserWithChain(chainIndex, blockNumber, blockAddresses, userAddresses) {
    for (const blockAddress of blockAddresses) { //loop thru newly created contract addy's
        for (const userAddress of userAddresses) { //loop thru the user addresses
            if (await findAddressInBytecode(userAddress, blockAddress)) {
                console.log("SAVING TO DATABASE");
                saveToDatabase(chainIndex, blockNumber, blockAddress, userAddress); //save to database            
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
                compareUserWithChain(chainIndex, blockNumber, blockAddresses, userAddresses); // Compare
            }
        }
    }
}


function testCheckChains(userData) {
    checkChains(userData);
}

function test() {

    fs.writeFileSync(`chain_user_database.json`, JSON.stringify({}, null, 2));

    //loading database
    const userData = loadUserDatabase();

    testCheckChains(userData);
    
}

test();