// src/pages/Map/Map.jsx
import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { Search, ChevronRight, ZoomIn, ZoomOut, LocateFixed, Eye, EyeOff, PlusSquare, Navigation as DirectionsIcon } from 'lucide-react';
import RightSidebar from '../../components/RightSidebar/RightSidebar'; // Adjust path if needed
import { TripContext } from '../../contexts/TripContext'; // Adjust path if needed

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

console.log("Map.jsx: Imported TripContext:", TripContext);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function Map() {
  const contextState = useContext(TripContext);
  
  const mapRef = useRef(null);
  const mapElementRef = useRef(null);
  const userLocationRef = useRef(null);
  const userMarkerRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const routingControlRef = useRef(null);
  const nearbyMarkersRef = useRef([]);
  const radiusCircleRef = useRef(null);

  const [searchLocationInput, setSearchLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [radius, setRadius] = useState(5000);
  const [showNearby, setShowNearby] = useState(true);
  const [isSearchMarkerActive, setIsSearchMarkerActive] = useState(false);
  const [currentSearchedMapItem, setCurrentSearchedMapItem] = useState(null);

  if (!contextState) {
    console.error("Map.jsx: TripContext value is null or undefined. Ensure Map is rendered within a TripProvider.");
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-orange-500 p-4">
            <h1 className="text-2xl font-bold">Context Error in Map Component</h1>
            <p>TripContext is not available. Ensure the Map component is rendered as a child of TripProvider.</p>
        </div>
    );
  }

  const {
    stops,
    addStop,
    setCurrentSelectedLocation,
    setActiveRoute,
    setIsDirty,
    GEOAPIFY_API_KEY,
    geocodeCache
  } = contextState;

  const mapContainerXlHeight = "xl:h-[calc(100vh-11rem)]";

  const fetchLocationSuggestions = useCallback(async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const cacheKey = `nominatim-${query.toLowerCase()}`;
    if (geocodeCache && geocodeCache.has(cacheKey)) {
        setSuggestions(geocodeCache.get(cacheKey));
        return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&countrycodes=ph`);
      const data = await response.json();
      const formattedSuggestions = data.map((item) => ({ name: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) }));
      if (geocodeCache) {
        geocodeCache.set(cacheKey, formattedSuggestions);
      }
      setSuggestions(formattedSuggestions);
    } catch (error) { console.error("Error fetching location suggestions:", error); setSuggestions([]); }
  }, [geocodeCache]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchLocationInput.trim().length >= 3) {
        setDebouncedSearchTerm(searchLocationInput.trim());
      } else {
        setSuggestions([]);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [searchLocationInput]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchLocationSuggestions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchLocationSuggestions]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
        // If mapRef.current already exists, it means map is initialized, so skip.
        // If mapElementRef.current doesn't exist, we can't initialize.
        return;
    }
    
    // Ensure the container is actually in the DOM and has dimensions
    if (mapElementRef.current.offsetWidth === 0 || mapElementRef.current.offsetHeight === 0) {
        console.warn("Map.jsx: Map container has no dimensions yet. Deferring map initialization.");
        // This might happen if CSS is hiding the container or it's not yet laid out.
        // You might need a ResizeObserver on a parent or a different strategy if this is a persistent issue.
        return; 
    }

    console.log("Map.jsx: Initializing Leaflet map.");
    // Set an initial view directly
    const mapInstance = L.map(mapElementRef.current, { zoomControl: false }).setView([13.9587, 121.6189], 10); // Default to a wider view of PH initially
    mapRef.current = mapInstance;
    const currentMapElement = mapElementRef.current;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
    }).addTo(mapInstance);

    mapInstance.on("locationfound", (e) => {
      // Ensure this event is for the current map instance, especially if re-renders are rapid
      if (mapRef.current !== mapInstance) {
        console.warn("Map.jsx: locationfound event for an old map instance. Ignoring.");
        return;
      }
      
      userLocationRef.current = e.latlng;
      if (userMarkerRef.current && mapRef.current.hasLayer(userMarkerRef.current)) {
        mapRef.current.removeLayer(userMarkerRef.current);
      }
      const userIcon = L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", shadowSize: [41, 41] });
      userMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(mapRef.current).bindPopup("📍 You are here").openPopup();
      
      // Use flyTo for a smoother transition to the user's location
      mapRef.current.flyTo(e.latlng, 15); 

    });
    mapInstance.on("locationerror", (e) => {
        console.warn("Location error:", e.message);
        // Handle error, e.g., inform user location could not be found
        // mapRef.current.setView([13.9587, 121.6189], 10); // Fallback to default view if needed
    });
    
    // Call locate with setView: false, we handle it manually in locationfound
    mapInstance.locate({ setView: false, watch: false, maxZoom: 16, enableHighAccuracy: true });

     mapInstance.on('popupopen', (e) => {
        const popupNode = e.popup.getElement();
        const addButton = popupNode?.querySelector('.add-stop-from-popup-btn');
        if (addButton) {
            const lat = parseFloat(addButton.dataset.lat);
            const lon = parseFloat(addButton.dataset.lon);
            const name = addButton.dataset.name;
            const newButton = addButton.cloneNode(true);
            addButton.parentNode.replaceChild(newButton, addButton);
            newButton.addEventListener('click', () => {
                addStop({ name, lat, lon });
                setIsDirty(true);
                if (mapRef.current) mapRef.current.closePopup(); // Use mapRef.current
            });
        }
    });

    const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) { // Ensure map instance exists before invalidating size
            mapRef.current.invalidateSize();
        }
    });
    if (currentMapElement) {
      resizeObserver.observe(currentMapElement);
    }

    return () => {
      console.log("Map.jsx: Cleaning up Leaflet map.");
      if (resizeObserver && currentMapElement) {
        resizeObserver.unobserve(currentMapElement);
      }
      resizeObserver.disconnect();
      
      // Safely remove event listeners and map instance
      if (mapInstance) {
        mapInstance.off(); // Remove all event listeners specific to this instance
        mapInstance.remove(); // Destroy the map instance
      }
      mapRef.current = null; // Clear the ref
    };
  }, [addStop, setIsDirty]); // Dependencies for map initialization

  const drawRadiusCircle = useCallback((latlng, rad) => {
    if (!mapRef.current) return;
    if (radiusCircleRef.current) {
      mapRef.current.removeLayer(radiusCircleRef.current);
    }
    radiusCircleRef.current = L.circle(latlng, {
      radius: rad, color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 1.5,
    }).addTo(mapRef.current);
  }, []);

  const fetchNearbyGeoapifyPlaces = useCallback(async (lat, lon, rad) => {
    if (!mapRef.current || !GEOAPIFY_API_KEY) return;
    nearbyMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
    nearbyMarkersRef.current = [];
    try {
      const categories = "tourism.attraction,accommodation,catering.restaurant,commercial.shopping_mall";
      const response = await fetch(`https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${rad}&bias=proximity:${lon},${lat}&limit=20&apiKey=${GEOAPIFY_API_KEY}`);
      const data = await response.json();
      data.features.forEach((item) => {
        const placeLat = item.geometry.coordinates[1];
        const placeLon = item.geometry.coordinates[0];
        const placeName = item.properties.name || item.properties.address_line1 || "Unnamed Place";
        const placeAddress = item.properties.formatted || "Address not available";
        const popupContent = `
          <div class="p-1 max-w-xs text-sm font-sans">
            <strong class="text-base block mb-0.5">${placeName}</strong>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-0.5">${placeAddress}</p>
            <button data-lat="${placeLat}" data-lon="${placeLon}" data-name="${placeName.replace(/"/g, '&quot;')}" class="add-stop-from-popup-btn mt-1 px-2.5 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors w-full text-center">Add as Stop</button>
          </div>`;
        const newMarker = L.marker([placeLat, placeLon], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41]
            })
        });
        if(mapRef.current) {
            newMarker.addTo(mapRef.current).bindPopup(popupContent);
            nearbyMarkersRef.current.push(newMarker);
        }
      });
    } catch (error) { console.error("Error fetching nearby places from Geoapify:", error); }
  }, [GEOAPIFY_API_KEY]);

  useEffect(() => {
    if (!mapRef.current || !userLocationRef.current) return; // Ensure map and user location are ready
    drawRadiusCircle(userLocationRef.current, radius);
    if (showNearby) {
      fetchNearbyGeoapifyPlaces(userLocationRef.current.lat, userLocationRef.current.lng, radius);
    } else {
      nearbyMarkersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
      nearbyMarkersRef.current = [];
    }
  }, [radius, showNearby, drawRadiusCircle, fetchNearbyGeoapifyPlaces, userLocationRef.current]); // Added userLocationRef.current as a conceptual trigger, though its direct mutation won't cause re-run. Effect re-runs if other deps change.

  const updateRouting = useCallback(() => {
    if (!mapRef.current || !userLocationRef.current) {
        if(routingControlRef.current && mapRef.current) { mapRef.current.removeControl(routingControlRef.current); routingControlRef.current = null; }
        return;
    }
     if (stops.length < 1) {
        if(routingControlRef.current && mapRef.current) { mapRef.current.removeControl(routingControlRef.current); routingControlRef.current = null; }
        return;
    }
    const waypoints = [L.latLng(userLocationRef.current.lat, userLocationRef.current.lng)];
    stops.forEach(s => waypoints.push(L.latLng(s.lat, s.lon)));

    if (waypoints.length < 2) {
         if(routingControlRef.current && mapRef.current) { mapRef.current.removeControl(routingControlRef.current); routingControlRef.current = null; }
        return;
    }
    if (routingControlRef.current && mapRef.current) { mapRef.current.removeControl(routingControlRef.current); }

    routingControlRef.current = L.Routing.control({
      waypoints, routeWhileDragging: true, showAlternatives: false,
      lineOptions: { styles: [{ color: "#007bff", weight: 5, opacity: 0.8 }] },
      addWaypoints: false, draggableWaypoints: false,
      createMarker: (i, waypoint) => {
        const isUserLoc = i === 0;
        const stopInfo = stops[i - 1];
        let name = "Waypoint";
        let iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
        if (isUserLoc) { name = "Your Location"; iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'; }
        else if (stopInfo) { name = stopInfo.name; }
        return L.marker(waypoint.latLng, {
          draggable: false,
          icon: L.icon({ iconUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41] })
        }).bindPopup(name);
      }
    }).addTo(mapRef.current);
  }, [stops]);

  useEffect(() => {
    if (stops.length > 0 && userLocationRef.current) { // Check userLocationRef.current here
        updateRouting();
    } else if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
    }
  }, [stops, updateRouting]); // updateRouting is memoized. Consider adding a state for userLocation if its change needs to trigger this.

  const handleShowLocation = () => {
    if (userLocationRef.current && mapRef.current) {
      mapRef.current.flyTo(userLocationRef.current, 16); // Use flyTo for consistency
      if(userMarkerRef.current) userMarkerRef.current.openPopup();
    } else if (mapRef.current) { // Only call locate if map exists
      mapRef.current.locate({ setView: false }); // setView is false, handled by locationfound
    }
  };

  const handleRadiusInput = (e) => {
    const kmValue = Number(e.target.value);
    if (kmValue >= 1 && kmValue <= 100) setRadius(kmValue * 1000);
  };

  const handleAddCurrentSearchAsStop = () => {
    if (!currentSearchedMapItem) { alert("Please search for and select a location first."); return; }
    addStop(currentSearchedMapItem);
    setIsDirty(true);
    setSearchLocationInput(""); setSuggestions([]);
    if (searchMarkerRef.current && mapRef.current?.hasLayer(searchMarkerRef.current)) { mapRef.current.removeLayer(searchMarkerRef.current); searchMarkerRef.current = null; }
    setIsSearchMarkerActive(false); setCurrentSelectedLocation(null); setCurrentSearchedMapItem(null);
  };

  const handleInputChange = (e) => { setSearchLocationInput(e.target.value); };

  const handleSelectSuggestion = (location) => {
    if (!mapRef.current) return;
    if (searchMarkerRef.current && mapRef.current.hasLayer(searchMarkerRef.current)) { mapRef.current.removeLayer(searchMarkerRef.current); }
    const searchIcon = L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-purple.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", shadowSize: [41, 41] });
    searchMarkerRef.current = L.marker([location.lat, location.lon], { icon: searchIcon }).addTo(mapRef.current).bindPopup(`📍 ${location.name.split(',')[0]}`).openPopup();
    setIsSearchMarkerActive(true); mapRef.current.flyTo([location.lat, location.lon], 14); // Use flyTo
    setSuggestions([]); setSearchLocationInput(location.name);
    setCurrentSelectedLocation({ name: location.name.split(',')[0], lat: location.lat, lon: location.lon });
    setCurrentSearchedMapItem({ name: location.name.split(',')[0], lat: location.lat, lon: location.lon });
  };
  
  const handleSearchButtonClick = async () => {
    if (!searchLocationInput.trim()) return;
    if (suggestions.length > 0 && suggestions[0].name.toLowerCase().includes(searchLocationInput.toLowerCase())) {
        handleSelectSuggestion(suggestions[0]);
    } else {
        const query = searchLocationInput.trim();
        const cacheKey = `nominatim-${query.toLowerCase()}`;
        if (geocodeCache && geocodeCache.has(cacheKey) && geocodeCache.get(cacheKey).length > 0) {
            handleSelectSuggestion(geocodeCache.get(cacheKey)[0]); return;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1&countrycodes=ph`);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon, display_name: name } = data[0];
                const locationItem = { name, lat: parseFloat(lat), lon: parseFloat(lon) };
                if (geocodeCache) {
                    geocodeCache.set(cacheKey, [locationItem]);
                }
                handleSelectSuggestion(locationItem);
            } else {
                alert("Location not found!"); setCurrentSelectedLocation(null); setCurrentSearchedMapItem(null);
            }
        } catch (error) {
            alert("Failed to fetch location."); setCurrentSelectedLocation(null); setCurrentSearchedMapItem(null);
        }
    }
  };

  const handleProceedToSchedule = () => {
    if (stops.length === 0) {
      if (!window.confirm("You have not added any stops. Are you sure you want to proceed to schedule an empty trip?")) { return; }
    }
    setActiveRoute('schedule'); setIsDirty(false);
  };
  
  const handleShowDirections = () => {
    if (!userLocationRef.current) { alert("Your location is not available. Please enable location services."); return; }
    if (stops.length < 1) { alert("Please add at least one stop to show directions."); return; }
    updateRouting();
  };

  return (
    <div className="section-container font-montserrat w-full flex-1 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode p-3 md:p-4 pb-20 md:pb-4 min-h-screen lg:pl-24 flex flex-col xl:flex-row gap-3 md:gap-4">
      <div className="search-and-map-container flex-1 flex flex-col gap-3 md:gap-4 min-w-0">
        <div className='searchbar-and-proceed-btn flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4'>
          <div className="relative flex-grow w-full lg:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Search className="h-5 w-5 text-gray-400" /> </div>
            <input type="text" placeholder="Search location (e.g., Manila City)..." value={searchLocationInput} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === 'Enter') handleSearchButtonClick(); }}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 text-primary-Text-LightMode dark:text-primary-Text-DarkMode placeholder-gray-400 dark:placeholder-gray-500"
              autoComplete="off" />
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((locationItem, index) => ( <div key={index} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm" onClick={() => handleSelectSuggestion(locationItem)}> {locationItem.name} </div> ))}
              </div> )}
          </div>
          <button onClick={handleSearchButtonClick} className="lg:hidden inline-flex items-center justify-center px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-600"> Search Location </button>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end flex-wrap">
             <button type="button" onClick={handleAddCurrentSearchAsStop} disabled={!isSearchMarkerActive} title={isSearchMarkerActive ? "Add current search as stop" : "Search for a location to add as a stop"}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed">
                <PlusSquare className="mr-2 h-4 w-4" /> Add Stop </button>
            <button type="button" onClick={handleProceedToSchedule} className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-Button1-LightMode text-primary-Text-DarkMode dark:bg-primary-Text-DarkMode dark:text-primary-Text-DarkMode1 text-sm font-medium rounded-lg shadow-md hover:bg-primary-Button1-LightMode_Hover dark:hover:bg-primary-Button-DarkMode_Hover">
              Proceed to Schedule <ChevronRight className="ml-2 h-4 w-4" /> </button>
          </div>
        </div>

        <div className={`map-outer-container relative flex-1 bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 rounded-xl shadow-xl overflow-hidden min-h-[350px] sm:min-h-[400px] md:min-h-[450px] ${mapContainerXlHeight}`}>
          <div id="map" ref={mapElementRef} className="h-full w-full cursor-grab bg-gray-200 dark:bg-gray-700">
          </div>
          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1.5 p-1.5 bg-white/80 dark:bg-black/70 backdrop-blur-sm rounded-lg shadow-xl flex-wrap justify-center max-w-[calc(100%-1rem)] px-2">
            <button onClick={() => mapRef.current?.zoomIn()} title="Zoom In" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 shadow"><ZoomIn className="h-5 w-5" /></button>
            <button onClick={() => mapRef.current?.zoomOut()} title="Zoom Out" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 shadow"><ZoomOut className="h-5 w-5" /></button>
            <button onClick={handleShowLocation} title="My Location" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 shadow"><LocateFixed className="h-5 w-5" /></button>
            <button onClick={() => setShowNearby(v => !v)} title={showNearby ? "Hide Nearby" : "Show Nearby"} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 shadow">{showNearby ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
            <button onClick={handleShowDirections} title="Show Directions for Stops" className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 shadow"><DirectionsIcon className="h-5 w-5" /></button>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1.5 rounded shadow">
              <label htmlFor="radius-input" className="text-xs px-1 text-gray-600 dark:text-gray-300 select-none">Radius:</label>
              <input id="radius-input" type="number" min={1} max={100} value={radius / 1000} onChange={handleRadiusInput} className="w-12 p-1 h-full border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
              <span className="text-xs text-gray-600 dark:text-gray-300 select-none">km</span>
            </div>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
};
export default Map; // Exporting as Map
