'use strict';

const express = require('express');
const getJSON = require('get-json');
const moment = require('moment');

const router = require('./router');
const { GET_TIDAL_BY_DATE } = require('./api');
const useTidal = require('./modules/useTidal');
const connector = require('./db/connector');

getTidalData();

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

function getTidalData() {
  const fromDate = moment().format('YYYY-MM-DD');
  const toDate = moment().add(3, 'days').format('YYYY-MM-DD');
  const target = GET_TIDAL_BY_DATE(fromDate, toDate);

  getJSON(target).then((response) => {
    try {
      const { TideForecasts } = response.records;
      useTidal.setTidalData(TideForecasts);
      console.log(`getTidalData OK - ${moment().format('MMMM Do YYYY, h:mm a')}`);
    } catch (err) {
      console.warn('set tidal err', err, response);
    }

    setTimeout(() => {
      getTidalData();
    }, timeout);

  }).catch((error) => {
    console.log(target)
    console.error('get tidal err', error);
  });
}

// listen on port
const server = app.listen(process.env.PORT || 8080, function() {
  console.log('哩公蝦毀的port ->', server.address().port);
});