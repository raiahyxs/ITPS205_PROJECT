import React, { useEffect, useRef } from 'react';

// DayBackground component for the animated sky and landscape
const DayBackground = () => {
  const skyRef = useRef(null); // Ref for the main sky container div

  // Cloud data for rendering multiple clouds with variations
  // Z-indexes are 2, 3, 4 for proper layering
  const cloudsData = [
    // Layer 1 - Further away clouds
    { type: 'cloud-2', animationClass: 'c1', style: { animationDelay: '-5s', zIndex: 2, top: '20%', transform: 'scale(0.7)' } },
    { type: 'cloud-4', animationClass: 'c1', style: { animationDelay: '-15s', zIndex: 2, top: '30%', transform: 'scale(0.6)' } },
    { type: 'cloud-1', animationClass: 'c2', style: { animationDelay: '-22s', top: '35%', transform: 'scale(0.85)', zIndex: 2 } },

    // Layer 2 - Middle distance clouds
    { type: 'cloud-1', animationClass: 'c1', style: { zIndex: 3, top: '10%', transform: 'scale(0.9)' } },
    { type: 'cloud-3', animationClass: 'c1', style: { animationDelay: '-8s', zIndex: 3, top: '15%', transform: 'scale(1.1)' } },
    { type: 'cloud-2', animationClass: 'c2', style: { animationDelay: '-28s', top: '48%', transform: 'scale(0.9)', zIndex: 3 } },

    // Layer 3 - Closer clouds
    { type: 'cloud-3', animationClass: 'c2', style: { animationDelay: '-3s', zIndex: 4, top: '45%', transform: 'scale(1.2)' } },
    { type: 'cloud-1', animationClass: 'c2', style: { animationDelay: '-12s', top: '58%', transform: 'scale(1.15)', zIndex: 4 } },
    { type: 'cloud-4', animationClass: 'c2', style: { animationDelay: '-20s', top: '60%', transform: 'scale(0.95)', zIndex: 4 } },
  ];

  useEffect(() => {
    const currentSkyRef = skyRef.current; // Capture for use in effect and cleanup
    if (!currentSkyRef) return;

    // Function to set the CSS custom property for container width, used in cloud animation
    const setSkyContainerWidthProperty = () => {
      currentSkyRef.style.setProperty('--sky-container-width', `${currentSkyRef.offsetWidth}px`);
    };

    setSkyContainerWidthProperty(); // Set initial width on mount

    // Use ResizeObserver to update the width if the container resizes
    const resizeObserver = new ResizeObserver(entries => {
      if (entries && entries[0]) {
        setSkyContainerWidthProperty();
      }
    });

    resizeObserver.observe(currentSkyRef);

    // Cleanup function to unobserve when the component unmounts
    return () => {
      if (currentSkyRef) {
        resizeObserver.unobserve(currentSkyRef);
      }
    };
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  return (
    <>
      <style jsx global>{`
        /* Keyframes for cloud movement */
        @keyframes moveCloud {
          0% {
            transform: translateX(-250px); /* Start off-screen to the left */
          }
          100% {
            /* Use CSS variable for travel distance, fallback to 100vw if not set. */
            transform: translateX(calc(var(--sky-container-width, 100vw) + 250px));
          }
        }

        /* Base cloud style */
        .cloud {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          opacity: 0.9;
          box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.1);
          animation-name: moveCloud;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        /* Cloud components for fluffy shape using pseudo-elements */
        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: #fff;
          border-radius: 50%;
          box-shadow: inherit;
        }

        /* Cloud type 1 specific styles */
        .cloud-1 { width: 100px; height: 60px; }
        .cloud-1::before { width: 70px; height: 70px; top: -30px; left: 15px; }
        .cloud-1::after { width: 80px; height: 80px; top: -20px; right: 10px; }

        /* Cloud type 2 specific styles */
        .cloud-2 { width: 70px; height: 40px; }
        .cloud-2::before { width: 50px; height: 50px; top: -20px; left: 10px; }
        .cloud-2::after { width: 40px; height: 40px; top: -15px; right: 5px; opacity: 0.8; }

        /* Cloud type 3 specific styles */
        .cloud-3 { width: 150px; height: 80px; opacity: 0.85; }
        .cloud-3::before { width: 100px; height: 100px; top: -40px; left: 20px; }
        .cloud-3::after { width: 90px; height: 70px; top: -30px; right: 25px; }

        /* Cloud type 4 (Wispy) specific styles */
        .cloud-4 { width: 120px; height: 30px; border-radius: 30px; opacity: 0.75; }
        .cloud-4::before { width: 70px; height: 20px; border-radius: 20px; top: -10px; left: 25px; }
        .cloud-4::after { display: none; } /* Simpler shape for wispy cloud */

        /* Animation durations for parallax effect - applied via className */
        .cloud-1.c1 { animation-duration: 40s; }
        .cloud-2.c1 { animation-duration: 55s; }
        .cloud-3.c1 { animation-duration: 30s; }
        .cloud-4.c1 { animation-duration: 65s; }

        .cloud-1.c2 { animation-duration: 45s; }
        .cloud-2.c2 { animation-duration: 60s; }
        .cloud-3.c2 { animation-duration: 35s; }
        .cloud-4.c2 { animation-duration: 70s; }

        /* Styling for the hills */
        .hill {
          position: absolute;
          bottom: 0;
          width: 100%; /* Default width, specific hills can override */
          background-color: #1B4A53; /* Default hill color */
          /* Asymmetric radius for hill shape */
          border-top-left-radius: 50% 100%; 
          border-top-right-radius: 50% 100%;
          z-index: 0; /* Base z-index for hills, overridden by inline styles for layering */
        }
      `}</style>

      {/* Sky container - Sky color changed to bg-[#e6ffff] (lighter than #d1ffff) */}
      <div ref={skyRef} className="absolute inset-0 w-full h-full bg-[#dcf2fd] overflow-hidden">
        {/* Sun Element - zIndex: 1 */}
        <div
          className="absolute top-[5%] right-[10%] w-[100px] h-[100px] bg-yellow-400 rounded-full shadow-[0_0_30px_10px_#FFD700,0_0_50px_20px_rgba(255,223,0,0.5)] z-[1]"
          style={{ backgroundColor: '#FFD700' }}
        ></div>

        {/* Render clouds using the data array */}
        {cloudsData.map((cloud, index) => (
          <div
            key={index}
            className={`cloud ${cloud.type} ${cloud.animationClass}`}
            style={cloud.style}
          ></div>
        ))}

        {/* Hills Layer - Z-indexes 0, 1, 2, 3 from back to front */}
        <div
          className="hill"
          style={{
            height: '30%', 
            width: '120%',
            left: '-10%',
            borderTopLeftRadius: '50% 90px', 
            borderTopRightRadius: '50% 90px', 
            backgroundColor: '#437c88', // Distant hill color
            opacity: 0.7,
            zIndex: 0, // Furthest back hill layer
          }}
        />
        <div
          className="hill"
          style={{
            height: '25%', 
            width: '100%',
            backgroundColor: '#9fd6d8', // Main hill color
            bottom: '0%',
            borderTopLeftRadius: '60% 110px', 
            borderTopRightRadius: '40% 70px',  
            left: '-5%',
            zIndex: 1, // Middle hill layer
          }}
        />
        <div
          className="hill"
          style={{
            height: '20%', 
            width: '80%',
            left: '10%',
            backgroundColor: '#9fd6d8',
            opacity: 0.9,
            bottom: '0%',
            borderTopLeftRadius: '40% 60px', 
            borderTopRightRadius: '60% 90px', 
            zIndex: 2, // Nearer hill layer
          }}
        />
         <div // A flatter, wider hill in the foreground
          className="hill"
          style={{
            height: '15%', 
            width: '150%',
            left: '-25%',
            backgroundColor: '#9fd6d8',
            borderTopLeftRadius: '50% 50px', 
            borderTopRightRadius: '50% 50px', 
            zIndex: 3, // Closest hill layer
          }}
        />
      </div>
    </>
  );
};

export default DayBackground;
