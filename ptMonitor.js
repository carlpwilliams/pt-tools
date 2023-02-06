const { ptData } = require("./ptData");
const discord = require('./discord');
const notified = {}
let message = "";
let maxTradeDuration = 30;

const ptMonitor = {
    mutedDate: {},
    async checkPairs(bot, ignoreNotify = false) {
        if (ignoreNotify)
            notified = {};
        const config = require("./config.jsonc");
        for (let bot of config.bots) {
            const muted = new Date() > this.mutedDate[bot.BotName]??new Date();
            message = '';
            const currentPairs = await ptData.getPositions(bot);
            const getSellsWithStrats = await ptData.getSellsWithStrats(bot);
            console.info('monitor', currentPairs.length)
            await currentPairs.forEach((pair) => {
                const lastNotified = notified[pair.currency_pair];
                let notificationElapsed = true;
                if (lastNotified) {
                    notificationElapsed = false;
                    const dateNow = new Date();
                    const dateDiff = (dateNow - lastNotified) / 1000 / 60;
                    // console.info(dateDiff);
                    if (dateDiff > 24 * 60) {
                        notificationElapsed = true
                    }
                }

                if (pair.trade_duration_mins > maxTradeDuration && notificationElapsed) {
                    notified[pair.currency_pair] = new Date();
                    console.info(`Pair ${pair.currency_pair} over average trade duration.`);
                    message = message + `Pair ${pair.currency_pair} over average trade duration by ${pair.trade_duration_mins - maxTradeDuration} mins.\n`, bot.DiscordChannelId
                }
            });

            if (message !== '' && !muted) {
                message = `Pairs over 30 mins trade duration \n\`${message}\` `
                discord.sendMessage(message, bot.DiscordChannelId)
                message = '';
            }
        }

        // console.info(config)

        //const currentPairs = await ptData.getPositions();
    },
    init() {
        this.monitor = setInterval(ptMonitor.checkPairs, (300000))
    },
    muteOverdue(bot) {
        this.mutedDate[bot.BotName] = new Date();
        this.mutedDate[bot.BotName].setDate(this.mutedDate[bot.BotName].getDate() + 1)
        console.info('Overdues muted until ' + this.mutedDate[bot.BotName]);
    },
    unmuteOverdue(bot) {
        this.mutedDate[bot.BotName] = new Date();
        this.mutedDate[bot.BotName].setDate(this.mutedDate[bot.BotName].getDate())
        console.info('Overdues unmuted');
        discord.sendMessage(`Unmuted overdues for ${bot.BotName}`, bot.DiscordChannelId);
    },
    monitor: undefined
}
ptMonitor.init();
module.exports = { ...ptMonitor }