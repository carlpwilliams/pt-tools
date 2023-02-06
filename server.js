console.info('setup server')

const express = require('express')
const app = express()
const port = 3010;
const profitTracker = require("./profitTracker");
const ptData = require('./ptData');

app.get('/stats', async (req, res) => {

  const stats = await profitTracker.addStatsToSheet("784831961444253731");
  res.send(stats)

})

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`pttools listening on port ${port}`)
})