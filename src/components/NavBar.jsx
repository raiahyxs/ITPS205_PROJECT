import React from 'react';
// Assuming react-router-dom v6+ for NavLink usage
import { NavLink } from 'react-router-dom';
// Import necessary icons from react-icons
import { FaHome, FaCalendar, FaMap, FaCode } from "react-icons/fa"; 
import { IoMdInformationCircleOutline } from "react-icons/io";
import { BsMoon, BsSun } from "react-icons/bs";
import { useDarkMode } from '../ColorThemeContext';

// The main NavBar component
function NavBar() {
    const { darkMode, setDarkMode } = useDarkMode();

    // Generates common Tailwind classes for NavLink elements
    const getLinkClasses = (isActive = false) => {
        // Increased md:gap-4 to md:gap-5 for more space on larger screens
        const baseClasses = `
            flex flex-col items-center justify-center flex-grow 
            md:flex-row md:justify-start md:flex-grow-0 
            gap-2 md:gap-5 p-1 md:p-3 rounded-lg 
            transition-all duration-200 ease-in-out group-hover:md:w-full
            text-primary-Button1-LightMode dark:text-nav-icon-dark 
            hover:bg-nav-hover-bg-light dark:hover:bg-nav-hover-bg-dark 
            hover:text-nav-icon-light dark:hover:text-nav-icon-dark
        `;
        const activeClasses = `
             bg-nav-active-bg-light dark:bg-nav-active-bg-dark 
             text-nav-icon-light dark:text-nav-icon-dark 
             font-medium 
        `;
        return `${baseClasses} ${isActive ? activeClasses : ''}`;
    };

    // Generates classes for the text labels (Home, Map, etc.)
    const getLabelClasses = (isActive = false) => {
        const baseLabelClasses = `
            text-xs md:text-sm
            md:opacity-0 md:group-hover:opacity-100
            transition-opacity duration-200 whitespace-nowrap
        `;
        const activeLabelClasses = `
            font-medium
            /* Active label color is inherited from parent NavLink's active state */
        `;
        const defaultLabelClasses = `
            font-normal
            text-nav-text-light-default dark:text-nav-text-dark-default 
        `;
        return `${baseLabelClasses} ${isActive ? activeLabelClasses : defaultLabelClasses}`;
    };

    const placeholderIconColorClasses = `text-nav-icon-light dark:text-nav-icon-dark`;
    const titleColorClasses = `text-nav-icon-light dark:text-nav-icon-dark`;

    return (
        <div className={`
            font-montserrat group fixed bottom-0 left-0 z-[1050] w-full h-18 
            md:h-screen md:w-20 md:hover:w-56
            bg-[rgba(205,250,255,0.3)] dark:bg-[rgba(47,58,59,0.5)] 
            backdrop-blur-lg md:rounded-r-xl shadow-md md:shadow-lg
            transition-all duration-300 ease-in-out overflow-hidden
        `}>
            <nav className="flex md:flex-col justify-around md:justify-start items-stretch h-full md:h-auto md:pt-8 md:px-4 space-x-1 md:space-x-0 md:space-y-3">
                <div className="hidden md:flex justify-center items-center mb-4 h-8">
                    <FaCode className={`text-3xl ${placeholderIconColorClasses}`} />
                </div>
                <div className="hidden md:flex items-center justify-center mb-4 md:mb-8 h-10">
                     <p className={`text-xl font-bold ${titleColorClasses} opacity-0 group-hover:md:opacity-100 transition-opacity duration-200 whitespace-nowrap`}>
                         Travore
                     </p>
                </div>

                {/* Navigation Links: Using NavLink with children as a render prop to correctly pass isActive */}
                <NavLink to="/" end className={({ isActive }) => getLinkClasses(isActive)}>
                    {({ isActive }) => (
                        <>
                            <div className='flex-shrink-0'>
                                <FaHome className={`text-xl md:text-2xl`} />
                            </div>
                            <span className={getLabelClasses(isActive)}>Home</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/Map" className={({ isActive }) => getLinkClasses(isActive)}>
                    {({ isActive }) => (
                        <>
                            <div className='flex-shrink-0'>
                                <FaMap className={`text-xl md:text-2xl`} />
                            </div>
                            <span className={getLabelClasses(isActive)}>Map</span>
                        </>
                    )}
                </NavLink>

                <NavLink to="/Schedule" className={({ isActive }) => getLinkClasses(isActive)}>
                    {({ isActive }) => (
                        <>
                            <div className='flex-shrink-0'>
                                <FaCalendar className={`text-xl md:text-2xl`} />
                            </div>
                            <span className={getLabelClasses(isActive)}>Schedule</span>
                        </>
                    )}
                </NavLink>

                <div className="hidden md:block py-3 flex-grow"></div> {/* Spacer */}

                <NavLink to="/About" className={({ isActive }) => getLinkClasses(isActive)}>
                    {({ isActive }) => (
                        <>
                            <div className='flex-shrink-0'>
                                <IoMdInformationCircleOutline className={`text-xl md:text-2xl`} />
                            </div>
                            <span className={getLabelClasses(isActive)}>About</span>
                        </>
                    )}
                </NavLink>

                <button
                    onClick={() => setDarkMode(!darkMode)}
                    // For the button, we pass `false` to getLinkClasses as it doesn't have an "active" route state
                    className={`${getLinkClasses(false)} md:mt-4`} 
                    aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {/* No need for isActive here as it's a button, not a NavLink */}
                    <div className='flex-shrink-0'>
                        {darkMode ? (
                            <BsSun className={`text-xl md:text-2xl text-yellow-500`} /> 
                        ) : (
                            <BsMoon className={`text-xl md:text-2xl`} />
                        )}
                    </div>
                    {/* Label for the button, also doesn't need isActive from routing */}
                    <span className={getLabelClasses(false)}> 
                        {darkMode ? "Light" : "Dark"}
                    </span>
                </button>

                 <div className="hidden md:block h-4"></div> {/* Bottom padding */}
            </nav>
        </div>
    );
}

export default NavBar;
