const fs = require('fs');

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
    const filePath = `chain${chainIndex + 1}_database.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to save referenced addresses to the JSON database file
function saveToDatabase(chainIndex, blockNumber, contractAddress, userAddresses) {
    const filePath = `chain_user_database.json`;
    let data = loadFromDatabase();
  
    if (!data) {
      data = {};
    }
  
    const chainData = data[chainIndex] || {};
    const blockData = chainData[blockNumber] || {};
  
    blockData[contractAddress] = userAddresses;
    chainData[blockNumber] = blockData;
    data[chainIndex] = chainData;
  
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Chain ${chainIndex}: Block ${blockNumber}, Contract ${contractAddress} saved to database.`);
  }


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
    console.log(`Processing Time for Chain ${chainIndex}: ${processingTime} milliseconds`);
  
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
    console.log(`Processing Time for Chain ${chainIndex}: ${processingTime} milliseconds`);
  
    // Convert the set to an array and return the unique addresses
    return Array.from(uniqueAddresses);
}
  
  
  

function PABLOFUNCTION(blockAddress, userAddresses) { //for  u poobloo
    return false;
}

function compareUserWithChain(blockAddresses, userAddresses, chainIndex) {
    for (const blockAddress in blockAddresses) {
        if (PABLOFUNCTION(blockAddress, userAddresses)) {
            saveToDatabase(chainIndex, _____, blockAddress, userAddress)
        }
    }
}


function checkChains(userAddresses) {
    // Set the start and end chain indices (inclusive)
    const startChainIndex = 1;
    const endChainIndex = 5;

    // Loop through the chain indices
    for (let chainIndex = startChainIndex; chainIndex <= endChainIndex; chainIndex++) {
        const chainData = loadChainDatabase(chainIndex);
        for (const blockNumber in chainData) { //loop thru each block
            const blockAddresses = database[blockNumber]; //retrieve addresses
            if (addresses.length > 0) { 
                compareUserWithChain(blockAddresses, userAddresses, chainIndex);
            }
        }
    }
}

function testUserAddressesFunctions() {
    //loading database
    const userData = loadUserDatabase();
    // console.log(userData);

    //testing 2 fns
    console.time('Function A');
    const array = getUniqueAddressesForChainA(userData, 1);
    console.timeEnd('Function A');

    console.time('Function B');
    const arrayAlt = getUniqueAddressesForChainB(userData, 1);
    console.timeEnd('Function B');

    //printing arrays
    // console.log(array);
    // console.log(arrayAlt);
}
testUserAddressesFunctions();