const useTidal = {
  tidalData: [],

  setTidalData: function(newData) {
    const validTimeFormatter = (data) => {
      const { Date: date, TideRange: tidalRange, Time } = data;
      return {
        date, // 日期
        tidalRange, // 潮差
        tidalTime: Time.map((i) => {
          return { time: i.DateTime, tidalType: i.Tide }
        }),
      }
    }

    this.tidalData = newData.reduce((prevValue, currentValue) => {
      const { LocationName: locationName, LocationId: stationId, TimePeriods } = currentValue.Location;
      return prevValue.concat({
        locationName,
        stationId,
        validTime: TimePeriods.Daily.map((item) => validTimeFormatter(item))
      })
    }, []);
  },

  filterByLocation: function(location) {
    return this.tidalData.filter((item) => {
      return item.locationName.indexOf(location) !== -1;
    })
  },

  findByStationId: function(id) {
    return this.tidalData.find((item) => item.stationId === id);
  },

};

module.exports = useTidal;