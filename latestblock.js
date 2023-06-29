const { Web3 } = require('web3');

// Initialize Web3 with your Ethereum node URL
const providerUrl = 'https://mainnet.infura.io/v3/1c9ccac844a046aba5d3e142f29bf976';
const web3 = new Web3(providerUrl);

// Function to get the contracts created in a specific block
async function getContractsInBlock() {
    try {
        // Get the latest block number
        // const blockNumber = await web3.eth.getBlockNumber();
        const blockNumber = 17575860; //test block number that has a smart contract

        // Log the latest block number
        console.log('Latest Block Number:', blockNumber);

        // Get the latest block information
        const block = await web3.eth.getBlock(blockNumber);

        // Get the transactions from the block
        const { transactions } = block;

        // Array to store the contract addresses
        const contractAddresses = [];

        // Iterate through each transaction
        for (const transactionHash of transactions) {
            // Get the transaction receipt
            const receipt = await web3.eth.getTransactionReceipt(transactionHash);
            // Check if the transaction is a contract creation transaction
            if (receipt && receipt.contractAddress) {
                console.log("YESSIR")
                // console.log(receipt);
                // Add the contract address to the array
                contractAddresses.push(receipt.contractAddress);
            }
        }

        // Log the contract addresses
        console.log('Contracts in Block', blockNumber, ':', contractAddresses);
    } catch (error) {
        console.error('Error getting contracts in block:', error);
    }
}

// Call the function to get the latest block number
getContractsInBlock();
// 17575860n