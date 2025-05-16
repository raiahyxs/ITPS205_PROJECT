// src/components/RightSidebar/RightSidebar.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TripContext } from '../../contexts/TripContext'; // Adjust path as needed
import { Plus, Minus, Trash2, Cloud, Thermometer, Wind, Droplets, MapPin } from 'lucide-react';
// import { useDarkMode } from "../../ColorThemeContext"; // Assuming this context exists

// Helper to get a weather emoji/icon (customize as needed)
const getWeatherVisual = (iconCode, description) => {
    if (!iconCode && !description) return '❓';
    const desc = description ? description.toLowerCase() : "";
    // Geoapify icon codes: https://apidocs.geoapify.com/docs/weather/weather-api/#about-icons
    // This is a simplified mapping. You might want a more comprehensive one.
    if (iconCode) {
        if (iconCode.includes('clear')) return '☀️'; // clear-day, clear-night
        if (iconCode.includes('cloudy')) return '☁️'; // cloudy, partly-cloudy-day, partly-cloudy-night
        if (iconCode.includes('rain')) return '🌧️';
        if (iconCode.includes('snow')) return '❄️';
        if (iconCode.includes('thunderstorm')) return '⛈️';
        if (iconCode.includes('fog')) return '🌫️';
    }
    // Fallback based on description
    if (desc.includes("clear")) return "☀️";
    if (desc.includes("cloud")) return "☁️";
    if (desc.includes("rain")) return "🌧️";
    if (desc.includes("snow")) return "❄️";
    if (desc.includes("thunder")) return "⛈️";
    return '🌍'; // Default
};


function RightSidebar() {
  const {
    currentSelectedLocation,
    stops,
    removeStop,
    weatherForecastDays,
    setWeatherForecastDays,
    fetchWeatherForLocation,
    isLoadingWeather,
    activeRoute, // 'map' or 'schedule'
    GEOAPIFY_API_KEY // Get API key from context
  } = useContext(TripContext);

  // const { darkMode } = useDarkMode(); // Your dark mode context

  const [selectedLocationWeather, setSelectedLocationWeather] = useState(null); // Weather for the location selected on map
  const [error, setError] = useState('');

  // Debounce for weather fetching
  const debounceTimeoutRef = React.useRef(null);

  const fetchAndSetSelectedLocationWeather = useCallback(async () => {
    if (currentSelectedLocation && currentSelectedLocation.lat && currentSelectedLocation.lon) {
      setError('');
      const weatherData = await fetchWeatherForLocation(
        currentSelectedLocation.lat,
        currentSelectedLocation.lon,
        weatherForecastDays
      );
      if (weatherData) {
        setSelectedLocationWeather(weatherData);
      } else {
        setSelectedLocationWeather(null);
        setError(`Could not fetch weather for ${currentSelectedLocation.name}.`);
      }
    } else {
      setSelectedLocationWeather(null); // Clear weather if no location selected
    }
  }, [currentSelectedLocation, weatherForecastDays, fetchWeatherForLocation]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
        if (activeRoute === 'map' && GEOAPIFY_API_KEY) {
            fetchAndSetSelectedLocationWeather();
        }
    }, 500); // Debounce API call

    return () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    };
  }, [activeRoute, fetchAndSetSelectedLocationWeather, GEOAPIFY_API_KEY]);


  const handleForecastDaysChange = (increment) => {
    setWeatherForecastDays(prev => {
      const newDays = prev + increment;
      if (newDays >= 1 && newDays <= 5) { // Geoapify daily usually gives 7-8 days, but limit to 5 as per req.
        return newDays;
      }
      return prev;
    });
  };

  // Fetch weather for individual stops if not already present or when forecast days change for them
  // This is simplified; in a real app, you might fetch this when stops are added or context changes.
  // The TripContext's addStop and loadTripForEditing now handle initial weather fetching for stops.

  return (
    <div className={`w-full lg:w-[300px] xl:w-[350px] bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 p-4 rounded-xl shadow-lg flex flex-col space-y-4 text-primary-Text-LightMode dark:text-primary-Text-DarkMode overflow-y-auto h-[calc(100vh-100px)] lg:h-auto lg:max-h-[calc(100vh-4rem-env(safe-area-inset-bottom))]`}> {/* Adjust height as needed */}
      {/* Weather Prediction for Selected Location (Map View Only) */}
      {activeRoute === 'map' && (
        <div className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Weather at {currentSelectedLocation ? currentSelectedLocation.name : "Selected Location"}
          </h3>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <button
              onClick={() => handleForecastDaysChange(-1)}
              disabled={weatherForecastDays <= 1}
              className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm w-20 text-center">{weatherForecastDays} Day{weatherForecastDays > 1 ? 's' : ''} Forecast</span>
            <button
              onClick={() => handleForecastDaysChange(1)}
              disabled={weatherForecastDays >= 5}
              className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>

          {isLoadingWeather && <p className="text-sm text-center">Loading weather...</p>}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {!isLoadingWeather && selectedLocationWeather && selectedLocationWeather.length > 0 ? (
            <ul className="space-y-2 text-xs">
              {selectedLocationWeather.map((dayWeather, index) => (
                <li key={index} className="p-2 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode rounded-md shadow">
                  <p className="font-semibold">{new Date(dayWeather.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl">{getWeatherVisual(dayWeather.icon, dayWeather.description)}</span>
                    <div className="text-right">
                        <p className="flex items-center justify-end"><Thermometer size={12} className="mr-1"/> {dayWeather.temp_min?.toFixed(0)}°C - {dayWeather.temp_max?.toFixed(0)}°C</p>
                        <p className="flex items-center justify-end"><Cloud size={12} className="mr-1"/> {dayWeather.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !isLoadingWeather && !error && <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Select a location on the map to see weather.</p>
          )}
        </div>
      )}

      {/* Message for Schedule View */}
      {activeRoute === 'schedule' && (
        <div className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-center">
          <MapPin size={24} className="mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Go to the Map section to see detailed weather for a selected location.
          </p>
        </div>
      )}

      {/* Added Stops Section */}
      <div className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg flex-grow">
        <h3 className="text-lg font-semibold mb-3 text-center">Added Stops</h3>
        {stops.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {stops.map(stop => (
              <li key={stop.id} className="flex items-center justify-between p-2 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode rounded-md shadow">
                <div className="flex-grow overflow-hidden mr-2">
                  <p className="font-semibold truncate" title={stop.name}>{stop.name}</p>
                  {stop.weather && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      <span className="text-lg mr-1">{getWeatherVisual(stop.weather.icon, stop.weather.description)}</span>
                      <span>{stop.weather.temp_max?.toFixed(0)}°C</span>
                      <span className="mx-1">|</span>
                      <span className="truncate" title={stop.weather.description}>{stop.weather.description}</span>
                    </div>
                  )}
                  {!stop.weather && <p className="text-xs text-gray-500">Weather N/A</p>}
                </div>
                <button
                  onClick={() => removeStop(stop.id)}
                  title="Remove stop"
                  className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No stops added yet. Search and add locations from the map.</p>
        )}
      </div>
    </div>
  );
}

export default RightSidebar;
