// Initialize Web3 with your Ethereum node URL
const { Web3 } = require('web3');
const providerUrl = 'https://mainnet.infura.io/v3/1c9ccac844a046aba5d3e142f29bf976';
const web3 = new Web3(providerUrl);

// Function to read contract bytecode
async function readContractBytecode(contractAddress) {
  try {
    // Get the contract's code from the blockchain
    const bytecode = await web3.eth.getCode(contractAddress);
    // const first10Chars = bytecode.substring(0, 10); //only printing 10 characters for now

    // Log the bytecode
    // console.log('Contract Bytecode:', first10Chars);

    return bytecode;
  } catch (error) {
    console.error('Error reading contract bytecode:', error);
  }
}

// Contract address to fetch bytecode from
// const contractAddress = '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413';
const contractAddress = "0x05770332D4410b6D7f07Fd497E4c00F8F7bFb74A"; //smart contract that was created in new block
const referencedAddress = "0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6";
// Call the function to read the contract bytecode
// readContractBytecode(contractAddress);


function findAddressInBytecode(inputAddress, contractBytecode) {
  try {
    // Check if the inputAddress starts with '0x'
    if (!inputAddress.startsWith('0x')) {
      console.error("Error: The input format for the contract is incorrect. It should start with '0x'.");
      return false;
    }

    // Manipulate the inputAddress to get rid of '0x' and convert it to lowercase
    const manipulatedInputAddress = inputAddress.slice(2).toLowerCase();

    // Check if the manipulatedInputAddress exists in contractBytecode
    if (contractBytecode.includes(manipulatedInputAddress)) {
      console.log("True, this string exists!");
      return true;
    } else {
      console.log("False, this string does not exist!");
      return false;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
}

// Export the functions
module.exports = {
  readContractBytecode,
  findAddressInBytecode,
};

// (async () => {
//   const contractBytecode = await readContractBytecode(contractAddress);
//   console.log(contractBytecode);
//   findAddressInBytecode(referencedAddress, contractBytecode);
// })();
