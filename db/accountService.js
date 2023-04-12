const { collections } = require('../config');
const connector = require('./connector');
const targetCollections = process.env.collections || collections;

module.exports = {
  get: async function(userId) {
    return await connector.db.collection(targetCollections).findOne({ 'user_id': userId });
  },

  add: async function(userId, { locationName, stationId }) {
    await connector.db.collection(targetCollections).insertOne({
      'user_id': userId,
      'locations': [{ locationName, stationId }]
    })
  },
};