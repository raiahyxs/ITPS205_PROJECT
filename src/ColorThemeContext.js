import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const ColorThemeContext = createContext();

// Create the provider component
export function ColorThemeProvider({ children }) {
    // State for dark mode, initialized from localStorage or default to false
    const [darkMode, setDarkMode] = useState(() => {
        // Check if running in a browser environment before accessing localStorage
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem("darkMode");
            // Parse saved mode if it exists, otherwise default to false
            return savedMode ? JSON.parse(savedMode) : false;
        }
        // Default to false if not in a browser (e.g., during server-side rendering)
        return false;
    });

    // Effect to save the mode to localStorage whenever it changes
    useEffect(() => {
        // Check if running in a browser environment
        if (typeof window !== 'undefined') {
            localStorage.setItem("darkMode", JSON.stringify(darkMode));
        }
    }, [darkMode]);

    // IMPORTANT: Effect to toggle the 'dark' class on the <html> element
    // This makes Tailwind's dark: variants work globally
    useEffect(() => {
        // Check if running in a browser environment
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement; // Get the <html> element
            if (darkMode) {
                root.classList.add('dark'); // Add 'dark' class if darkMode is true
            } else {
                root.classList.remove('dark'); // Remove 'dark' class if darkMode is false
            }
        }
        // This effect runs whenever the darkMode state changes
    }, [darkMode]);

    // Provide the darkMode state and the setter function to children
    return (
        <ColorThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ColorThemeContext.Provider>
    );
}

// Custom hook to easily consume the context value
export function useDarkMode() {
    const context = useContext(ColorThemeContext);
    // Optional: Add error handling if used outside the provider
    if (context === undefined) {
        throw new Error('useDarkMode must be used within a ColorThemeProvider');
    }
    return context;
}
