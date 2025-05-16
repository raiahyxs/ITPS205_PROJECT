import React from 'react';
import { FaSearch } from "react-icons/fa"; // Import search icon
// Removed useDarkMode import - relying solely on Tailwind's dark: prefix

// Simplified SearchBar component definition
function SearchBar() {

    return (
        // Use relative positioning to contain the absolutely positioned icon
        <div className="relative w-full">

            {/* Icon positioned inside the input padding area */}
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                <FaSearch className={`h-4 w-4 md:h-5 md:w-5 text-primary-Text-LightMode dark:text-primary-Text-DarkMode`} aria-hidden="true"  />
            </div>

            {/* Input Field */}
            <input
                type="search" // Use 'search' type for semantics
                id="search"
                name="search"
                className={`
                    block w-full /* Take full width of parent */
                    min-w-[280px] /* Minimum width */
                    pl-10 md:pl-12 /* Left padding to accommodate icon */
                    pr-3 py-2 md:py-3 /* Right and vertical padding */
                    text-base md:text-lg font-medium
                    dark:text-primary-Text-DarkMode /* Responsive text size */
                    border /* Add border */
                    rounded-full /* Fully rounded */
                    outline-none /* Remove default focus outline */
                    transition-colors duration-200 ease-in-out /* Smooth transitions */
                    bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode
                    border-primary-Outline-DarkMode dark:border-primary-Outline-DarkMode
                    focus:ring-2
                    focus:ring-primary-Button1-LightMode
                    dark:focus:ring-primary-Text-DarkMode
                `}
                placeholder="Search Places..." // Standard placeholder
                aria-label="Search Places" // Accessibility label
            />

            {/* No separate button or floating label needed in this simpler version */}

        </div>
    );
}

export default SearchBar;