import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios';
import './App.css'

function App() {
  const [zipCode, setZipCode] = useState('');
  const [weather, setWeather] = useState<{
    temperature: number;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoordinatesFromZip = async (zip: string) => {
    try {
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=en&format=json`
      );
      if (response.data.results?.[0]) {
        return {
          lat: response.data.results[0].latitude,
          lon: response.data.results[0].longitude
        };
      }
      throw new Error('Location not found');
    } catch {
      throw new Error('Failed to get coordinates for zip code');
    }
  };

  const getWeather = async (zip: string) => {
    try {
      setLoading(true);
      setError(null);

      // First get coordinates from zip code
      const coords = await getCoordinatesFromZip(zip);

      // Then get weather data using coordinates
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code`
      );

      const weatherData = response.data.current;

      // Convert Celsius to Fahrenheit
      const tempF = (weatherData.temperature_2m * 9/5) + 32;

      setWeather({
        temperature: Math.round(tempF), // Round to whole number
        description: getWeatherDescription(weatherData.weather_code)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert weather codes to descriptions
  const getWeatherDescription = (code: number): string => {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      95: 'Thunderstorm'
    };
    return weatherCodes[code] || 'Unknown';
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Weather Finder</h1>
      <div className="card">
        <div className="input-group">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter zip code or city name"
            className="input"
          />
          <button
            onClick={() => getWeather(zipCode)}
            disabled={loading || !zipCode}
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {weather && (
          <div className="weather-info">
            <h2>Current Weather</h2>
            <p>Temperature: {weather.temperature}°F</p>
            <p>Conditions: {weather.description}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App
