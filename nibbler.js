let activePairs = [];
const profitTracker = require('./profitTracker')
const discord = require("./discord");
const config = require("./config.json");

const startNibbling = (pair) => {
    activePairs.push(pair);
    // check pair exists
    // check if a pending order already exists
    // if pending order already exists, wait.
    // if pending order does not exist, send 85% of the pair to pening with a 2% profit target
}
const checkPairSold = (pair) => {
    // check if the pair sold in in active pairs,
    // if in active pairs, check if a pending order exists,
    // if exists, cancel pending and create pending order for 85% of the pair to pending with 2% profit target
}

const checkNibblingFromMessage = (message) => {
    const messageLower = message.content.toLowerCase();
    if (messageLower === "nibble list") {
        const bot = config.bots.find((bot) => {
            return bot.DiscordChannelId === message.channel.id;
        });

        if (bot) {
            discord.sendMessage(
                `Nibbling: ${nibbler.activePairs}`,
                message.channel.id
            );
        }
    } else {
        if (
            messageContains(messageLower, "nibble add")
        ) {
            const bot = config.bots.find((bot) => {
                return bot.DiscordChannelId === message.channel.id;
            });

            if (bot) {
                nibbler.startNibbling('BTCUSDT');
                discord.sendMessage(
                    `Started nibbling: ${nibbler.activePairs}`,
                    message.channel.id
                );
            }
        }
    }
}

messageContains = (message, item) => {
    return message.indexOf(item) != -1
}

module.exports = { activePairs, startNibbling, checkPairSold, checkNibblingFromMessage }