// ------------------ Import Functions From Other Files -------------------

const { saveToUser, removeFromUser, addUser, removeUser } = require('./updatedatabase');
const { continuouslyGetContracts, eventEmitter } = require('./latestblock'); 
const { compareUserWithChain, logEmitter } = require('./compareuserchain'); 


// ------------------- Imports -------------------

const fs = require('fs');

//Setting up telegram bot
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Load environment variables from .env file
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });


// ------------------- Event Listeners -------------------

//from script.js fie
let eventCounter = 0;

// Attach an event listener for the 'newContracts' event
eventEmitter.on('newContracts', ({ contracts, chainIndex, blockNumber }) => {
  eventCounter++;
  console.log(`Event emitted ${eventCounter} times. New Contracts on chain ${chainIndex + 1}:`, contracts);
  

  // Call function to compare user addresses and chains
  compareUserWithChain(chainIndex+1, blockNumber, contracts);
});

// Attach an event listener for the 'logMessage' event
logEmitter.on('logMessage', ({ logMessage, chainIndex, inputAddress }) => {
    // Read the user database from the file
    let userDatabase = require('./databases/user_database_test.json');
    
    // Iterate through user IDs and send the log message to users with the specified inputAddress and chainIndex
    for (const userID in userDatabase) {
        const userData = userDatabase[userID];
        
        if (userData && userData[chainIndex] && userData[chainIndex].addresses && userData[chainIndex].addresses.includes(inputAddress)) {
            console.log("sending to this user: ",  userID);
            bot.sendMessage(userID, logMessage);
        }
    }
});


// ------------------- Command Handlers -------------------

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
    bot.sendMessage(chatId, `Invalid chain name: ${chainName}`);
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

// Command: /removeaddress [chain_name] [address1] [address2] ...
bot.onText(/\/removeaddress (\S+) (.+)/, (msg, match) => {
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

    // Call the removeAddressesFromUser function to remove the addresses
    const result = removeFromUser(msg.from.id.toString(), chainId, addresses);

    if (result.error) {
        bot.sendMessage(chatId, result.message); // Send the error message to the user
    } else {
        bot.sendMessage(chatId, `Removed ${addresses.length} addresses from chain ${chainName}`);
    }
});
  

const adminChatIDs = ['5679047475', 'admin_chat_id_2', /* ... */];

// Command: /adduser [userID]
bot.onText(/\/adduser (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    // Check if the chat ID is included in the adminChatIDs array
    if (adminChatIDs.includes(chatId.toString())) {
        const userId = match[1];

        // Call the addUser function to add the user
        const result = addUser(userId);

        if (result.error) {
            bot.sendMessage(chatId, result.message); // Send the error message to the admin
        } else {
            bot.sendMessage(chatId, `User ${userId} added successfully.`);
        }
    } else {
        bot.sendMessage(chatId, 'You are not authorized to use this command.');
    }
});

// Command: /removeuser [userID]
bot.onText(/\/removeuser (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    // Check if the chat ID is included in the adminChatIDs array
    if (adminChatIDs.includes(chatId.toString())) {
        const userId = match[1];

        // Call the removeUser function to remove the user
        const result = removeUser(userId);

        if (result.error) {
            bot.sendMessage(chatId, result.message); // Send the error message to the admin
        } else {
            bot.sendMessage(chatId, `User ${userId} removed successfully.`);
        }
    } else {
        bot.sendMessage(chatId, 'You are not authorized to use this command.');
    }
});




// General message handler
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Received your message');
});


// ------------------- Continously Run Backend Fns -------------------

// Call the continuouslyGetContracts() function
// continuouslyGetContracts();
