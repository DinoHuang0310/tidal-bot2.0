const accountService = require('../db/accountService');
const locationService = require('../db/locationService');

const useTidal = require('./useTidal');
const replyModel = require('./replyModels');

const useMongoDb = {

  GET_USER_BY_ID: function(userId) {
    return new Promise((resolve, reject) => {
      try {
        const userData = accountService.get(userId);
        resolve(userData);
      } catch (error) {
        reject()
      }
    })
    
  },

  ADD_LOCATION: async function({ userId, keyword, stationId }) {

    const target = stationId ? [useTidal.findByStationId(stationId)] : useTidal.filterByLocation(keyword);

    return new Promise(async (resolve, reject) => {
      if (target.length === 1) {

        const userData = await accountService.get(userId);

        if (userData) {
          // 用戶已存在
          const { locations } = userData;

          const existed = locations.some(i => i.stationId === target[0].stationId);
          if (existed) {
            reject({ type: 'text', text: '該地點已經存在' });

          } else if (locations.length >= 5) {
            reject({ type: 'text', text: '只能儲存5個地點' });

          } else {
            try {
              await locationService.add(userId, target[0]);
              resolve();
            } catch (error) {
              console.error(error);
              reject(replyModel.httpError('新增'));
            }
          }
          
        } else {
          // 沒有此用戶, 建立用戶並儲存
          try {
            await accountService.add(userId, target[0]);
            resolve();
          } catch (error) {
            console.error(error);
            reject(replyModel.httpError('新增'));
          }
        }
  
      } else if (target.length < 1) {
        // 該地點查無資料
        reject(replyModel.resultsEmpty);

      } else if (target.length < 6) {
        // 多筆查詢結果, 創建flex button
        reject(replyModel.resultsMultiple({
          title: '你484要新增:',
          action: 'add',
          dataArr: target,
        }));

      }

      // 查詢結果過多
      reject(replyModel.resultsOverLoard);

    })
  },

  DELETE_LOCATION: async function({ userId, stationId }) {
    return new Promise(async (resolve, reject) => {
      try {
        await locationService.delete(userId, stationId);
        resolve();
      } catch (error) {
        console.error(error);
        reject(replyModel.httpError('刪除'));
      }
    })
  },

};

module.exports = useMongoDb;