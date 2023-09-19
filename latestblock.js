const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file
const { Web3 } = require('web3');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const {loadChainDatabase, saveToChainDB} = require('./databasefns.js'); //imports from db fns

// Array of chain configurations
const chainConfigs = [
  {
    providerUrl: process.env.CHAIN1_PROVIDER_URL, //ethermainnet
    waitBlocks: 200,
    startBlock: 17442127 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN2_PROVIDER_URL, //bsc
    waitBlocks: 200,
    startBlock: 30955431 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN3_PROVIDER_URL, //polygon
    waitBlocks: 250,
    startBlock: 47500000 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN4_PROVIDER_URL, //optimism
    waitBlocks: 200,
    startBlock: 109509999 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN5_PROVIDER_URL, //base
    waitBlocks: 200,
    startBlock: 4138502 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN6_PROVIDER_URL, //metis
    waitBlocks: 200,
    startBlock: 132324380 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN7_PROVIDER_URL, //avalanche c
    waitBlocks: 200,
    startBlock: 35376685 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN8_PROVIDER_URL, //gnosis
    waitBlocks: 200,
    startBlock: 30045837 // Specify the desired start block for the chain
  },
  {
    providerUrl: process.env.CHAIN9_PROVIDER_URL, //moonbeam
    waitBlocks: 200,
    startBlock: 4467088 // Specify the desired start block for the chain
  }

  // Add more chain configurations as needed
];

// Initialize Web3 instances for each chain
const web3Instances = chainConfigs.map(config => new Web3(config.providerUrl));

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Function to get the contracts created in a specific block for a chain
async function getContractsInBlock(chainIndex, latestBlockNumber, contractAddresses) {
  return new Promise(async (resolve, reject) => {
    try {
      const { startBlock, waitBlocks } = chainConfigs[chainIndex];

      // Skip if the block is before the start block or within the waitBlocks range
      if (Number(latestBlockNumber) < startBlock || Number(latestBlockNumber) > startBlock + waitBlocks) {
        resolve();
        return;
      }

      const startTime = Date.now();

      const block = await web3Instances[chainIndex].eth.getBlock(latestBlockNumber);

      if (!block || !block.transactions) { //check if block has transactions
        console.error(`Chain ${chainIndex + 1}: Block data for block number ${latestBlockNumber} is invalid or does not contain transactions.`);
        resolve([]);
        return;
      }

      // Get the transactions from the block
      // console.log(`Extracting from block ${latestBlockNumber}`)
      const transactions = block.transactions.filter(tx => tx.input !== '0x');
      // console.log(`Successfully extracted transactions`)

      // Array to store the contract addresses
      const blockContractAddresses = [];
      const txHashAddresses = [];

      // Iterate through each transaction
      for (const transactionHash of transactions) {
        try { //txn receipt could have errors
          // Get the transaction receipt
          const receipt = await web3Instances[chainIndex].eth.getTransactionReceipt(transactionHash);
          
          // Check if the transaction receipt is null or undefined
          if (!receipt) {
            console.log(`Transaction ${transactionHash} does not exist for block ${latestBlockNumber}. Skipping.`);
            continue; // Skip this transaction and move to the next one
          }

          // Check if the transaction is a contract creation transaction
          if (receipt && receipt.contractAddress) {
            console.log(`Chain ${chainIndex + 1}: YESSIR`);
            // Add the contract address to the array
            blockContractAddresses.push(receipt.contractAddress);
            txHashAddresses.push(transactionHash);
          }

        } catch (error) {
          console.error(`Error processing transaction ${transactionHash} on chain ${chainIndex + 1}:`, error);
          // Continue to the next transaction even if an error occurs
          continue;
        }
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Log the contract addresses and processing time for the chain
      console.log(`Chain ${chainIndex + 1}: Contracts in Block ${latestBlockNumber}:`, blockContractAddresses);
      console.log(`Chain ${chainIndex + 1}: Total Contracts:`, contractAddresses.length);
      console.log(`Chain ${chainIndex + 1}: Processing Time: ${processingTime}ms`);

      contractAddresses.push(...blockContractAddresses);

      // Save block status and processing time to JSON file
      saveToChainDB(chainIndex, latestBlockNumber, blockContractAddresses, txHashAddresses, processingTime);

      resolve(blockContractAddresses);

    } catch (error) {
      console.error(`Chain ${chainIndex + 1}: Error getting contracts in block ${latestBlockNumber}:`, error);
      resolve([]); // or reject(error) if you want to propagate the error
    }
  });
}

// Function to continuously get contracts from the latest block for each chain
async function continuouslyGetContracts() {
  const contractAddresses = [];

  while (true) {
    try {
      const promises = chainConfigs.map(async (config, i) => {
        const { providerUrl, waitBlocks, startBlock } = config;
        const web3Instance = web3Instances[i];

        // Load contracts and block status from the database
        const blockStatus = loadChainDatabase(i);
        let latestBlockNumber = await web3Instance.eth.getBlockNumber();

        // Set the latest block number to the start block if it is lower
        if (Number(latestBlockNumber) < startBlock) {
          latestBlockNumber = startBlock;
        }

        // Check if all the blocks have been processed since the start
        const start = startBlock;
        const end = Number(latestBlockNumber) - waitBlocks + 1;
        const missingBlockNumbers = [];
        for (let block = start; block <= end; block++) {
          if (!blockStatus[block]) { // Check if block is not marked as processed
            missingBlockNumbers.push(block);
          }
        }

        console.log(`Chain ${i + 1}: Missing blocks:`, missingBlockNumbers);

        // Process the missing blocks
        for (let block = start; block <= end; block++) {
          if (!blockStatus[block]) { // Check if block is not marked as processed
            // Call the function to get the contracts in the block for the chain
            // ERROR: this should be a promise as well, since blocks could be processed concurrently
            const newContracts = await getContractsInBlock(i, block, contractAddresses);
            if (!newContracts) {
              continue;
            }
            // Emit an event with the new contract addresses
            if (newContracts.length > 0) {
              
              eventEmitter.emit('newContracts', { contracts: newContracts, chainIndex: i, blockNumber: block });
            }
          }
        }
      });

      await Promise.all(promises);

      // Delay for a specific interval (set to 1 second)
      await delay(1000);

    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// continuouslyGetContracts();

// Export the eventEmitter and continuouslyGetContracts function
module.exports = {
  eventEmitter,
  continuouslyGetContracts
};