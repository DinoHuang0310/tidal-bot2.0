const useTidal = {
  tidalData: [],

  setTidalData: function(newData) {
    const validTimeFormatter = (data) => {
      const { startTime, weatherElement } = data;
      return {
        date: startTime, // 日期
        tidalRange: weatherElement[0].elementValue, // 潮差
        tidalTime: weatherElement[1].time.map((i) => {
          return { time: i.dataTime, tidalType: i.parameter[0].parameterValue }
        }),
      }
    }

    this.tidalData = newData.reduce((prevValue, currentValue) => {
      const { locationName, stationId, validTime } = currentValue;
      return prevValue.concat({
        locationName,
        stationId,
        validTime: validTime.map((item) => validTimeFormatter(item))
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