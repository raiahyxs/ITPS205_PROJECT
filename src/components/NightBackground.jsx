import React, { useEffect, useRef, useMemo } from 'react';

// NightBackground component for the animated night sky and landscape
const NightBackground = () => {
  const skyRef = useRef(null); // Ref for the main sky container div

  // Generate star data - useMemo to prevent re-generation on every render
  const starsData = useMemo(() => {
    const numStars = 100; // Number of stars
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        id: i,
        // Random positions across the sky
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 60}%`, // Keep stars mostly in the upper 60% of the sky
        // Random size for stars
        size: `${Math.random() * 2 + 1}px`, // Stars between 1px and 3px
        // Random animation delay for twinkling effect
        animationDelay: `${Math.random() * 5}s`,
        // Random opacity for some static stars
        opacity: Math.random() * 0.5 + 0.5, // Opacity between 0.5 and 1.0
        // Determine if star should twinkle
        twinkles: Math.random() > 0.3, // 70% of stars will twinkle
      });
    }
    return stars;
  }, []);


  useEffect(() => {
    const currentSkyRef = skyRef.current;
    if (!currentSkyRef) return;

    // This effect is for animations that depend on container width.
    // For twinkling stars, it's not strictly necessary but kept for consistency.
    const setSkyContainerWidthProperty = () => {
      currentSkyRef.style.setProperty('--sky-container-width', `${currentSkyRef.offsetWidth}px`);
    };

    setSkyContainerWidthProperty();
    const resizeObserver = new ResizeObserver(entries => {
      if (entries && entries[0]) {
        setSkyContainerWidthProperty();
      }
    });
    resizeObserver.observe(currentSkyRef);

    return () => {
      if (currentSkyRef) {
        resizeObserver.unobserve(currentSkyRef);
      }
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Keyframes for star twinkling */
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* Base star style */
        .star {
          position: absolute;
          background-color: #E2EDEF; /* Star color */
          border-radius: 50%;
          box-shadow: 0 0 5px #E2EDEF, 0 0 10px #E2EDEF; /* Soft glow */
        }

        .star.twinkling {
          animation-name: twinkle;
          animation-duration: 3s; /* Duration of one twinkle cycle */
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        /* Styling for the hills */
        .night-hill { /* Renamed to avoid potential conflict if both components are used together */
          position: absolute;
          bottom: 0;
          width: 100%; 
          background-color: #0D1A1A; /* Specified night hill color */
          border-top-left-radius: 50% 100%; 
          border-top-right-radius: 50% 100%;
          /* Base z-index for hills, overridden by inline styles for layering */
        }
      `}</style>

      {/* Sky container - Night sky color: bg-[#313636] */}
      <div ref={skyRef} className="absolute inset-0 w-full h-full bg-[#313636] overflow-hidden">
        
        {/* Moon Element - color #E8FBFF */}
        <div
          className="absolute top-[10%] right-[15%] w-[70px] h-[70px] rounded-full shadow-[0_0_20px_5px_#E8FBFF,0_0_30px_10px_rgba(232,251,255,0.7)]"
          style={{ 
            backgroundColor: '#E8FBFF',
            zIndex: 6, // Moon above everything else
          }}
        ></div>

        {/* Render stars */}
        {starsData.map(star => (
          <div
            key={star.id}
            className={`star ${star.twinkles ? 'twinkling' : ''}`}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.twinkles ? undefined : star.opacity, // Static opacity for non-twinkling stars
              animationDelay: star.twinkles ? star.animationDelay : undefined,
              zIndex: 1, // Stars above the sky, below hills and moon
            }}
          ></div>
        ))}

        {/* Hills Layer - Using night hill color #112f35 
            One hill uses a slightly lighter shade for depth, or could use opacity.
            Let's use opacity for the furthest hill.
        */}
        <div
          className="night-hill"
          style={{
            height: '30%', 
            width: '120%',
            left: '-10%',
            borderTopLeftRadius: '50% 90px', 
            borderTopRightRadius: '50% 90px', 
            backgroundColor: '#0D1A1A', // Night hill color
            opacity: 0.7, // Furthest hill slightly more transparent
            zIndex: 2, // Furthest back hill layer
          }}
        />
        <div
          className="night-hill"
          style={{
            height: '25%', 
            width: '100%',
            backgroundColor: '#0D1A1A', // Night hill color
            bottom: '0%',
            borderTopLeftRadius: '60% 110px', 
            borderTopRightRadius: '40% 70px',  
            left: '-5%',
            zIndex: 3, // Middle hill layer
          }}
        />
        <div
          className="night-hill"
          style={{
            height: '20%', 
            width: '80%',
            left: '10%',
            backgroundColor: '#0D1A1A', // Night hill color
            opacity: 0.9, // Slightly less transparent than the one behind it
            bottom: '0%',
            borderTopLeftRadius: '40% 60px', 
            borderTopRightRadius: '60% 90px', 
            zIndex: 4, // Nearer hill layer
          }}
        />
         <div 
          className="night-hill"
          style={{
            height: '15%', 
            width: '150%',
            left: '-25%',
            backgroundColor: '#0D1A1A', // Night hill color
            borderTopLeftRadius: '50% 50px', 
            borderTopRightRadius: '50% 50px', 
            zIndex: 5, // Closest hill layer
          }}
        />
      </div>
    </>
  );
};

export default NightBackground;
