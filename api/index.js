const authorization = process.env.authorization || require('../config').authorization;

module.exports = {
  GET_TIDAL_BY_DATE: (fromDate, toDate) => {
    return `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-A0021-001?Authorization=${authorization}&elementName=1%E6%97%A5%E6%BD%AE%E6%B1%90,%E6%BD%AE%E5%B7%AE&sort=validTime,dataTime&timeFrom=${fromDate}T00%3A00%3A00&timeTo=${toDate}T00%3A00%3A00`
  },

}