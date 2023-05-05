const authorization = process.env.authorization || require('../config').authorization;

module.exports = {
  GET_TIDAL_BY_DATE: (fromDate, toDate) => {
    return `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-A0021-001?Authorization=${authorization}&format=JSON&sort=Date&timeFrom=${fromDate}&timeTo=${toDate}`;
  },

}