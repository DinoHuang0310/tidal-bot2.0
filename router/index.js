const express = require('express');
const line = require('@line/bot-sdk');
const router = express.Router();

const handleEvent = require('../handler/messageHandler');
const {
  channelAccessToken,
  channelSecret,
} = require('../config');

const lineConfig = {
  channelAccessToken: process.env.channelAccessToken || channelAccessToken,
  channelSecret: process.env.channelSecret || channelSecret
}

// register a webhook handler with middleware
// about the middleware, please refer to doc
router.post('/', line.middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    return res.json(result);
  }).catch((err) => {
    console.error(err);
    res.status(500).end();
  });
});

module.exports = router;