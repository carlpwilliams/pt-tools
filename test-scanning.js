const { default: axios } = require("axios");
const discord = require("./discord");

const config = require("./config.jsonc");
const pt = require('./profitTracker');
const strats = {};

let buyExists = false;
const start = async () => {
    const bot = config.bots[0];
    buyExists = false;
    discord.data.thread = 'scanner';
    discord.data.testmode = true;
    console.info('----------------')

    const stats = await pt.getStats(bot);
    const numberOfPages = stats.basic.totalSales / 100;

    console.info('pages', numberOfPages);
    for (let i = 0; i < numberOfPages; i++) {
        console.info(`get page ${i + 1} of ${numberOfPages}`)

        const page = await pt.getSellLogPage(bot, i)
        await addBuys(page.data);
        console.info('buys in db', buysInMemory.length);
    }
}

const addBuys = (buys) => {
    return new Promise((resolve, reject) => {

        buysInMemory = [...buysInMemory, ...buys];

        resolve();
    })
}

start();