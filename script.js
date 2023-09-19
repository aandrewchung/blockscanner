const { continuouslyGetContracts, eventEmitter } = require('./latestblock.js'); 
const { compareUserWithChain } = require('./compareuserchain.js');

let eventCounter = 0;

// Attach an event listener for the 'newContracts' event
eventEmitter.on('newContracts', ({ contracts, chainIndex, blockNumber }) => {
  eventCounter++;
  console.log(`Event emitted ${eventCounter} times. New Contracts on chain ${chainIndex + 1}:`, contracts);
  
  // Call function to compare user addresses and chains
  compareUserWithChain(chainIndex+1, blockNumber, contracts);
});

// Call the continuouslyGetContracts() function
continuouslyGetContracts();
