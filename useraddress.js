const fs = require('fs');

//FILE FUNCTIONS

// Function to load user data from the JSON database file
function loadUserDatabase() {
    const filePath = `user_database_test.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to load contract addresses from the JSON database file
function loadChainDatabase(chainIndex) {
    const filePath = `chain${chainIndex}_database.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to load info where there a user addy is referenced from the JSON database file
function loadUserChainDatabase() {
    const filePath = `chain_user_database.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to save referenced addresses to the JSON database file
function saveToDatabase(chainIndex, blockNumber, contractAddress, userAddress) {
    const filePath = `chain_user_database.json`;
    let data = loadUserChainDatabase(chainIndex);

    if (!data) {
        data = {};
    }

    const chainData = data[chainIndex] || {};
    const blockData = chainData[blockNumber] || {};

    if (Array.isArray(blockData[contractAddress])) {
        // If the contractAddress exists and is an array, push the new userAddress to the existing array
        blockData[contractAddress].push(userAddress);
    } else {
        // If the contractAddress doesn't exist or is not an array, create a new array with the userAddress
        blockData[contractAddress] = [userAddress];
    }

    chainData[blockNumber] = blockData;
    data[chainIndex] = chainData;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

///////////////////////////////////////

//UNIQUE ADDRESS FUNCTIONS
function getUniqueAddressesForChainA(data, chainIndex) {
    const startTime = Date.now();
    const uniqueAddresses = new Set();
  
    for (const userId in data) {
      const chains = data[userId];
      const chainData = chains[chainIndex];
      
      if (chainData) {
        const addresses = chainData.addresses;
        for (const address of addresses) {
          uniqueAddresses.add(address);
        }
      }
    }
  
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    // console.log(`Processing Time for Chain ${chainIndex}: ${processingTime} milliseconds`);
  
    // Convert the set to an array and return the unique addresses
    return Array.from(uniqueAddresses);
}
  
function getUniqueAddressesForChainB(data, chainIndex) {
    const startTime = Date.now();
    const uniqueAddresses = new Set();
  
    Object.values(data).forEach(chains => {
      const chainData = chains[chainIndex];
      if (chainData) {
        const addresses = chainData.addresses;
        addresses.forEach(address => uniqueAddresses.add(address));
      }
    });
  
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    // console.log(`Processing Time for Chain ${chainIndex}: ${processingTime} milliseconds`);
  
    // Convert the set to an array and return the unique addresses
    return Array.from(uniqueAddresses);
}
  
///////////////////////////////////////////

// Function to check contract... ? FOR U POOBLLOOOOOOOOOOO
function PABLOFUNCTION(blockAddress, userAddresses) {
    if (Math.random() >= 0.5) { //keeping it random bc idk how ur checking
        return true;
    } else {
        return false;
    }
    // return true;
}

//Function to loop thru each newly created contracted for the block
function compareUserWithChain(chainIndex, blockNumber, blockAddresses, userAddresses) {
    for (const blockAddress of blockAddresses) { //loop thru newly created contract addy's
        for (const userAddress of userAddresses) { //loop thru the user addresses
            if (PABLOFUNCTION(blockAddress, userAddress)) {
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

/////////////////////////////////////////

//TEST FUNCTIONS
function testUserAddressesFunctions(userData) {
    //testing 2 fns
    console.time('Function A');
    const array = getUniqueAddressesForChainA(userData, 999);
    console.timeEnd('Function A');

    console.time('Function B');
    const arrayAlt = getUniqueAddressesForChainB(userData, 999);
    console.timeEnd('Function B');

    // printing arrays
    // console.log(array);
    // console.log(arrayAlt);
}
function testCheckChains(userData) {
    checkChains(userData);
}

function test() {
    //loading database
    const userData = loadUserDatabase();

    //checking unique addy fn's
    // testUserAddressesFunctions(userData);
    testCheckChains(userData);
    
}

test();