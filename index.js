'use strict';

const express = require('express');
const axios = require('axios');
const moment = require('moment');

const router = require('./router');
const { GET_TIDAL_BY_DATE } = require('./api');
const useTidal = require('./modules/useTidal');
const connector = require('./db/connector');

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
app.use('/', router);

(async function() {
  // 連接db
  try {
    await connector.connect();
    console.log('Connected to MongoDB server');
  } catch (error) {
    console.error(error);
  }

  // app結束時關閉連接
  process.on('SIGINT', async function() {
    try {
      await connector.closeConnect();
      console.log('Connection pool closed');
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });
})();

// getTidalData
const timeout = 25 * 60 * 1000;

const getTidalData = async () => {
  const fromDate = moment().format('YYYY-MM-DD');
  const toDate = moment().add(3, 'days').format('YYYY-MM-DD');

  try {
    const response = await axios.get(GET_TIDAL_BY_DATE(fromDate, toDate));

    const { TideForecasts } = response.data.records;
    useTidal.setTidalData(TideForecasts);
    console.log(`getTidalData OK - ${moment().format('MMMM Do YYYY, h:mm a')}`);

  } catch (error) {
    console.error('get tidal err:', error);
  }
}

getTidalData();

// listen on port
const server = app.listen(process.env.PORT || 8080, function() {
  console.log('哩公蝦毀的port ->', server.address().port);
});