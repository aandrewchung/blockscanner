// Import the functions from contractbytecode.js
const { readContractBytecode, findAddressInBytecode } = require('./contractbytecode.js');

// Contract address to fetch bytecode from
const contractAddress = "0x05770332D4410b6D7f07Fd497E4c00F8F7bFb74A";
const referencedAddress = "0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6";

(async () => {
  // Use the functions from contractbytecode.js
  const contractBytecode = await readContractBytecode(contractAddress);
  // console.log(contractBytecode);
  findAddressInBytecode(referencedAddress, contractBytecode);
})();
