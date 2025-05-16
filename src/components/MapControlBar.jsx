import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, ChevronRight, ZoomIn, ZoomOut, LocateFixed, Eye, EyeOff, PlusSquare } from 'lucide-react';
import RightSidebar from './RightSidebar/RightSidebar';

import L from "leaflet";
import "leaflet/dist/leaflet.css"; 
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const GEOAPIFY_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;

// Map component now receives stops, setStops, activeSearchedLocationName, and setActiveSearchedLocationName as props
function Map({ stops, setStops, activeSearchedLocationName, setActiveSearchedLocationName }) {
  const mapContainerXlHeight = "xl:h-[calc(100vh-11rem)]"; 

  const mapRef = useRef(null); 
  const mapElementRef = useRef(null); 

  // Local state for search input text and suggestions
  const [searchLocationInput, setSearchLocationInput] = useState(""); 
  const [suggestions, setSuggestions] = useState([]);
  
  // Local state for map-specific UI elements not needing persistence across routes
  const [radius, setRadius] = useState(5000); 
  const [showNearby, setShowNearby] = useState(true); 
  const [isSearchMarkerActive, setIsSearchMarkerActive] = useState(false); 
  
  const userLocationRef = useRef(null); 
  const userMarkerRef = useRef(null); 
  const searchMarkerRef = useRef(null); 

  const routingControlRef = useRef(null); 
  const nearbyMarkersRef = useRef([]); 
  const radiusCircleRef = useRef(null); 
  const debounceRef = useRef(null); 

  // Populate search input if activeSearchedLocationName exists (e.g., navigating back)
  useEffect(() => {
    if (activeSearchedLocationName) {
      setSearchLocationInput(activeSearchedLocationName);
    } else {
      setSearchLocationInput("");
    }
  }, [activeSearchedLocationName]);


  const updateRouting = useCallback((currentStops, currentSearchLatLng = null) => {
    if (!mapRef.current) return;
    if (routingControlRef.current && mapRef.current.hasLayer(routingControlRef.current)) {
        mapRef.current.removeControl(routingControlRef.current);
    }
    routingControlRef.current = null; 
    
    if (userLocationRef.current) {
      const waypoints = [L.latLng(userLocationRef.current.lat, userLocationRef.current.lng)];
      currentStops.forEach(s => waypoints.push(L.latLng(s.lat, s.lng)));
      if (currentStops.length === 0 && currentSearchLatLng) {
        waypoints.push(L.latLng(currentSearchLatLng.lat, currentSearchLatLng.lng));
      }
      
      if (waypoints.length > 1) {
        routingControlRef.current = L.Routing.control({
          waypoints, routeWhileDragging: true, showAlternatives: false,
          lineOptions: { styles: [{ color: "#007bff", weight: 5, opacity: 0.8 }] },
          addWaypoints: false, draggableWaypoints: false,
          createMarker: (i, waypoint) => {
            const isUserLoc = i === 0;
            const stopInfo = currentStops[i - 1];
            let name = "Waypoint";
            if (isUserLoc) name = "Your Location";
            else if (stopInfo) name = stopInfo.name;
            else if (i === waypoints.length - 1 && currentSearchLatLng && currentStops.length === 0) {
              name = activeSearchedLocationName.split(',')[0] || "Destination";
            }
            return L.marker(waypoint.latLng, {
              draggable: false,
              icon: L.icon({
                iconUrl: isUserLoc ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41]
              })
            }).bindPopup(name);
          }
        }).addTo(mapRef.current);
      }
    }
  }, [activeSearchedLocationName, stops]); 

  const drawRadiusCircle = useCallback((latlng, rad) => {
    if (!mapRef.current) return;
    if (radiusCircleRef.current && mapRef.current.hasLayer(radiusCircleRef.current)) {
        mapRef.current.removeLayer(radiusCircleRef.current);
    }
    radiusCircleRef.current = L.circle(latlng, {
      radius: rad, color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 1.5,
    }).addTo(mapRef.current);
  }, []);

  const fetchNearbyPlaces = useCallback(async (lat, lon, rad) => {
    if (!mapRef.current || !GEOAPIFY_KEY) {
      if (!GEOAPIFY_KEY) console.warn("Geoapify API key not set for nearby places.");
      return;
    }
    nearbyMarkersRef.current.forEach(marker => {
        if (mapRef.current && mapRef.current.hasLayer(marker)) { 
            mapRef.current.removeLayer(marker);
        }
    });
    nearbyMarkersRef.current = [];

    try {
      const response = await fetch( `https://api.geoapify.com/v2/places?categories=restaurant,catering,tourism.attraction&filter=circle:${lon},${lat},${rad}&bias=proximity:${lon},${lat}&limit=20&apiKey=${GEOAPIFY_KEY}`);
      const data = await response.json();
      data.features.forEach((item) => {
        const placeLat = item.geometry.coordinates[1];
        const placeLon = item.geometry.coordinates[0];
        const placeName = item.properties.name || "Unnamed Place";
        const placeAddress = item.properties.formatted || "Address not available";
        const placeDistance = item.properties.distance;
        const popupContent = `
          <div class="p-1 max-w-xs text-sm">
            <strong class="text-base block mb-0.5">${placeName}</strong>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-0.5">${placeAddress}</p>
            ${placeDistance ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Distance: ${(placeDistance / 1000).toFixed(2)} km</p>` : ''}
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
    } catch (error) { console.error("Error fetching nearby places:", error); }
  }, []); 

  // Map Initialization Effect
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) { 
        return; 
    }

    const currentMapElement = mapElementRef.current; // Capture ref value for cleanup

    const mapInstance = L.map(currentMapElement, { zoomControl: false }).setView([13.9587, 121.6189], 13);
    mapRef.current = mapInstance;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19,
    }).addTo(mapInstance);

    mapInstance.on("locationfound", (e) => {
      userLocationRef.current = e.latlng;
      if (userMarkerRef.current && mapInstance.hasLayer(userMarkerRef.current)) mapInstance.removeLayer(userMarkerRef.current);
      const userIcon = L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", shadowSize: [41, 41] });
      userMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(mapInstance).bindPopup("📍 You are here").openPopup();
      if (!mapInstance.getBounds().contains(e.latlng) || mapInstance.getZoom() < 15) mapInstance.setView(e.latlng, 15);
      else mapInstance.panTo(e.latlng);
      drawRadiusCircle(e.latlng, radius);
      if (showNearby) fetchNearbyPlaces(e.latlng.lat, e.latlng.lng, radius);
      updateRouting(stops); 
    });
    mapInstance.on("locationerror", (e) => console.warn("Location error:", e.message)); 
    mapInstance.locate({ setView: false, watch: true, maxZoom: 16, enableHighAccuracy: true });

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
                setStops(prevStops => [...prevStops, { lat, lng: lon, name }]);
                if (mapInstance) mapInstance.closePopup();
            });
        }
    });
    
    let rafId;
    const invalidateWithRAF = () => { rafId = requestAnimationFrame(() => { if (mapInstance && mapInstance.getContainer()) mapInstance.invalidateSize(); }); };
    invalidateWithRAF(); 

    const resizeObserver = new ResizeObserver(invalidateWithRAF); 
    // Use the captured currentMapElement for the observer
    if (currentMapElement) resizeObserver.observe(currentMapElement);


    return () => {
      cancelAnimationFrame(rafId);
      // Use the captured currentMapElement for unobserve
      if (resizeObserver && currentMapElement) resizeObserver.unobserve(currentMapElement); 
      resizeObserver.disconnect();
      
      if(routingControlRef.current && mapInstance && mapInstance.hasLayer(routingControlRef.current)) {
        mapInstance.removeControl(routingControlRef.current);
      }
      routingControlRef.current = null;

      if(radiusCircleRef.current && mapInstance && mapInstance.hasLayer(radiusCircleRef.current)) {
        mapInstance.removeLayer(radiusCircleRef.current);
      }
      radiusCircleRef.current = null;
      
      nearbyMarkersRef.current.forEach(marker => {
        if (mapInstance && mapInstance.hasLayer(marker)) mapInstance.removeLayer(marker);
      });
      nearbyMarkersRef.current = [];

      if(userMarkerRef.current && mapInstance && mapInstance.hasLayer(userMarkerRef.current)) {
        mapInstance.removeLayer(userMarkerRef.current);
      }
      userMarkerRef.current = null;

      if(searchMarkerRef.current && mapInstance && mapInstance.hasLayer(searchMarkerRef.current)) {
        mapInstance.removeLayer(searchMarkerRef.current);
      }
      searchMarkerRef.current = null;

      if (mapInstance) {
        mapInstance.off(); 
        mapInstance.remove(); 
      }
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // Dependencies: setStops, drawRadiusCircle, fetchNearbyPlaces, updateRouting, radius, showNearby, stops. 
          // These are either stable functions from useCallback/useState or props that, if changed, should ideally trigger re-evaluation or are handled by other effects.
          // For the primary mount/unmount logic, an empty array is often correct if the intent is truly "run once on mount, clean up once on unmount".
          // However, if props like 'stops' are used within the setup and can change, they should be in the deps array.
          // Given the complexity, let's refine the deps for the main setup effect.
          // The main setup (map creation, location watch) should be truly once.
          // Other effects handle dynamic data like 'stops' or 'radius'.

  // Effect for radius and showNearby changes (local UI state)
  useEffect(() => {
    if (!mapRef.current || !userLocationRef.current) return;
    drawRadiusCircle(userLocationRef.current, radius);
    if (showNearby) {
      fetchNearbyPlaces(userLocationRef.current.lat, userLocationRef.current.lng, radius);
    } else {
      nearbyMarkersRef.current.forEach(marker => {
          if(mapRef.current && mapRef.current.hasLayer(marker)) mapRef.current.removeLayer(marker)
        });
      nearbyMarkersRef.current = [];
    }
  }, [radius, showNearby, drawRadiusCircle, fetchNearbyPlaces]); // Callbacks are memoized

  // Effect to update routing when 'stops' prop changes
  useEffect(() => {
    if(mapRef.current && userLocationRef.current) {
        updateRouting(stops, searchMarkerRef.current ? searchMarkerRef.current.getLatLng() : null);
    }
  }, [stops, updateRouting]);


  const handleShowLocation = () => {
    if (userLocationRef.current && mapRef.current) {
      mapRef.current.setView(userLocationRef.current, 16);
      userMarkerRef.current?.openPopup();
    } else {
      mapRef.current?.locate({setView: true, maxZoom: 16});
    }
  };

  const handleRadiusInput = (e) => {
    const kmValue = Number(e.target.value);
    if (kmValue >= 1 && kmValue <= 100) setRadius(kmValue * 1000);
  };

  const handleAddStop = () => {
    if (!searchMarkerRef.current) {
      alert("Please search for and select a location to add as a stop.");
      return;
    }
    const stopLatLng = searchMarkerRef.current.getLatLng();
    const stopName = activeSearchedLocationName.split(',')[0] || `Stop ${stops.length + 1}`;
    setStops(prevStops => [...prevStops, { ...stopLatLng, name: stopName }]);

    setSearchLocationInput(""); 
    setSuggestions([]);
    if (searchMarkerRef.current && mapRef.current && mapRef.current.hasLayer(searchMarkerRef.current)) {
      mapRef.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
    setIsSearchMarkerActive(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchLocationInput(value);
    if (!value.trim()) {
      setActiveSearchedLocationName(""); 
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) fetchLocationSuggestions(value);
      else setSuggestions([]);
    }, 300);
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&countrycodes=ph`);
      const data = await response.json();
      setSuggestions(data.map((item) => ({ name: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) })));
    } catch (error) { console.error("Error fetching location suggestions:", error); setSuggestions([]); }
  };

  const handleSearchFromSuggestion = (location) => {
    const { lat, lon, name } = location;
    if (!mapRef.current) return;
    if (searchMarkerRef.current && mapRef.current.hasLayer(searchMarkerRef.current)) mapRef.current.removeLayer(searchMarkerRef.current);
    const searchIcon = L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-purple.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", shadowSize: [41, 41] });
    searchMarkerRef.current = L.marker([lat, lon], { icon: searchIcon }).addTo(mapRef.current).bindPopup(`📍 ${name.split(',')[0]}`).openPopup();
    setIsSearchMarkerActive(true);
    mapRef.current.setView([lat, lon], 14);
    setSuggestions([]);
    setSearchLocationInput(name); 
    setActiveSearchedLocationName(name); 
    // updateRouting is now called by the useEffect watching 'activeSearchedLocationName' and 'stops'
  };

  const handleSearchButtonClick = async () => {
    if (!searchLocationInput.trim()) return;
    if (suggestions.length > 0) handleSearchFromSuggestion(suggestions[0]);
    else {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchLocationInput}&limit=1&addressdetails=1&countrycodes=ph`);
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon, display_name: name } = data[0];
          handleSearchFromSuggestion({ lat: parseFloat(lat), lon: parseFloat(lon), name });
        } else { 
          alert("Location not found!"); 
          setActiveSearchedLocationName(""); 
        }
      } catch (error) { 
        alert("Failed to fetch location."); 
        setActiveSearchedLocationName(""); 
      }
    }
  };

  return (
    <div className="section-container font-montserrat w-full flex-1 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode p-3 md:p-4 pb-20 md:pb-4 min-h-screen lg:pl-24 flex flex-col xl:flex-row gap-3 md:gap-4">
      <div className="search-and-map-container flex-1 flex flex-col gap-3 md:gap-4 min-w-0"> 
        <div className='searchbar-and-proceed-btn flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4'>
          <div className="relative flex-grow w-full lg:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Search className="h-5 w-5 text-gray-400" /> </div>
            <input type="text" placeholder="Search location..." value={searchLocationInput} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === 'Enter') handleSearchButtonClick(); }}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 text-primary-Text-LightMode dark:text-primary-Text-DarkMode placeholder-gray-400 dark:placeholder-gray-500"
              autoComplete="off" />
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-primary-Bg-LightMode2 dark:bg-primary-Bg-DarkMode2 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((location, index) => ( <div key={index} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm" onClick={() => handleSearchFromSuggestion(location)}> {location.name} </div> ))}
              </div> )}
          </div>
          <button onClick={handleSearchButtonClick} className="lg:hidden inline-flex items-center justify-center px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-600"> Search Location </button>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 w-full lg:w-auto justify-center lg:justify-end flex-wrap">
             <button type="button" onClick={handleAddStop} disabled={!isSearchMarkerActive} title={isSearchMarkerActive ? "Add as stop" : "Search location to add stop"}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed">
                <PlusSquare className="mr-2 h-4 w-4" /> Add Stop </button>
            <button type="button" className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-Button1-LightMode text-primary-Text-DarkMode dark:bg-primary-Text-DarkMode dark:text-primary-Text-DarkMode1 text-sm font-medium rounded-lg shadow-md hover:bg-primary-Button1-LightMode_Hover dark:hover:bg-primary-Button-DarkMode_Hover">
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
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1.5 rounded shadow">
              <label htmlFor="radius-input" className="text-xs px-1 text-gray-600 dark:text-gray-300 select-none">Radius:</label>
              <input id="radius-input" type="number" min={1} max={100} value={radius / 1000} onChange={handleRadiusInput} className="w-12 p-1 h-full border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"/>
              <span className="text-xs text-gray-600 dark:text-gray-300 select-none">km</span>
            </div>
          </div>

          {stops.length > 0 && (
            <div className="absolute top-2 md:top-3 right-2 md:right-3 z-[1000] bg-white/80 dark:bg-black/70 backdrop-blur-sm p-2 md:p-3 rounded-lg shadow-xl max-w-[180px] sm:max-w-xs text-sm">
                <strong className="font-semibold block mb-1.5">Stops:</strong>
                <ul className="list-none space-y-1 max-h-24 sm:max-h-32 overflow-y-auto text-xs">
                    {stops.map((stop, idx) => ( <li key={idx} className="flex items-center"> <span className="bg-blue-500 w-1.5 h-1.5 rounded-full mr-1.5"></span> <span className="truncate" title={stop.name}>{stop.name}</span> </li> ))}
                </ul>
            </div> )}
        </div>
      </div>
      <RightSidebar stops={stops} searchLocation={activeSearchedLocationName} radius={radius} nearbyVisible={showNearby} />
    </div>
  );
};
export default Map;
