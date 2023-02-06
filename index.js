const discord = require("./discord");
const profitTracker = require("./profitTracker");
const nibbler = require('./nibbler')
const config = require("./config.jsonc");
const ptMonitor = require('./ptMonitor')
const server = require('./server');


discord.onIncomingMessage.push((message) => {
  const messageLower = message.content.toLowerCase()

  if (message.content.indexOf("Sold") !== -1) {
    console.info("get stats");

    setTimeout(() => {
      profitTracker.getProfitByChannelId(message.channel.id);
      profitTracker.addStatsToSheet(message.channel.id)
    }, 3000);
  }

  if (messageLower === "channel") {
    discord.sendMessage(
      `Channel Id: ${message.channel.id}`,
      message.channel.id
    );
  }

  // if(message.content.toLowerCase()==='signal'){

  // }
  if (messageLower === 'overdue') {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });
    if (bot) {
      ptMonitor.checkPairs();
    }
  }
  
  if (messageLower === 'mute overdue') {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });
    if (bot) {
      ptMonitor.muteOverdue(bot);
    }
  }
  if (messageLower === 'unmute overdue') {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });
    if (bot) {
      ptMonitor.unmuteOverdue(bot);
    }
  }
  // if (message.content.toLowerCase() === 'signal') {

  // }

  if (messageLower === 'getstrats') {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });
    if (bot) {
      profitTracker.getBuys(bot);
      profitTracker.getStratsFromBuys();
    }
  }

  if (message.content.toLowerCase() === "url") {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });

    if (bot) {
      profitTracker.getBuys(bot);
      profitTracker.getStratsFromBuys();
    }
  }

  if (messageLower === "url") {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });

    if (bot) {
      discord.sendMessage(
        `Your bot URL is: ${bot.PT_API_BASE_URL}`,
        message.channel.id
      );
    }
  }

  if (messageContains(messageLower, 'nibble')) {
    const bot = config.bots.find((bot) => {
      return bot.DiscordChannelId === message.channel.id;
    });
    if (bot) { // channel belongs to a bot in this instance.
      nibbler.checkNibblingFromMessage(message);
    }
  }

  if (message.content.toLowerCase().indexOf('today') != -1) {
    if (message.channel.id === '811341945272008724') {
      discord.sendMessage(
        `Your're still a ferret!`,
        message.channel.id
      );
    }
  }
});

messageContains = (message, item) => {
  return message.indexOf(item) != -1
}
