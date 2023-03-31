'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const getJSON = require('get-json');
const moment = require('moment');
const querystring = require('querystring');
const { GET_TIDAL_BY_DATE } = require('./api');
const { getTidalByText, getTidalByPostback } = require('./handler/replyMessageHandler');

const useTidal = require('./modules/useTidal');
const replyModel = require('./modules/replyModel');

const {
  admin,
  channelAccessToken,
  channelSecret,
} = require('./config');

const lineConfig = {
  channelAccessToken: process.env.channelAccessToken || channelAccessToken,
  channelSecret: process.env.channelSecret || channelSecret
}
const client = new line.Client(lineConfig);

getTidalData();

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/', line.middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    return res.json(result);
  }).catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

function handleEvent(event) {
  const { type, message, replyToken, postback } = event;
  
  if (type === 'message' && message.type === 'text') {
    // 處理message
    const userInputStr = message.text.replace(/\s+/g, ''); // 去空白
    const tidalRegex = /^[^a-zA-Z0-9]{2,}潮汐/; // 開頭非英文或數字接潮汐
    const split = userInputStr.split('潮汐');
    // const settingRegex = /^新增/; // 新增常用地點

    let echo = replyModel.unKnow;

    if (userInputStr === '說明') {
      echo = replyModel.info;

    } else if (tidalRegex.test(userInputStr) && split.length === 2) {
      // 問潮汐
      const searchKeyword = split[0];
      const searchTime = split[1];
      
      console.log(split)
      echo = getTidalByText(searchKeyword, searchTime);

    }

    return client.replyMessage(replyToken, echo);

  } else if (type === 'postback') {
    // 處理postback
    const { action, stationId, time, keyword } = querystring.parse(postback.data);

    switch (action) {
      case 'search':
        return client.replyMessage(replyToken, getTidalByPostback({ stationId, time, keyword }));

      default:
        console.error('unknow postback action', action);
        return Promise.resolve(null);
    }
    
  } else {
    // 其餘不處理
    return Promise.resolve(null);
  }
}

// getTidalData
const timeout = 25 * 60 * 1000;

function getTidalData() {
  const fromDate = moment().format('YYYY-MM-DD');
  const toDate = moment().add(3, 'days').format('YYYY-MM-DD');
  getJSON(GET_TIDAL_BY_DATE(fromDate, toDate), (error, response) => {
    try {
      useTidal.setTidalData(response.records.location);
      console.log(`getTidalData OK - ${moment().format('MMMM Do YYYY, h:mm a')}`);

    } catch (error) {
      console.error(error);
    }
    
    setTimeout(() => {
      getTidalData();
    }, timeout);
  });
}

// listen on port
const server = app.listen(process.env.PORT || 8080, function() {
  console.log("哩公蝦毀的port ->", server.address().port);
});