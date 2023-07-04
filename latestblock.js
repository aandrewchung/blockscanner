require('dotenv').config(); // Load environment variables from .env file

const { Web3 } = require('web3');

// Initialize Web3 with your Ethereum node URL
const providerUrl = process.env.PROVIDER_URL;
const web3 = new Web3(providerUrl);

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
    Using the RPC endpoint only works when you deal with the latest block.
    It would be most efficient to wait X blocks (ideally depending per chain as some have reorgs like polygon and bnb)
    so for ex: always start latestBlock - 200
*/
// Function to get the contracts created in a specific block
async function getContractsInBlock(latestBlockNumber, contractAddresses) {
  try {
    // Get the latest block number if null
    const blockNumber = latestBlockNumber || 17575860;

    // Log the latest block number
    console.log('Latest Block Number:', blockNumber);

    // Get the latest block information
    const block = await web3.eth.getBlock(blockNumber);

    // Get the transactions from the block
    const transactions = block.transactions.filter(tx => tx.input !== '0x');

    // Array to store the contract addresses
    const blockContractAddresses = [];

    // Iterate through each transaction
    for (const transactionHash of transactions) {
      // Get the transaction receipt
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);
      // Check if the transaction is a contract creation transaction
      if (receipt && receipt.contractAddress) {
        console.log("YESSIR");
        // Add the contract address to the array
        blockContractAddresses.push(receipt.contractAddress);
      }
    }

    // Log the contract addresses   
    console.log('Contracts in Block', blockNumber, ':', blockContractAddresses);
    console.log('Contracts in total:', contractAddresses);
    contractAddresses.push(...blockContractAddresses);
  } catch (error) {
    console.error('Error getting contracts in block:', error);
  }
}

async function getContractCreationTransactions(latestBlockNumber) {
  try {
    // Get the latest block number if null
    const blockNumber = latestBlockNumber || (await web3.eth.getBlockNumber());

    // Convert the block number to a hex string
    const fromBlock = web3.utils.toHex(blockNumber);

    const contractCreationEventSignature = web3.utils.sha3('ContractCreated(address)');

    // Filter all logs to match the contract creation event signature
    const filterOptions = {
      fromBlock,
      toBlock: fromBlock,
      topics: [contractCreationEventSignature]
    };
    const logs = await web3.eth.getPastLogs(filterOptions);

    // Array for storing the contract creation addresses
    const contractAddresses = logs.map(log => log.address);

    // Log the contract creation transaction hashes
    if (contractAddresses.length == 0) {
      process.stdout.write(`\r${blockNumber} is empty...`);
    } else {
      process.stdout.write(`\nContract Creation Addresses for ${blockNumber}: ${contractAddresses}`);
    }
  } catch (error) {
    console.error('Error getting contract creation transactions:', error);
  }
}

// Function to continuously get contracts from the latest block
async function contiouslyGetContracts() {
  let prevBlockNumber = null;
  const contractAddresses = []
  while (true) {
    try {
      // Get the latest block number
      const latestBlockNumber = await web3.eth.getBlockNumber();

      if (prevBlockNumber != latestBlockNumber) {
        // Call the function to get the contracts in the latest block
        await getContractsInBlock(latestBlockNumber, contractAddresses);
        // await getContractCreationTransactions(latestBlockNumber);
        prevBlockNumber = latestBlockNumber;
      }

      // Delay for a specific interval (set to 10 seconds)
      // await delay(1000);

    } catch (error) {
      const latestBlockNumber = await web3.eth.getBlockNumber();

      console.error(`Error in block ${latestBlockNumber}:`, error);
    }
  }
}

contiouslyGetContracts();
