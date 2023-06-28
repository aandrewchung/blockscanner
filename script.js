// Initialize Web3 with your Ethereum node URL
const { Web3 } = require('web3');
const providerUrl = 'https://mainnet.infura.io/v3/1c9ccac844a046aba5d3e142f29bf976';
const web3 = new Web3(providerUrl);

// Function to read contract bytecode
async function readContractBytecode(contractAddress) {
  try {
    // Get the contract's code from the blockchain
    const bytecode = await web3.eth.getCode(contractAddress);
    const first10Chars = bytecode.substring(0, 10); //only printing 10 characters for now

    // Log the bytecode
    console.log('Contract Bytecode:', first10Chars);
  } catch (error) {
    console.error('Error reading contract bytecode:', error);
  }
}

// Contract address to fetch bytecode from
const contractAddress = '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413';

// Call the function to read the contract bytecode
readContractBytecode(contractAddress);
