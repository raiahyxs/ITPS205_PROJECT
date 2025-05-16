import React from 'react';
import SuggestCards from './SuggestCards'; // Assuming this component is already responsive
import Home2 from './Home2';
import Home3 from './Home3';
import DayBackground from '../../components/DayBackground';
import NightBackground from '../../components/NightBackground';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useDarkMode } from "../../ColorThemeContext";

function Home() {
    const { darkMode } = useDarkMode();

    return (
        // Kept w-[100vw] as requested. Added min-h-screen for initial viewport fill.
        <div className="page-container font-montserrat w-[100vw] min-h-screen bg-white dark:bg-gray">
            <div className="home-content-wrapper w-full">
                
                <div
                    // Using min-h-screen ensures it covers viewport height, flex centers content vertically.
                    // Added responsive padding.
                    className="hero-section-content relative flex min-h-screen w-full items-center justify-center bg-cover bg-center px-4 py-16 sm:px-6 lg:px-8"
                >
                    {/* Overlay */}
                    {darkMode ? <NightBackground /> : <DayBackground />}
                    
                     {/* Slightly increased opacity for contrast */}

                    {/* --- Hero Content Block --- */}
                    {/* Centered block using max-width. Relative z-10 ensures it's above overlay. */}
                    {/* Text alignment changes from center on mobile to left on md+. */}
                    <div className='hero-content relative z-10 w-full max-w-5xl text-center md:text-left md:pl-16'> {/* Increased max-width slightly to max-w-5xl for better spacing on large screens */}
                        <h1 className='text-4xl font-bold  text-primary-Text-LightMode dark:text-cyan-100 sm:text-5xl lg:text-6xl'>
                            Travel and Explore
                        </h1>

                        {/* --- Search & Buttons Container --- */}
                        {/* Adjusted gaps and flex behavior for better responsiveness */}
                        {/* On md screens, items are in a row, wrap if necessary initially, then space-between on lg */}
                        <div className="srch-btn-cont mt-8 mb-10 flex w-full flex-col items-center gap-5 md:flex-row md:flex-wrap md:justify-center lg:flex-nowrap lg:justify-between lg:gap-6">
                            {/* Search Bar Wrapper */}
                            {/* Takes full width on mobile. On md+, it grows/shrinks but has a max-width. */}
                            <div className="w-full md:flex-1 md:max-w-md lg:max-w-lg xl:max-w-xl"> {/* Allows flex grow but caps width */}
                                <SearchBar/>
                            </div>
                            {/* Buttons Wrapper */}
                            {/* Stacks vertically centered on mobile. On md+, becomes a row, doesn't shrink, centered/end aligned based on available space */}
                            <div className="btns flex w-full flex-col items-center justify-center gap-4 md:w-auto md:flex-row md:flex-shrink-0 md:gap-4">
                                {/* Added whitespace-nowrap to prevent text wrapping inside buttons */}
                                <button className='sched-btn w-full whitespace-nowrap rounded-lg border-none bg-gray-100 bg-primary-Button1-LightMode text-primary-Text-DarkMode  hover:bg-primary-Button1-LightMode_Hover  px-5 py-3 font-sans text-base font-bold  shadow-md transition-colors duration-200 ease-in-out hover:bg-gray-200 dark:bg-primary-Text-DarkMode dark:text-primary-Text-DarkMode1 dark:hover:bg-primary-Button-DarkMode_Hover md:w-auto'>
                                    Schedule your Trip
                                </button>
                                <button className='chk-map-btn w-full whitespace-nowrap rounded-lg border-2 border-solid border-primary-Button1-LightMode bg-transparent px-5 py-3 font-sans text-base font-bold text-primary-Text-DarkMode shadow-md transition-colors duration-200 ease-in-out hover:border-gray-200 hover:bg-black/10 dark:border-primary-Text-DarkMode dark:text-primary-Text-DarkMode1 dark:hover:border-cyan-400 dark:hover:bg-white/10 md:w-auto'>
                                    Check the Map
                                </button>
                            </div>
                        </div>

                        {/* --- Suggestion Cards --- */}
                        {/* Adjusted margin-top slightly */}
                        <div className="mt-12 md:mt-14">
                             {/* Ensure SuggestCards handles its own internal responsiveness */}
                            <SuggestCards/>
                        </div>
                    </div>
                </div>
                <Home2/>
                <Home3/>
            </div>
        </div>
    );
}

export default Home;