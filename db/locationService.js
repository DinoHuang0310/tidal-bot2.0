const { collections } = require('../config');
const connector = require('./connector');
const targetCollections = process.env.collections || collections;

module.exports = {
  add: async function(userId, { locationName, stationId }) {
    await connector.db.collection(targetCollections).updateOne(
      { 'user_id': userId },
      { $push: {'locations': { locationName, stationId }} }
    )
  },

  delete: async function(userId, stationId) {
    await connector.db.collection(targetCollections).updateOne(
      { 'user_id': userId },
      { $pull: { 'locations': { stationId }} }
    );
  },
};