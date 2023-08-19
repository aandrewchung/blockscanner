const fs = require('fs');

//FILE FUNCTIONS

// Function to load user data from the JSON database file
function loadUserDatabase() {
    const filePath = `databases/user_database_test.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to load contract addresses from the JSON database file
function loadChainDatabase(chainIndex) {
    const filePath = `databases/chain${chainIndex}_database.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to load info where there a user addy is referenced from the JSON database file
function loadUserChainDatabase() {
    const filePath = `databases/chain_user_database.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to save referenced addresses to the JSON database file
function saveToUserChainDatabase(chainIndex, blockNumber, contractAddress, userAddress) {
    const filePath = `databases/chain_user_database.json`;
    let data = loadUserChainDatabase();

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

// Export the functions
module.exports = {
    loadUserDatabase,
    loadChainDatabase,
    loadUserChainDatabase,
    saveToUserChainDatabase,
  };