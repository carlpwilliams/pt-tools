const Discord = require("discord.js");

const config = require("./config.jsonc");

const client = new Discord.Client();

client.login(config.BOT_TOKEN);
let data = { thread: 'pt tools 2.0', testmode: false }
const sendMessage = (message, channelId) => {
    client.channels.cache.get(channelId).send(message);
}

client.on('ready', () => {
    if (!data.testmode) {
        config.bots.forEach((bot) => {
            client.channels.cache.get(bot.DiscordChannelId).send(`${config.instanceName} ${data.thread} starting up.`);
        })

    }
})


client.on('message', (message) => {
    if (message.author.username !== 'jc-pt-tools') {
        onIncomingMessage.forEach((callback) => callback(message));
    }
});

let onIncomingMessage = [];


module.exports = { sendMessage, onIncomingMessage, data };