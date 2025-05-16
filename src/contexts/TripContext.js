// src/contexts/TripContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const TripContext = createContext();

// Caches
const weatherCache = new Map(); // Cache for weather data: key = `${lat},${lon},${days}`, value = weatherData
const geocodeCache = new Map(); // Cache for geocoding: key = locationName, value = {lat, lon}

export const TripProvider = ({ children }) => {
  const [currentSelectedLocation, setCurrentSelectedLocation] = useState(null); // { name, lat, lon }
  const [stops, setStops] = useState([]); // Array of { id, name, lat, lon, weather }
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState(new Date());
  const [savedTrips, setSavedTrips] = useState(() => {
    const localSavedTrips = localStorage.getItem('savedTrips');
    return localSavedTrips ? JSON.parse(localSavedTrips) : [];
  });
  const [weatherForecastDays, setWeatherForecastDays] = useState(3); // Default 3 days
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activeRoute, setActiveRoute] = useState('map'); // 'map' or 'schedule'
  const [isDirty, setIsDirty] = useState(false); // Tracks if there are unsaved changes

  const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;

  // Effect to mark as dirty (simplified, SchedulePage has more detailed logic for edit)
  useEffect(() => {
    if (activeRoute === 'schedule') { // Only apply this basic dirty check if on schedule page
        if (tripName !== '' || stops.length > 0 || (tripDate && tripDate.toDateString() !== new Date().toDateString())) {
            // This is a general check. Specific components might manage their dirty state more granularly.
            // setIsDirty(true); // SchedulePage now has more refined dirty logic
        }
    }
  }, [stops, tripName, tripDate, activeRoute]);


  useEffect(() => {
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    // setIsDirty(false); // Reset dirty flag after saving globally might be too broad.
                       // Components should manage setIsDirty(false) after their specific save actions.
  }, [savedTrips]);

  const fetchWeatherForLocation = useCallback(async (lat, lon, days = weatherForecastDays) => {
    if (!lat || !lon || !GEOAPIFY_API_KEY) return null;
    const cacheKey = `${lat},${lon},${days}`;
    if (weatherCache.has(cacheKey)) {
      return weatherCache.get(cacheKey);
    }
    setIsLoadingWeather(true);
    try {
      const url = `https://api.geoapify.com/v1/weather?lat=${lat}&lon=${lon}&type=daily&units=metric&apiKey=${GEOAPIFY_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Failed to fetch weather from Geoapify:", response.status);
        setIsLoadingWeather(false);
        return null;
      }
      const data = await response.json();
      const forecastData = data.properties.days.slice(0, days).map(day => ({
        date: day.date,
        temp_max: day.temp_max,
        temp_min: day.temp_min,
        icon: day.icon,
        description: day.weather,
        precipitation_prob: day.precipitation.probability,
        wind_speed: day.wind.speed_max,
      }));
      weatherCache.set(cacheKey, forecastData);
      setIsLoadingWeather(false);
      return forecastData;
    } catch (error) {
      console.error("Error fetching weather from Geoapify:", error);
      setIsLoadingWeather(false);
      return null;
    }
  }, [GEOAPIFY_API_KEY, weatherForecastDays]); // Added weatherForecastDays dependency


  const addStop = async (location) => { // location: { name, lat, lon }
    const newStopId = uuidv4();
    // Fetch weather for the stop (e.g., for the current day or selected forecast day 1)
    const weather = await fetchWeatherForLocation(location.lat, location.lon, 1); // Fetch 1 day weather
    const newStop = { ...location, id: newStopId, weather: weather ? weather[0] : null };
    setStops(prevStops => [...prevStops, newStop]);
    setIsDirty(true);
  };

  const removeStop = (stopId) => {
    setStops(prevStops => prevStops.filter(stop => stop.id !== stopId));
    setIsDirty(true);
  };

  const updateStopWeather = async (stopId, days) => {
    const stopToUpdate = stops.find(s => s.id === stopId);
    if (stopToUpdate) {
        const weather = await fetchWeatherForLocation(stopToUpdate.lat, stopToUpdate.lon, days);
        setStops(prevStops => prevStops.map(s => s.id === stopId ? {...s, weather: weather ? weather[0] : null } : s));
    }
  };

  // Updated saveTrip function to handle both new trips and updates
  const saveTrip = (tripDataForUpdate) => {
    let nameToSave, dateToSave, stopsToSave, idToSave;

    if (tripDataForUpdate && tripDataForUpdate.id) { // If an ID is provided, it's an update
        idToSave = tripDataForUpdate.id;
        nameToSave = tripDataForUpdate.name;
        // Ensure dateToSave is a Date object if it's coming from tripDataForUpdate
        dateToSave = tripDataForUpdate.date instanceof Date ? tripDataForUpdate.date : new Date(tripDataForUpdate.date);
        stopsToSave = tripDataForUpdate.stops.map(s => ({
            name: s.name,
            lat: s.lat,
            lon: s.lon,
            // Ensure stops have IDs, if they are pre-existing from context they should
            id: s.id || uuidv4(), // Assign new ID if one doesn't exist (shouldn't happen for existing stops)
            weather: s.weather // Preserve weather if it exists
        }));
    } else { // It's a new trip, use current context state
        nameToSave = tripName;
        dateToSave = tripDate;
        stopsToSave = stops; // These stops from context should already have IDs and weather
        idToSave = null; // No ID for new trip creation, uuidv4 will be used
    }

    if (!nameToSave || !nameToSave.trim()) {
      alert("Please provide a trip name.");
      return false;
    }
    if (!dateToSave) {
      alert("Please select a date for your trip.");
      return false;
    }
    if (!stopsToSave || stopsToSave.length === 0) {
      alert("Please add at least one stop to your trip.");
      return false;
    }

    if (idToSave) { // Update existing trip
        setSavedTrips(prev => prev.map(trip =>
            trip.id === idToSave
            ? { ...trip,
                name: nameToSave,
                date: dateToSave.toISOString(),
                // Store only essential stop data for saved trips to keep localStorage light
                stops: stopsToSave.map(s => ({ name: s.name, lat: s.lat, lon: s.lon }))
              }
            : trip
        ));
    } else { // Create new trip
        const newTrip = {
          id: uuidv4(),
          name: nameToSave,
          date: dateToSave.toISOString(),
          stops: stopsToSave.map(s => ({ name: s.name, lat: s.lat, lon: s.lon })), // Store minimal stop info
        };
        setSavedTrips(prev => [...prev, newTrip]);
    }
    setIsDirty(false); // Set to false after successful save/update
    return true;
  };

  const deleteTrip = (tripId) => {
    setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
    // If the deleted trip was being edited, clear the form
    // This logic is better handled in SchedulePage where editingTripId is managed
  };

  const loadTripForEditing = async (tripId) => {
    const tripToEdit = savedTrips.find(trip => trip.id === tripId);
    if (tripToEdit) {
      setTripName(tripToEdit.name);
      setTripDate(new Date(tripToEdit.date));

      // Load stops and fetch their weather individually
      const loadedStopsPromises = tripToEdit.stops.map(async (s) => {
        const weather = await fetchWeatherForLocation(s.lat, s.lon, 1); // Fetch 1 day weather
        return { ...s, id: uuidv4(), weather: weather ? weather[0] : null };
      });
      
      const resolvedStops = await Promise.all(loadedStopsPromises);
      setStops(resolvedStops);

      // setCurrentSelectedLocation(null); // Clear any map-selected location
      setIsDirty(false); // Initially, a loaded trip is not "dirty"
    }
  };

  const clearCurrentTripDetails = () => {
    setTripName('');
    setTripDate(new Date());
    setStops([]);
    setCurrentSelectedLocation(null); // Also clear the map's selected location
    setIsDirty(false);
  }

  const value = {
    currentSelectedLocation,
    setCurrentSelectedLocation,
    stops,
    setStops,
    addStop,
    removeStop,
    updateStopWeather,
    tripName,
    setTripName,
    tripDate,
    setTripDate,
    savedTrips,
    saveTrip, // Updated saveTrip
    deleteTrip,
    loadTripForEditing,
    weatherForecastDays,
    setWeatherForecastDays,
    fetchWeatherForLocation,
    isLoadingWeather,
    activeRoute,
    setActiveRoute,
    isDirty,
    setIsDirty,
    clearCurrentTripDetails,
    GEOAPIFY_API_KEY,
    geocodeCache,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
