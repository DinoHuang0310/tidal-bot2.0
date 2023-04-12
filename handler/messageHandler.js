const querystring = require('querystring');
const line = require('@line/bot-sdk');

const { getTidalByText, getTidalByPostback } = require('./replyMessageHandler');
const {
  GET_USER_BY_ID,
  ADD_LOCATION,
  DELETE_LOCATION,
} = require('../modules/useAccount');
const replyModel = require('../modules/replyModels');
const {
  admin,
  channelAccessToken,
  channelSecret,
} = require('../config');

const lineConfig = {
  channelAccessToken: process.env.channelAccessToken || channelAccessToken,
  channelSecret: process.env.channelSecret || channelSecret
}
const client = new line.Client(lineConfig);

const textHandler = async ({ message, replyToken, source }) => {
  const isAdmin = admin === source.userId;
  const userInputStr = message.text.replace(/\s+/g, ''); // 去空白
  const tidalRegex = /^[^a-zA-Z0-9]{2,}潮汐/; // 開頭非英文或數字接潮汐
  const split = userInputStr.split('潮汐');
  const settingRegex = /^新增/; // 新增常用地點

  let echo = replyModel.unKnow;
  
  switch (userInputStr) {
    case '說明':
      echo = replyModel.info;
      break;

    case '常用':
      await GET_USER_BY_ID(source.userId).then((result) => {
        echo = result ? replyModel.resultsMultiple({
          title: '請選擇地點:',
          action: 'search',
          dataArr: result.locations,
        }) :
        { type: 'text', text: '查無資訊' }

      }).catch((error) => {
        echo = replyModel.httpError('查詢');
        console.error(error);
      })
      break;

    case '刪除':
      await GET_USER_BY_ID(source.userId).then((result) => {
        echo = result ? replyModel.resultsMultiple({
          title: '請選擇刪除地點:',
          action: 'delete',
          dataArr: result.locations,
        }) :
        { type: 'text', text: '查無資訊' }

      }).catch((error) => {
        echo = replyModel.httpError('查詢');
        console.error(error);
      })
      break;
  
    default:
      if (settingRegex.test(userInputStr)) {
        // add
        const keyword = userInputStr.split('新增')[1];
        if (keyword === '') {
          echo = { type: 'text', text: '未輸入要新增的地點 【範例如下】:\n新增三芝' };
          break;
        }
  
        await ADD_LOCATION({ userId: source.userId, keyword }).then(() => {
          echo = replyModel.httpSuccess('新增');
  
        }).catch((errorReply) => {
          echo = errorReply;
        });
  
      } else if (tidalRegex.test(userInputStr) && split.length === 2) {
        // 問潮汐
        const searchKeyword = split[0];
        const searchTime = split[1];
        
        // console.log(split)
        echo = getTidalByText(searchKeyword, searchTime || '今天');
      }
  }

  return client.replyMessage(replyToken, echo);
}

const postbackHandler = async ({ replyToken, postback, source }) => {
  const {
    action,
    stationId,
    time,
    keyword
  } = querystring.parse(postback.data);

  let echo = replyModel.unKnow;

  switch (action) {
    case 'search':
      echo = getTidalByPostback({ stationId, time, keyword });
      break;

    case 'add':
      await ADD_LOCATION({ userId: source.userId, stationId }).then(() => {
        echo = replyModel.httpSuccess('新增');
      }).catch((errorReply) => {
        echo = errorReply;
      });
      break;

    case 'delete':
      await DELETE_LOCATION({ userId: source.userId, stationId }).then(() => {
        echo = replyModel.httpSuccess('刪除');
      }).catch((errorReply) => {
        echo = errorReply;
      });
      break;

    default:
      console.error('unknow postback action', action);
  }

  return client.replyMessage(replyToken, echo);
}

module.exports = (event) => {
  const { type, message } = event;
  
  if (type === 'message' && message.type === 'text') {
    // 處理message
    return textHandler(event);

  } else if (type === 'postback') {
    // 處理postback
    return postbackHandler(event);
    
  } else {
    // 其餘不處理
    return Promise.resolve(null);
  }
}