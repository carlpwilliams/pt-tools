const { default: axios } = require("axios");
const discord = require("./discord");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const config = require("./config.jsonc");
const { ptData } = require("./ptData");


let buysInMemory = [];
let sellsInMemory = [];

const getStats = async (bot) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${bot.PT_API_BASE_URL}/api/v2/data/stats?token=${bot.PT_API_TOKEN}`)
      .then((res) => {
        resolve(res.data);
      });
  });
};

const getProfitByChannelId = (channelId) => {
  const bot = config.bots.find((bot) => {
    return bot.DiscordChannelId === channelId;
  });
  if (!bot) {
    discord.sendMessage("Bot not found for this channel", channelId);
  } else {
    getProfit(bot);
  }
};

const getProfit = async (bot) => {
  console.info("check profit");
  const stats = await getStats(bot);
  const sheet = await getSheet(bot);
  await stats.extra.dailyStats.forEach(async (dayStat) => {
    await saveStat(dayStat, sheet, bot);
  });

  await sheet.saveUpdatedCells();
};



const addStatsToSheet = async (channelId) => {
  const bot = config.bots.find((bot) => {
    return bot.DiscordChannelId === channelId;
  });
  console.info('processing sheet');
  const buys = await ptData.getBuys(bot);

  const strats = await ptData.getStrats(bot);
  let ret = "";
  console.info(strats[0])
  for (let buy of buys) {
    // const relevantStrats = strats.filter(strat => strat.buy_id == buy.id)
    // for (let straItem of ["N", "M", "W"]) {
    //   let nStrat = relevantStrats.find(strat => strat.name.indexOf(`${straItem.toUpperCase()}:`) == 0);
    //   buy[`strat_${straItem}`] = nStrat?.name.replace(`${straItem.toUpperCase()}: `, '');
    //   // buy[`strat_${straItem}_value`] = nStrat?.entry_value;
    // }

    // console.info(relevantStrats)
    let row = Object.keys(buy).map((col) => buy[col]).join(',');

    ret = ret + row + "\n";
  }

  const headerRow = Object.keys(buys[0]).map((col) => col).join(',') + "\n"
  // rows[1].delete();
  // console.info(rows)
  // rows[1].delete();
  // rows[1][rows[1].headerValues[1]] = 'test1';
  // console.info(rows[1]);
  // await sheet.saveUpdatedCells();
  // sheet.update([["test","test"]])
  // let row = 1;
  // const sheet1 = sheets.getR
  // for (let buy of buys) {
  //   for (let col of Object.keys(colPropMap)) {
  //     (await sheet.getCell(row, col)).value = buy[colPropMap[col]];

  //   }
  //   if (row % 1000 == 0) {
  //     console.info(`Save rows ${row} to ${row + 1000} of ${buys.length}`)
  //     await sheet.saveUpdatedCells();
  //   }
  //   row = row + 1;
  // }
  console.info('done')
  return headerRow + ret;
}

const getBuyLogPage = async (bot, page, perpage) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios
        .get(`${bot.PT_API_BASE_URL}/api/v2/data/buys?hashcode=0&page=${page}&perPage=${perpage}&sort=NONE&sortDirection=DESCENDING&token=${bot.PT_API_TOKEN}`)
        .then((res) => {
          resolve(res.data);
        });
    }, 100)
  });
}

const getSellLogPage = async (bot, page, perpage) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios
        .get(`${bot.PT_API_BASE_URL}/api/v2/data/sell?hashcode=0&page=${page}&perPage=${perpage}&sort=NONE&sortDirection=DESCENDING&token=${bot.PT_API_TOKEN}`)
        .then((res) => {
          resolve(res.data);
        });
    }, 100)
  });
}



const getBuys = async (bot) => {
  const perpage = 25;
  buysInMemory = [];
  const stats = await getStats(bot);
  const numberOfPages = Math.round(stats.basic.totalSales / perpage);
  discord.sendMessage(`Getting ${numberOfPages} page(s) of buys to generate stats. Wish me luck!`, bot.DiscordChannelId);
  for (let i = 0; i < numberOfPages; i++) {
    console.info(`get page ${i + 1} of ${numberOfPages}`)

    const page = await getBuyLogPage(bot, i, perpage)

    buysInMemory = [...buysInMemory, ...page.data];
    console.info('buys in db', buysInMemory.length);
  }
}

const getSells = async (bot) => {
  const perpage = 25;
  sellsInMemory = [];
  const stats = await getStats(bot);
  const numberOfPages = Math.round(stats.basic.totalSales / perpage);
  discord.sendMessage(`Getting ${numberOfPages} page(s) of sells to generate stats. Wish me luck!`, bot.DiscordChannelId);
  for (let i = 0; i < numberOfPages; i++) {
    console.info(`get page ${i + 1} of ${numberOfPages}`)

    const page = await getSellLogPage(bot, i, perpage)

    sellsInMemory = [...sellsInMemory, ...page.data];
    console.info('buys in db', sellsInMemory.length);
  }
  getStratsFromSells();
}


const getStratsFromBuys = async () => {
  const strats = {};

  for (let i = 0; i < buysInMemory.length; i++) {
    const buy = buysInMemory[i];
    const buyStratName = buy.buyStrategiesData.data.find((strat) => (strat.name.indexOf('N:') !== -1));
    if (buyStratName) {
      const theName = buyStratName.name.split(' ')[1];
      if (strats[theName]) { strats[theName]++; } else {
        strats[theName] = 1;
      }
    }
  }
  let message = `Got your strategy stats! \n \n Of the last ${buysInMemory.length} buys \n`;
  Object.keys(strats).sort((a, b) => (strats[b] - strats[a])).forEach((key) => { message += `${key}:${strats[key]}\n` });
  discord.sendMessage(message, bot.DiscordChannelId);
}

const getStratsFromSells = async () => { }

const getSheet = async (bot) => {
  const creds = require("./googleCreds.json"); // the file saved above
  const doc = new GoogleSpreadsheet(bot.GOOGLE_SPREADSHEET_ID);
  await doc.useServiceAccountAuth(creds);
  const ret = await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsByTitle[bot.SheetName];
  await sheet.loadCells({ startRowIndex: 0 });
  return Promise.resolve(sheet);
};

const setCell = async (sheet, row, col, value, isToday, buys, sells) => {
  const cell = await sheet.getCell(row, col);
  const projected = await sheet.getCell(row, col + 5);
  const totalBuys = await sheet.getCell(row, col + 1);
  const totalSales = await sheet.getCell(row, col + 2);

  cell.value = value;

  totalBuys.value = buys;
  totalSales.value = sells;

  let foregroundColor = {};
  if (value >= 0 && value < projected.value)
    foregroundColor = { red: 0, green: 0, blue: 0 };
  if (value > projected.value)
    foregroundColor = { red: 0.1, green: 0.8, blue: 0.03 };
  if (value < 0) foregroundColor = { red: 1, green: 1.3, blue: 0.3 };

  cell.textFormat = {
    bold: !isToday,
    italic: isToday,
    foregroundColor,
  };

  cell.font;
  await sheet.saveUpdatedCells();
  return Promise.resolve(sheet);
};

const saveStat = async (dayStat, sheet, bot) => {
  const firstDateCell = await sheet.getCell(2, 0);

  const firstDate = logSheetDateString(firstDateCell.value);

  const statDate = parseDate(dayStat.date);

  const days = datediff(firstDate, statDate);

  const isToday = statDate.toDateString() === new Date().toDateString();

  if (isToday) {
    discord.sendMessage(
      `Today - Profit: **$${Math.round(dayStat.totalProfitCurrency * 100) / 100
      }** (${Math.round(dayStat.avgGrowth * 100) / 100}%). Sales: ${dayStat.totalSales
      }`,
      bot.DiscordChannelId
    );
  }

  if (days >= 0) {
    sheet = await setCell(
      sheet,
      days + 2,
      2,
      dayStat.totalProfitCurrency,
      isToday,
      dayStat.totalBuys,
      dayStat.totalSales
    );
  }
  return Promise.resolve();
};

function datediff(first, second) {
  // Take the difference between the dates and divide by milliseconds per day.
  // Round to nearest whole number to deal with DST.
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function parseDate(str) {
  var mdy = str.split("-");
  return new Date(mdy[2], mdy[1] - 1, mdy[0]);
}

function logSheetDateString(GS_date_num, timezone, format) {
  var GS_earliest_date = new Date(1899, 11, 30),
    //GS_earliest_date gives negative time since it is before 1/1/1970
    GS_date_in_ms = GS_date_num * 24 * 60 * 60 * 1000;
  return new Date(GS_date_in_ms + GS_earliest_date.getTime());
}

module.exports = { addStatsToSheet, getProfit, getProfitByChannelId, getSellLogPage: getBuyLogPage, getStats, getBuys, getStratsFromBuys, getStratsFromSells };
