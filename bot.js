const TelegramBot = require('node-telegram-bot-api');
const { saveToUser } = require('./updatedatabase');

const token = '6206698407:AAEopZeqzniqiNQJmu-fQmjM7gMKTYVWos8';
const bot = new TelegramBot(token, { polling: true });

// Command: /echo [whatever]
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

// Command: /add [userid]
bot.onText(/\/add (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];
    bot.sendMessage(chatId, `Adding user with ID ${userId}`);
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

// Command: /commandtest
bot.onText(/\/commandtest/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'The command was: /commandtest');
});

// General message handler
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Received your message');
});
