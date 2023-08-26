const { saveToUser } = require('./updatedatabase');
const { continuouslyGetContracts, eventEmitter } = require('./latestblock'); 
const { compareUserWithChain, logEmitter } = require('./compareuserchain'); 

const fs = require('fs');

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Load environment variables from .env file
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let eventCounter = 0;


// Attach an event listener for the 'newContracts' event
eventEmitter.on('newContracts', ({ contracts, chainIndex, blockNumber }) => {
  eventCounter++;
  console.log(`Event emitted ${eventCounter} times. New Contracts on chain ${chainIndex + 1}:`, contracts);
  

  // Call function to compare user addresses and chains
  compareUserWithChain(chainIndex+1, blockNumber, contracts);
});

// Attach an event listener for the 'logMessage' event
logEmitter.on('logMessage', (logMessage) => {
    // Read the user database from the file
    let userDatabase = require('./databases/user_database_test.json');
    
    // Extract all user IDs (which are keys in the user database)
    const userIDs = Object.keys(userDatabase);
    
    // Iterate through user IDs and send the log message to each user
    userIDs.forEach(userID => {
        bot.sendMessage(userID, logMessage);
    });
});

// Command: /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // Read the user database from the file
    let userDatabase = require('./databases/user_database_test.json');
    
    // Add the chat ID as a user ID
    userDatabase[chatId.toString()] = {};
    
    // Write the updated user database back to the file
    fs.writeFileSync('./databases/user_database_test.json', JSON.stringify(userDatabase, null, 2));
    
    bot.sendMessage(chatId, 'Welcome! Your chat ID has been stored.');
});

// Command: /echo [whatever]
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

// Command: /addaddress [chain_name] [address1] [address2] ...
bot.onText(/\/addaddress (\S+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const chainName = match[1].toLowerCase(); // Convert chain name to lowercase
  const addresses = match[2].split(' ');

  // Map chain names to their corresponding IDs
  const chainMappings = {
    ethereum: 1,
    bsc: 2,
    polygon: 3
    // Add more chain names as needed
  };

  if (!chainMappings.hasOwnProperty(chainName)) {
    bot.sendMessage(chatId, 'Invalid chain name.');
    return;
  }

  const chainId = chainMappings[chainName];

  // Call the saveToUser function to add the addresses
  const result = saveToUser(msg.from.id.toString(), chainId, addresses);

  if (result.error) {
    bot.sendMessage(chatId, result.message); // Send the error message to the user
  } else {
    bot.sendMessage(chatId, `Added ${addresses.length} addresses to chain ${chainName}`);
  }
});

// General message handler
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Received your message');
});

// Call the continuouslyGetContracts() function
continuouslyGetContracts();
