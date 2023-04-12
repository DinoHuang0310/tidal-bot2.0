const { MongoClient } = require('mongodb');
const { mongoUri, dbName } = require('../config');

const client = new MongoClient(process.env.mongoUri || mongoUri);

const connector = {
  db: null,

  connect: async function() {
    try {
      const connect = await client.connect();
      this.db = connect.db(process.env.dbName || dbName);
    } catch(error) {
      console.error(error);
    }
  },

  closeConnect: async function() {
    try {
      await client.close();
    } catch (error) {
      console.error(error);
    }
  },

}

module.exports = connector;

