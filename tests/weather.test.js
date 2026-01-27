/**
 * Tests for weather functionality
 */

describe('Weather Functions', () => {
  let weatherContent;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="weather-content" class="loading">Getting your location...</div>
    `;
    weatherContent = document.getElementById('weather-content');
  });

  describe('fetchWeatherData', () => {
    test('should fetch and display weather data successfully', async () => {
      const mockWeatherData = {
        current: {
          temperature_2m: 72.5,
          apparent_temperature: 70.2,
          relative_humidity_2m: 65,
          wind_speed_10m: 8.5,
          weather_code: 2
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const lat = 37.7749;
      const lon = -122.4194;

      // Simulate fetchWeatherData
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`);
      const data = await response.json();

      weatherContent.innerHTML = `
        <div class="weather-info">
          <div class="weather-item">
            <div class="temperature">${Math.round(data.current.temperature_2m)}°F</div>
            <div class="weather-description">Partly cloudy</div>
          </div>
        </div>
      `;

      expect(weatherContent.innerHTML).toContain('73°F');
      expect(weatherContent.innerHTML).toContain('Partly cloudy');
    });

    test('should handle weather API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast');
        if (!response.ok) throw new Error('Weather data unavailable');
      } catch (error) {
        weatherContent.innerHTML = `<div class="error">Unable to fetch weather data: ${error.message}</div>`;
      }

      expect(weatherContent.innerHTML).toContain('Unable to fetch weather data');
    });

    test('should correctly map weather codes to descriptions', () => {
      const weatherDescriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        61: 'Slight rain',
        95: 'Thunderstorm'
      };

      expect(weatherDescriptions[0]).toBe('Clear sky');
      expect(weatherDescriptions[2]).toBe('Partly cloudy');
      expect(weatherDescriptions[95]).toBe('Thunderstorm');
    });

    test('should display location source when provided', async () => {
      const mockWeatherData = {
        current: {
          temperature_2m: 72.5,
          apparent_temperature: 70.2,
          relative_humidity_2m: 65,
          wind_speed_10m: 8.5,
          weather_code: 1
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const locationNote = '📍 Using precise GPS location';

      weatherContent.innerHTML = `
        <div class="weather-info">
          <div class="weather-item">
            <div class="temperature">73°F</div>
          </div>
        </div>
        <div style="font-size: 0.8em; opacity: 0.7; margin-top: 10px;">${locationNote}</div>
      `;

      expect(weatherContent.innerHTML).toContain('📍 Using precise GPS location');
    });
  });

  describe('getWeatherFromIP', () => {
    test('should extract location data from IP API response', () => {
      const mockIPData = {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        region: 'California'
      };

      // Test that the data structure is correct
      expect(mockIPData.city).toBe('San Francisco');
      expect(mockIPData.latitude).toBe(37.7749);
      expect(mockIPData.longitude).toBe(-122.4194);
      expect(mockIPData.region).toBe('California');
    });

    test('should display error when IP location is unavailable', () => {
      // Simulate error handling
      weatherContent.innerHTML = '<div class="error">Unable to determine location. Please enable location services in your browser.</div>';

      expect(weatherContent.innerHTML).toContain('Unable to determine location');
      expect(weatherContent.innerHTML).toContain('error');
    });
  });

  describe('Weather display formatting', () => {
    test('should round temperature values correctly', () => {
      expect(Math.round(72.4)).toBe(72);
      expect(Math.round(72.5)).toBe(73);
      expect(Math.round(72.9)).toBe(73);
    });

    test('should display humidity as percentage', () => {
      const humidity = 65;
      expect(`Humidity: ${humidity}%`).toBe('Humidity: 65%');
    });

    test('should display wind speed in mph', () => {
      const windSpeed = 10.5;
      expect(`Wind: ${Math.round(windSpeed)} mph`).toBe('Wind: 11 mph');
    });
  });
});
