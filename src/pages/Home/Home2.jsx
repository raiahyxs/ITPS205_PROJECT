import React from 'react';
import AnimatedCircles from './AnimatedCircles';

function Home2() {
    return (
        <div className="
            py-16 px-6 md:py-24 md:px-10
            bg-[#9fd6d8] text-gray-900
            dark:bg-[#0D1A1A] dark:text-white
        ">
            <div className="
                container  sm:pl-5 mx-auto grid grid-cols-1 lg:grid-cols-2 lg:pl-20 lg:w-[80vw]
                gap-12 md:gap-16 items-center"
            >
                <div className='txt-content flex flex-col gap-4 text-center lg:text-left'>
                    <h1 className='
                        text-4xl sm:text-5xl lg:text-6xl
                        font-montserrat font-bold leading-tight
                    '>
                        Plan your trip with ease
                    </h1>
                    <h2 className="
                        font-montserrat text-lg lg:text-xl
                        text-gray-700
                        dark:text-gray-200
                    ">
                        You can schedule and choose your destination
                        with extra features such as a live weather map.
                    </h2>
                </div>
                <div className="flex justify-center sm:pl-[8rem] md:pl-[12rem] lg:pl-[2rem]">
                    <AnimatedCircles />
                </div>
            </div>
        </div>
    )
}

export default Home2;
