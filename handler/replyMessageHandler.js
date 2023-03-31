const useTidal = require('../modules/useTidal');
const replyModel = require('../modules/replyModel');

// location = user填入的地點
// time = 今天、明天、後天或空字串

const replyMessage = {

  getTidalByText: (location, time = '今天') => {
    if (['今天', '明天', '後天'].some(i => i === time)) {
      // 符合潮汐規則, 帶入查詢
      const target = useTidal.filterByLocation(location);

      if (target.length === 1) {
        return [
          replyModel.resultsSingle(target[0], time),
          replyModel.locationWeather(location)
        ]

      } else if (target.length < 1) {
        // 該地點查無資料
        return replyModel.resultsEmpty;

      } else if (target.length < 6) {
        // 多筆查詢結果, 創建flex button
        return replyModel.resultsMultiple({
          dataArr: target,
          location,
          time
        });

      }

      // 查詢結果過多
      return replyModel.resultsOverLoard;
      
    }

    return replyModel.unKnowTime;
  },

  getTidalByPostback: (options) => {
    const {
      stationId, // 地點id
      time, // 時間
      keyword // 原本搜尋的關鍵字
    } = options;

    const target = useTidal.findByStationId(stationId);

    return [
      replyModel.resultsSingle(target, time),
      replyModel.locationWeather(keyword)
    ]
  },

}

module.exports = replyMessage;