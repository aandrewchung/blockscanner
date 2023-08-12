const { continuouslyGetContracts, eventEmitter } = require('./latestblock'); 

let eventCounter = 0;

// Attach an event listener for the 'newContracts' event
eventEmitter.on('newContracts', (newContracts) => {
  // Call your additional functions here, passing the newContracts as needed
  // For example:
  // myAdditionalFunction(newContracts);

  

  eventCounter++;
  console.log(`Event emitted ${eventCounter} times. New contracts:`, newContracts);
});

// Call the continuouslyGetContracts() function
continuouslyGetContracts();
