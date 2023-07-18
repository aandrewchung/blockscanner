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

function getAllUniqueAddresses(data) {
    const startTime = Date.now();

    const uniqueAddresses = new Set();
  
    // Iterate over each user in the database
    for (const userId in data) {
      const chains = data[userId];
  
      // Iterate over each chain for the user
      for (const chainId in chains) {
        const addresses = chains[chainId].addresses;
  
        // Add addresses to the set
        for (const address of addresses) {
          uniqueAddresses.add(address);
        }
      }
    }
  
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log(`Processing Time: ${processingTime} milliseconds`);

    // Convert the set to an array and return the unique addresses
    return Array.from(uniqueAddresses);
  }

function getAllUniqueAddressesAlt(data) {
    const startTime = Date.now();

    const uniqueAddresses = new Set();

    // Extract all addresses using array manipulation functions
    const addresses = Object.values(data)
        .flatMap(chains => Object.values(chains))
        .flatMap(chain => chain.addresses);

    // Add addresses to the set
    for (const address of addresses) {
        uniqueAddresses.add(address);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log(`Processing Time for Alt: ${processingTime} milliseconds`);

    // Convert the set to an array and return the unique addresses
    return Array.from(uniqueAddresses);
}



//loading database
const userData = loadUserDatabase();
console.log(userData);

//testing 2 fns
console.time('Function A');
const array = getAllUniqueAddresses(data);
console.timeEnd('Function A');
console.time('Function B');
const arrayAlt = getAllUniqueAddressesAlt(data);
console.timeEnd('Function B');

//printing arrays
// console.log(array);
// console.log(arrayAlt);

  