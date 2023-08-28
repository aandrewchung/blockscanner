const fs = require('fs');
const { isAddress } = require('web3-validator');

// Function to load user data from the JSON database file
function loadUserDatabase() {
    const filePath = `databases/user_database_test.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

function validateInputs(userID, chainID, addresses) {
    const parsedUserID = parseInt(userID);
    const parsedChainID = parseInt(chainID);

    if (isNaN(parsedUserID) || isNaN(parsedChainID)) {
        return false; // Either userID or chainID couldn't be parsed as integers
    }

    // Validate addresses using web3
    for (const address of addresses) {
        if (!isAddress(address)) {
            console.log("Invalid addresses bud");
            return false; // Invalid address found
        }
    }

    return true; // Both userID, chainID, and addresses are valid
}

// Function to save referenced addresses to the JSON database file
function saveToUser(userID, chainID, addresses) {
    if (!validateInputs(userID, chainID, addresses)) {
        const errorMessage = "Invalid userID, chainID, or addresses.";
        console.log(errorMessage); // Log the error message to the console
        return { error: true, message: errorMessage };
    }

    const filePath = `databases/user_database_test.json`;
    let data = loadUserDatabase();

    if (!data) {
        data = {};
    }

    const userData = data[userID] || {};
    const chainData = userData[chainID] || {};

    chainData.addresses = chainData.addresses || [];

    // Prevent adding duplicates
    const uniqueAddressesToAdd = addresses.filter(address => !chainData.addresses.includes(address));
    
    chainData.addresses.push(...uniqueAddressesToAdd);
    userData[chainID] = chainData;
    data[userID] = userData;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { error: false }; // No error occurred
}

// Function to remove addresses from the JSON database file
function removeFromUser(userID, chainID, addresses) {
    if (!validateInputs(userID, chainID, addresses)) {
        const errorMessage = "Invalid userID, chainID, or addresses.";
        console.log(errorMessage); // Log the error message to the console
        return { error: true, message: errorMessage };
    }

    const filePath = `databases/user_database_test.json`;
    let data = loadUserDatabase();

    if (!data) {
        data = {};
    }

    const userData = data[userID] || {};
    const chainData = userData[chainID] || {};

    chainData.addresses = chainData.addresses || [];

    // Remove addresses from the chain's addresses array
    chainData.addresses = chainData.addresses.filter(address => !addresses.includes(address));
    
    userData[chainID] = chainData;
    data[userID] = userData;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { error: false }; // No error occurred
}



// Example usage
const userId = "1";
const chainId = "1";
const addressesToAdd = [
    "0xtest1",
    "0xtest2",
    "0xtest3",
    "0xtest4",
    "0x10030",
    "0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6"
];

// Add addresses to the user's chain
// removeFromUser(userId, chainId, addressesToAdd);

module.exports = {
    saveToUser,
    removeFromUser
};