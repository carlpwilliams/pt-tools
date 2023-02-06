module.exports.getSellsWithStrats = `
    select buys.currency_pair,
    datetime(ROUND(buys.first_bought_date / 1000), 'unixepoch') AS firstBoughtDate,
    datetime(ROUND(sells.sold_date / 1000), 'unixepoch') AS soldDate,
    (sells.SOLD_DATE - sells.FIRST_BOUGHT_DATE )/1000/60 AS trade_duration_mins,
    REPLACE(buyStratData.name,'N: ','') as buyStratName,
    '(oy0)' as buyFeederSnippet,
    --REPLACE(buyStratData1.name,'W: ','') as buyFeederSnippet,
    REPLACE(sellStratData.name,'N: ','') as sellStratName,

    buys.type as buyType,
    --sells.
    buys.total_amount as totalBuyAmount,
    buys.avg_price as buyPrice,
    buys.total_cost as totalBuyValue,

    sells.total_amount as totalSellAmount,
    sells.total_cost as totalSoldValue,
    sells.current_price as soldPrice,

    sells.profit
    from position_history_entity sells 
    inner join position_history_entity buys on buys.first_bought_date= sells.first_bought_date and buys.currency_pair = sells.currency_pair and buys.history_type='BUY_HISTORY'

    inner join position_history_entity_buy_strategies buyLink on buyLink.position_history_entity_id = buys.id
    inner join strategy_data_entity buyStratData on buyStratData.id = buyLink.buy_strategies_id and buyStratData.name like 'N:%'

    --inner join position_history_entity_buy_strategies buyLink1 on buyLink1.position_history_entity_id = buys.id
    --inner join strategy_data_entity buyStratData1 on buyStratData1.id = buyLink1.buy_strategies_id and buyStratData1.name like 'W:%'

    inner join position_history_entity_sell_strategies sellLink on sellLink.position_history_entity_id = sells.id
    inner join strategy_data_entity sellStratData on sellStratData.id = sellLink.sell_strategies_id and sellStratData.name like 'N:%'
        
    where sells.history_type='SELL_HISTORY'
    order by sells.first_bought_date desc
`;