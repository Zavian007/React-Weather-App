import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; // Ensure your CSS is imported

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [forecastData, setForecastData] = useState([]); // State for the forecast
  const [error, setError] = useState(''); // State for error messages

  const apiKey = 'e599cae6c485f794c4002c684379ccd9'; // Store API key in a variable
  const weatherUrl = (loc) => `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=imperial&appid=${apiKey}`;
  const forecastUrl = (loc) => `https://api.openweathermap.org/data/2.5/forecast?q=${loc}&units=imperial&appid=${apiKey}`; // URL for forecast

  const searchLocation = (event) => {
    if (event.key === 'Enter' && location) {
      // Reset error state
      setError('');

      // Fetch current weather
      axios.get(weatherUrl(location))
        .then((response) => {
          setData(response.data);
          // Fetch forecast data
          return axios.get(forecastUrl(location));
        })
        .then((response) => {
          const filteredForecast = response.data.list.reduce((acc, item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!acc.some(f => f.date === date)) {
              acc.push({
                date: date,
                temp: item.main.temp,
                icon: item.weather[0].icon,
              });
            }
            return acc;
          }, []).slice(0, 5); // Get only the first 5 days
          setForecastData(filteredForecast); // Store forecast data
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setData({}); // Reset data on error
          setForecastData([]); // Reset forecast data on error
          setError('Location not found. Please try again.'); // Set error message
        });
      setLocation('');
    }
  };

  const temperature = data.main?.temp; // Use optional chaining
  const iconUrl = data.weather ? `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : null;

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={event => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder='Enter Location'
          type="text" />
      </div>
      {error && <p className="error">{error}</p>} {/* Display error message */}
      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            <h1>{temperature !== undefined ? ((temperature - 32) * 5 / 9).toFixed(0) + '°C' : 'N/A'}</h1>
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
          {iconUrl && <img src={iconUrl} alt={data.weather ? data.weather[0].description : ''} />}
        </div>

        {data.name !== undefined &&
          <div className="bottom">
            <div className="feels">
              {temperature !== undefined ? (
                <p className='bold'>{((temperature - 32) * 5 / 9).toFixed(0)}°C</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className='bold'>{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? <p className='bold'>{data.wind.speed.toFixed()} MPH</p> : null}
              <p>Wind Speed</p>
            </div>
          </div>
        }

        {/* 5-Day Forecast */}
        <div className="forecast">
          <div className="forecast-items">
            {forecastData.length > 0 && forecastData.map((item, index) => (
              <div key={index} className="forecast-item">
                <p className="day">{item.date}</p>
                <img src={`http://openweathermap.org/img/wn/${item.icon}@2x.png`} alt="Weather Icon" className="weather-icon" />
                <p className="temp">{((item.temp - 32) * 5 / 9).toFixed(0)}°C</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
