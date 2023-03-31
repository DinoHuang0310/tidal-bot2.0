const moment = require('moment');

const replyModel = {
  info: {
    type: 'text',
    text: '【查詢台灣各地潮汐】\n\n查詢格式為:\n【地點】+潮汐+【今天/明天/後天】\n(時間不填則搜尋今天)\n\n【範例如下】:\n三芝潮汐\n石門潮汐明天'
  },

  unKnow: [
    { type: 'text', text: '公蝦咪挖溝 聽某喇' },
    { type: 'text', text: '請輸入: 說明' }
  ],

  unKnowTime: {
    type: 'text',
    text: '麥來亂小~~時間只能寫今天、明天或後天'
  },

  resultsEmpty: {
    type: 'text',
    text: '你的地點查無資料哦哦哦~~~~'
  },

  resultsOverLoard: {
    type: 'text',
    text: '你的地點查詢結果過多~~ 下精準一點 董?'
  },

  resultsSingle: (data, time) => {
    const dateOffset = (() => {
      switch (time) {
        case '':
        case '今天':
          return 0;
        case '明天':
          return 1;
        case '後天':
          return 2;
      }
    })();
    const targetDate = moment().add(dateOffset, 'days');
    const validTime = data.validTime[dateOffset];

    const weekday = () => {
      switch (targetDate.weekday()) {
        case 0: return '日';
        case 1: return '一';
        case 2: return '二';
        case 3: return '三';
        case 4: return '四';
        case 5: return '五';
        case 6: return '六';
      }
    }

    const echoTidal = (tidalArry) => {
      return tidalArry.reduce((prev, current) => {
        return prev += `\n  ${current.tidalType}: ${current.time}`;
      }, '');
    }

    return {
      type: 'text',
      text: `${data.locationName}: \n  日期: ${targetDate.format('YYYY/MM/DD')} (${weekday()}) \n  潮差: ${validTime.tidalRange}潮  ${echoTidal(validTime.tidalTime)}`
    }
  },

  resultsMultiple: function(options) {
    return {
      type: 'flex',
      altText: '你484要查:',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [{ type: 'text', text: '你484要查:' }]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: this.createOption({ action: 'search', ...options })
        },
        styles: {
          footer: { separator: true }
        }
      }
    }
  },

  createOption: ({ action, dataArr, location = '', time = '' }) => {
    if (!action) {
      console.error('createOption action is required');
      return [];
    }
    dataString = (element) => {
      switch (action) {
        // case 'addFavorite':
        //   return `action=add&user=${user}&location=${element.locationName}`;
        case 'search':
          // return `action=search&message=${element.locationName || element}/${time ? time : '今天'}/${originalLocation || ''}`;
          return `action=search&stationId=${element.stationId}&time=${time}&keyword${location}`;
        // case 'deleteFavorite':
        //   return `action=delete&user=${user}&location=${element}`;
      }
    }
    
    return dataArr.map((item) => {
      return {
        type: 'button',
        action: {
          type: "postback",
          label: item.locationName,
          data: dataString(item)
        }
      }
    })
  },

  locationWeather: (location) => {
    return {
      type: 'text',
      text: `你可能需要來點氣象?\nhttps://www.google.com/search?q=${location}氣象&rlz=1C1CHBD_zh-twTW888TW888&oq=${location}`
    }
  },

};

module.exports = replyModel;