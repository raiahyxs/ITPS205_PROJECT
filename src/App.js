// src/App.js
import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from "./components/NavBar";
import Home from "./pages/Home/Home";
import Schedule from "./pages/Schedule/Schedule.jsx"; // Using Schedule.jsx
import Map from "./pages/Map/Map.jsx"; // Using Map.jsx
import About from "./pages/About/About";
import { ColorThemeProvider } from "./ColorThemeContext";
import { TripProvider, TripContext } from './contexts/TripContext';

// Component to handle navigation blocking logic and setting activeRoute
function NavigationBlocker() {
  const {
    isDirty,
    setActiveRoute
  } = useContext(TripContext);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.toLowerCase().includes('/map')) {
      setActiveRoute('map');
    } else if (location.pathname.toLowerCase().includes('/schedule')) {
      setActiveRoute('schedule');
    } else {
      setActiveRoute('');
    }
  }, [location.pathname, setActiveRoute]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return null;
}


function App() {
  const location = useLocation();

  useEffect(() => {
    console.log(`App.js: Navigated to ${location.pathname}`);
  }, [location]);

  return (
    <React.Fragment>
      <ColorThemeProvider>
        <TripProvider>
          <NavBar/>
          <NavigationBlocker />
          <main className="page-content-area"> {/* Adjust if NavBar height is different */}
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home/>}/>
              <Route 
                path="/Schedule" 
                element={<Schedule />} 
              />
              <Route 
                path="/Map" 
                element={<Map />} 
              />
              <Route path="/About" element={<About/>}/>
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-2xl p-4 text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p>Page Not Found!</p>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
                </div>
              }/>
            </Routes>
          </main>
        </TripProvider>
      </ColorThemeProvider>
    </React.Fragment>
  );
}

export default App;
