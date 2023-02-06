
const sqlite3 = require('sqlite3');
const config = require('./config.jsonc');
const positionScripts = require('./sqlScripts/positions')

const sql = sqlite3.verbose();

const ptData = {
    db: null,
    connect(bot) {
        console.info(`${bot.profitTrailerInstallationDataFolder}/ptdb.db`);
        this.db = new sql.Database(`${bot.profitTrailerInstallationDataFolder}/ptdb.db`, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the PT database.');
            }
        });
    },

    disconnect() {
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    },
    getBuys(bot) {
        return new Promise((resolve, reject) => {
            this.connect(bot);

            this.db.serialize(() => {
                this.db.all(positionScripts.getSellsWithStrats, (err, data) => {
                    if (err) {
                        console.info('db error', err)
                        reject(err);
                    }
                    resolve(data)
                });
            });
            this.disconnect();
        })
    },
    getSellsWithStrats(bot) {
        return new Promise((resolve, reject) => {
            this.connect(bot);

            this.db.serialize(() => {
                this.db.all(positionScripts.getSellsWithStrats, (err, data) => {
                    if (err) {
                        console.info('db error', err)
                        reject(err);
                    }
                    resolve(data)
                });
            });
            this.disconnect();
        })
    },
    getStrats(bot) {
        return new Promise((resolve, reject) => {
            this.connect(bot);

            this.db.serialize(() => {
                this.db.all(`select position_history_entity_id as buy_id,* from strategy_data_entity data inner join position_history_entity_buy_strategies phes on phes.buy_strategies_id = data.id where formula is NULL  order by buy_id,name;`, (err, data) => {
                    if (err) {
                        console.info('db error', err)
                        reject(err);
                    }
                    resolve(data)
                });
            });
            this.disconnect();
        })
    },

    getPositions(bot) {
        return new Promise((resolve, reject) => {
            this.connect(bot);
            this.db.serialize(() => {
                this.db.all(`
                SELECT log_type,
                    Date('now'),
                    phe.first_bought_date/1000,
                    datetime(ROUND(phe.first_bought_date / 1000), 'unixepoch') AS firstBoughtDate,
                    (strftime('%s','now') - (phe.FIRST_BOUGHT_DATE/1000))/60/60 AS trade_duration_mins,

                    (strftime('%s','now') - (phe.FIRST_BOUGHT_DATE/1000))/60/60/24 AS trade_duration_days,
                    *,
                    REPLACE(buyStratData.name,'N: ','') as buyStratName
                from position_entity phe
                inner join position_history_entity_buy_strategies buyLink on buyLink.position_history_entity_id = phe.id
                inner join strategy_data_entity buyStratData on buyStratData.id = buyLink.buy_strategies_id and buyStratData.name like 'N:%'
                where log_type='DCABACKUP' or log_type='PAIRSBACKUP'
`
                    , (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(data)
                    });
            });
            this.disconnect();
        })
    }
}

module.exports = { ptData }