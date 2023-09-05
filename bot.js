// ------------------ Import Functions From Other Files -------------------

const { saveToUser, removeFromUser, addUser, removeUser } = require('./updatedatabase');
const { continuouslyGetContracts, eventEmitter } = require('./latestblock'); 
const { compareUserWithChain, logEmitter } = require('./compareuserchain'); 
const {loadUserDatabase, loadChainDatabase, loadUserChainDatabase, saveToUserChainDatabase} = require('./databasefns.js');


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


// ------------------- Bot Buttons & /start -------------------

// Command: /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Load the user database
    let userDatabase = loadUserDatabase();

    // Check if the user ID already exists in the database
    if (!userDatabase.hasOwnProperty(chatId.toString())) {
        // If it doesn't exist, add the user ID as a new user
        userDatabase[chatId.toString()] = {};

        // Write the updated user database back to the file
        fs.writeFileSync('./databases/user_database_test.json', JSON.stringify(userDatabase, null, 2));
    }

    // Create an inline keyboard with the /removeaddys and /removeuser buttons
    const startKeyboard = {
        inline_keyboard: [
            [{ text: 'Remove User', callback_data: 'removeuser' }],
            [{ text: 'Remove Address', callback_data: 'removeaddys' }],
        ],
    };

    const opts = {
        reply_markup: startKeyboard,
    };

    bot.sendMessage(chatId, 'Welcome! Your chat ID has been stored. You can click the button below to remove addresses.', opts);
});


// Listen for inline keyboard button callbacks
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userID = chatId.toString(); // Convert chat ID to string
    const data = query.data;

    // Map chain names to their corresponding IDs
    const chainMappings = {
        ethereum: 1,
        bsc: 2,
        polygon: 3
        // Add more chain names as needed
    };

    let userDatabase = loadUserDatabase();

    if (data === 'removeaddys') {
        // Create an array of chain buttons
        const chainButtons = Object.keys(chainMappings).map((chainName) => ({
            text: chainName,
            callback_data: `removechain:${chainName}`,
        }));

        // Create an inline keyboard with chain buttons
        const chainKeyboard = {
            inline_keyboard: [chainButtons],
        };

        bot.sendMessage(chatId, 'Select a chain to remove an address from:', {
            reply_markup: chainKeyboard,
        });
    } else if (data.startsWith('removechain:')) {
        const selectedChain = data.split(':')[1];
    
        // Retrieve user addresses for the selected chain
        const chainID = chainMappings[selectedChain]; // Get chain ID based on selectedChain
    
        const userAddresses = userDatabase[userID] && userDatabase[userID][chainID] ? userDatabase[userID][chainID].addresses : [];
    
        // Check if there are no addresses for the selected chain
        if (userAddresses.length === 0) {
            // Send a message indicating no recorded addresses
            bot.sendMessage(chatId, `There are no recorded addresses for ${selectedChain}.`);
        } else {
            // Create an array of address buttons
            const addressButtons = userAddresses.map((address) => ({
                text: address,
                callback_data: `remaddy:${selectedChain}:${address}`,
            }));
    
            // Create an inline keyboard with address buttons
            const addressKeyboard = {
                inline_keyboard: [addressButtons],
            };
    
            bot.sendMessage(chatId, `Select an address to remove from ${selectedChain}:`, {
                reply_markup: addressKeyboard,
            });
    
            // Handle the selected chain here
            // bot.sendMessage(chatId, `You selected chain: ${selectedChain}`);
        }
    } else if (data.startsWith('remaddy:')) {
        const selectedChain = data.split(':')[1];
        const selectedAddress = data.split(':')[2];
        const chainID = chainMappings[selectedChain]; // Get chain ID based on selectedChain
        const selectedAddresses = [];

        // Add the selected address to the array
        selectedAddresses.push(selectedAddress);

        // Call the removeAddressesFromUser function to remove the addresses
        const result = removeFromUser(chatId, chainID, selectedAddresses);

        if (result.error) {
            bot.sendMessage(chatId, result.message); // Send the error message to the user
        } else {
            bot.sendMessage(chatId, `You selected to remove ${selectedAddress} from ${selectedChain}`);
        }

        // let updatedUserDatabase = loadUserDatabase();
        // const userAddresses = updatedUserDatabase[userID] && updatedUserDatabase[userID][chainID] ? updatedUserDatabase[userID][chainID].addresses : [];
        // console.log("lol", userAddresses);
    }

    if (data === 'removeuser') {
        // Create an array of user buttons based on the keys in the userDatabase
        const userButtons = Object.keys(userDatabase).map((userID) => ({
            text: userID,
            callback_data: `removeuser:${userID}`,
        }));
    
        // Split the userButtons array into rows of 4 buttons per row
        const rows = [];
        for (let i = 0; i < userButtons.length; i += 4) {
            rows.push(userButtons.slice(i, i + 4));
        }
    
        // Create an inline keyboard with user buttons arranged in rows
        const userKeyboard = {
            inline_keyboard: rows,
        };
    
        bot.sendMessage(chatId, 'Select a user to remove:', {
            reply_markup: userKeyboard,
        });
    } else if (data.startsWith('removeuser:')) {
        // Handle the removal of the selected user
        const selectedUserID = data.split(':')[1];

        // Call the removeUser function to remove the user
        const result = removeUser(selectedUserID);

        if (result.error) {
            bot.sendMessage(chatId, result.message); // Send the error message to the admin
        } else {
            bot.sendMessage(chatId, `User ${selectedUserID} removed successfully.`);
        }
    }
    
    

    // Answer the callback query to remove the loading indicator
    bot.answerCallbackQuery(query.id);
});

// ------------------- User Command Handlers -------------------

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

  const chainID = chainMappings[chainName];

  // Call the saveToUser function to add the addresses
  const result = saveToUser(msg.from.id.toString(), chainID, addresses);

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

    const chainID = chainMappings[chainName];

    // Call the removeAddressesFromUser function to remove the addresses
    const result = removeFromUser(chatId, chainID, addresses);

    if (result.error) {
        bot.sendMessage(chatId, result.message); // Send the error message to the user
    } else {
        bot.sendMessage(chatId, `Removed ${addresses.length} addresses from chain ${chainName}`);
    }
});
  
// ------------------- Admin Command Handlers -------------------

const adminChatIDs = ['5679047475', 'admin_chat_id_2', /* ... */];

// Command: /adduser [userID]
bot.onText(/\/adduser (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    // Check if the chat ID is included in the adminChatIDs array
    if (adminChatIDs.includes(chatId.toString())) {
        const userID = match[1];

        // Call the addUser function to add the user
        const result = addUser(userID);

        if (result.error) {
            bot.sendMessage(chatId, result.message); // Send the error message to the admin
        } else {
            bot.sendMessage(chatId, `User ${userID} added successfully.`);
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
        const userID = match[1];

        // Call the removeUser function to remove the user
        const result = removeUser(userID);

        if (result.error) {
            bot.sendMessage(chatId, result.message); // Send the error message to the admin
        } else {
            bot.sendMessage(chatId, `User ${userID} removed successfully.`);
        }
    } else {
        bot.sendMessage(chatId, 'You are not authorized to use this command.');
    }
});

// ------------------- Other Command Handlers -------------------

// General message handler
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Received your message');
});


// ------------------- Continously Run Backend Fns -------------------

// Call the continuouslyGetContracts() function
// continuouslyGetContracts();
