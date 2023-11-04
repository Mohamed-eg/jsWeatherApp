import axios from "axios";

export function getWeather(lat, lon, timezone) {
  return axios
    .get(
      "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime",
      {
        //Options object: This object contains the params property. The params property is an object that holds the parameters required by the API to fetch the weather data
        params: {
          latitude: lat, //get the user latitude and store it in data.latitude >>> data.latitude=lat >>> we will get the value of lat paremeter when the function called
          longitude: lon,
          timezone, //data.timezone=timezone
        },
      } //The axios.get method takes two parameters: the URL of the API endpoint and an options object.
    )
    .then(({ data }) => {
      // console.log(data);
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    });
}

function parseCurrentWeather({ current_weather, daily }) {
  //const current_weather = data.current_weather; const daily= data.daily
  // console.log(current_weather);
  const {
    temperature: currentTemp, // const currentTemp = current_weather.temperature
    windspeed: windSpeed,
    weathercode: iconCode,
  } = current_weather;

  //The code uses square brackets [] to destructure an array. This means it extracts the first element from the array.
  //For example, in the temperature_2m_max object, there is an array of temperature values. By writing [maxTemp], we're saying that we want to extract the first value from this array and assign it to the variable maxTemp.
  // console.log(daily);
  const {
    temperature_2m_max: [maxTemp], //const maxTemp = daily.temperature_2m_max[0]
    temperature_2m_min: [minTemp],
    apparent_temperature_max: [maxFeelsLike],
    apparent_temperature_min: [minFeelsLike],
    precipitation_sum: [precip],
  } = daily;

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(maxFeelsLike),
    lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
}

function parseDailyWeather({ daily }) {
  return daily.time.map((time, index) => {
    return {
      timestamp: time * 1000,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
    };
  });
}

function parseHourlyWeather({ hourly, current_weather }) {
  return hourly.time
    .map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation[index] * 100) / 100,
      };
    })
    .filter(({ timestamp }) => timestamp >= current_weather.time * 1000);
}
