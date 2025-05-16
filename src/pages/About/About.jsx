import React from 'react';
// Removed: import './About.css';
import DayBackground from '../../components/DayBackground';
import NightBackground from '../../components/NightBackground';
import { useDarkMode } from "../../ColorThemeContext"; // Adjust path if needed
// Ensure Font Awesome is linked in your main HTML file for the GitHub icon, or use a React icon library.
// import { Github } from 'lucide-react'; // Example if using Lucide for icons

function About() {
    const { darkMode } = useDarkMode();

    // Updated teamMembers to include a link for each member
    const teamMembers = [
        { name: "Alanis Danica Concha", link: "#alanis-profile" }, // Replace #alanis-profile with actual URLs
        { name: "Althea Bianca Falnican", link: "#althea-profile" },
        { name: "Chelo Macatangay", link: "#chelo-profile" },
        { name: "Christian Joseph Ostaga", link: "#christian-profile" },
        { name: "Dwight Francis Caña", link: "#dwight-profile" },
        { name: "Jaynard Diosay", link: "#jaynard-profile" },
        { name: "Joshua Sumaginsing", link: "#joshua-profile" },
        { name: "Jon Stephen Navallo", link: "#jon-profile" },
        { name: "Lemuel De Ramos", link: "#lemuel-profile" },
        { name: "Robert Josh Deiparine", link: "#robert-profile" },
        { name: "Zairesh Marie Castillo", link: "#zairesh-profile" }
    ];


    React.useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        return () => {
            document.body.classList.remove('dark-mode');
        };
    }, [darkMode]);

    return (
        <div className="w-full min-h-screen flex flex-col md:pl-20"> {/* about-page-container */}
            <div className="pl-10 w-full min-h-screen bg-cover bg-center bg-fixed flex flex-col flex-grow">
                {/* Overlay */}
                {darkMode ? <NightBackground /> : <DayBackground />}

                {/* Main Content Area */}
                <main className="relative z-10 max-w-7xl mx-auto py-6 px-2 md:py-8 md:px-2 flex flex-col flex-grow w-full">
                    {/* Unified Content Container */}
                    <section className="flex flex-col md:flex-row md:items-start gap-1 md:gap-2 border border-white/25 rounded-xl p-6 md:p-8 bg-[#E2EDEF]/15 dark:bg-slate-900/20 backdrop-blur mt-[-2vw] sticky top-5"> {/* Added top-5 for sticky, adjust as needed */}
                        
                        {/* Block 1: Project Details */}
                        <div className="order-1 flex flex-col gap-3 md:gap-2 md:w-3/5 lg:w-3/5 xl:w-2/3"> {/* project-details-block */}
                            <header className="mb-0 flex flex-col items-center md:items-start"> {/* about-header */}
                                <h1 className="text-2xl md:text-[2.25rem] xl:text-5xl font-bold text-primary-Text-LightMode dark:text-primary-Text-DarkMode  [text-shadow:0_2px_4px_rgba(0,0,0,0.2)] text-center md:text-left">
                                    About our Project
                                </h1>
                            </header>
                            
                            <div className="flex flex-col gap-8"> {/* main-text-content */}
                                <section className="bg-primary-Bg-LightMode  text-primary-Text-LightMode dark:bg-primary-Bg-DarkMode2 dark:text-primary-Text-DarkMode p-6 rounded-xl shadow-xl backdrop-blur-lg"> {/* content-card for intro */}
                                    <p className="text-base md:text-base-lg leading-relaxed">
                                        Travore was created to make travel planning simpler, more intuitive,
                                        and more enjoyable. Built with the traveler in mind, it offers a
                                        streamlined experience that removes the hassle often associated
                                        with organizing trips. Whether you're preparing for a short getaway
                                        or a longer journey, Travore ensures you have everything you need to
                                        plan with ease.
                                    </p>
                                </section>

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"> {/* goal-mission-grid */}
                                    <div className=" bg-primary-Bg-LightMode   text-primary-Text-LightMode dark:text-primary-Text-DarkMode  dark:bg-primary-Bg-DarkMode2 p-6 rounded-xl shadow-xl backdrop-blur-lg"> {/* content-card */}
                                        <h2 className="text-2xl font-bold mb-3 text-primary-Text-LightMode dark:text-primary-Text-DarkMode ">Goal</h2>
                                        <p className="text-base md:text-lg leading-relaxed">
                                            At Travore, we help travelers plan
                                            confidently with a user-friendly map,
                                            real-time weather, and a scheduling
                                            calendar. With location enabled,
                                            Travore also recommends nearby
                                            destinations, making it easy to
                                            discover new places.
                                        </p>
                                    </div>
                                    <div className="bg-primary-Bg-LightMode  text-primary-Text-LightMode dark:text-primary-Text-DarkMode  dark:bg-primary-Bg-DarkMode2 p-6 rounded-xl shadow-xl backdrop-blur-lg"> {/* content-card */}
                                        <h2 className="text-2xl font-bold mb-3 text-primary-Text-LightMode dark:text-primary-Text-DarkMode ">Mission</h2>
                                        <p className="text-base md:text-lg leading-relaxed">
                                            Our mission is to make
                                            travel planning safe,
                                            enjoyable, and inspiring,
                                            helping travelers focus on
                                            creating unforgettable
                                            memories.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Block 2: Team & GitHub Info */}
                        <aside className="order-2 flex flex-col items-center gap-6 md:gap-8 md:w-[35%] lg:w-[35%] xl:w-1/3 lg:relative lg:top-5 lg:self-start"> {/* team-github-block */}
                            <div className="w-full flex justify-center"> {/* github-button-wrapper */}
                                <a 
                                    href="https://github.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center justify-center gap-2.5 bg-gray-200/90 dark:bg-primary-Bg-LightMode hover:bg-white  dark:hover:bg-primary-Button-DarkMode_Hover text-gray-800 dark:text-primary-Text-DarkMode1 py-2.5 px-3 text-sm font-semibold rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out min-w-[220px]"
                                >
                                    <i className="fab fa-github text-xl"></i> {/* Font Awesome icon */}
                                    {/* Example with Lucide: <Github className="w-5 h-5" /> */}
                                    Check the Github
                                </a>
                            </div>
                            
                            <section className="w-4/5 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode2 text-primary-Text-LightMode dark:text-primary-Text-DarkMode  p-6 rounded-xl shadow-xl backdrop-blur-lg"> {/* content-card team-card */}
                                <h2 className="text-2xl font-bold mb-3 text-center md:text-left text-primary-Text-LightMode dark:text-primary-Text-DarkMode">Team Members:</h2>
                                <ul className="list-none p-0 text-center">
                                    {teamMembers.map((member, index) => (
                                        <li key={index} className="text-sm md:text-base py-1">
                                            <a 
                                                href={member.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="hover:underline hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                {member.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </aside>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default About;
