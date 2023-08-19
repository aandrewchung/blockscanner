const fs = require('fs');

// Function to load user data from the JSON database file
function loadUserDatabase() {
    const filePath = `databases/user_database_test.json`;
  
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  
    return null;
}

// Function to save referenced addresses to the JSON database file
function saveToUser(userID, chainID, addresses) {
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
}


// Example usage
const userId = "1";
const chainId = "1";
const addressesToAdd = [
    "0xtest1",
    "0xtest2",
    "0xtest3",
    "0xtest4",
    "0x10030"
];

// Add addresses to the user's chain
saveToUser(userId, chainId, addressesToAdd);

