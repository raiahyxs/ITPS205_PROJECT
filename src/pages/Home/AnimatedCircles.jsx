import React, { useEffect, useRef, useState } from 'react';

//=============================================================================
// NOTE: The animations 'animate-move-1', 'animate-move-2', 'animate-move-3'
//       MUST be defined in your tailwind.config.js file.
//=============================================================================

// Helper function to get the average color of an image element
const getAverageColor = (imgElement, callback) => {
  // Ensure the image is loaded before processing
  const processImage = () => {
    const canvas = document.createElement('canvas');
    // Reduce canvas size for performance when sampling color
    const sampleSize = 100;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Opt-in for performance

    // Draw a scaled version of the image onto the canvas
    ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);

    let r = 0, g = 0, b = 0;
    try {
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;
      const pixelCount = data.length / 4;

      // Iterate over pixels to calculate average RGB
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        // Alpha (data[i + 3]) is ignored for average color
      }

      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);

      // Call the callback with the calculated RGB color
      callback(`rgb(${r},${g},${b})`);

    } catch (e) {
      console.error("Error getting image data (CORS issue?):", e);
      // Fallback color if analysis fails (e.g., CORS)
      callback('rgb(100,100,100)'); // Grey fallback
    }
  };

  // Check if the image is already loaded
  if (imgElement.complete && imgElement.naturalHeight !== 0) {
      processImage();
  } else {
      // If not loaded, wait for the 'load' event
      imgElement.onload = processImage;
      // Handle potential errors loading the image
      imgElement.onerror = () => {
          console.error("Error loading image:", imgElement.src);
          callback('rgb(100,100,100)'); // Grey fallback on load error
      };
  }
};


function AnimatedCircles() {

  // Image URLs
   const IMAGE_1_URL = "https://picsum.photos/id/10/300/300"; // Mountains / Lake
   const IMAGE_2_URL = "https://picsum.photos/id/1040/300/300"; // Car / Road
   const IMAGE_3_URL = "https://picsum.photos/id/212/300/300"; // Biker

   // Refs to access the image DOM elements
   const imgRef1 = useRef(null);
   const imgRef2 = useRef(null);
   const imgRef3 = useRef(null);

   // State to store the calculated glow colors
   const [glowColor1, setGlowColor1] = useState('rgba(100,100,100,0.4)'); // Default grey glow
   const [glowColor2, setGlowColor2] = useState('rgba(100,100,100,0.4)');
   const [glowColor3, setGlowColor3] = useState('rgba(100,100,100,0.4)');

   // Effect to calculate average colors once images are potentially loaded
   useEffect(() => {
    if (imgRef1.current) {
        // Important: Add crossorigin="anonymous" to img tags if loading from external domains like picsum.photos
        // Otherwise, canvas pixel manipulation will fail due to CORS policy.
        getAverageColor(imgRef1.current, (avgColor) => setGlowColor1(`${avgColor.replace(')', ', 0.5)').replace('rgb', 'rgba')}`)); // Add alpha
    }
    if (imgRef2.current) {
        getAverageColor(imgRef2.current, (avgColor) => setGlowColor2(`${avgColor.replace(')', ', 0.5)').replace('rgb', 'rgba')}`));
    }
    if (imgRef3.current) {
        getAverageColor(imgRef3.current, (avgColor) => setGlowColor3(`${avgColor.replace(')', ', 0.5)').replace('rgb', 'rgba')}`));
    }
   }, []); // Run once on mount

  // Define the base classes common to all images
  const baseImageClasses = "absolute rounded-full object-cover";

  return (
    // Container MUST be relative for absolute positioning of children
    // Need a minimum height to contain the circles, especially on mobile.
    // Increased min-height slightly to accommodate larger circles
     <div className="relative w-full min-h-[320px] md:min-h-[370px] lg:min-h-[420px] p-4">

       {/* Circle 1 */}
       {/* NOTE: Added crossorigin="anonymous" for CORS compatibility */}
       <img
         ref={imgRef2} // Use ref for the correct image
         src={IMAGE_2_URL}
         alt="Scenic car trip"
         crossOrigin="anonymous" // REQUIRED for canvas analysis of external images
         className={`${baseImageClasses} animate-move-1`}
         // Apply dynamic glow style using the state variable
         // Increased blur (25px) and spread (15px) for wider glow
         style={{ boxShadow: `0 0 25px 15px ${glowColor2}` }}
        />

       {/* Circle 2 */}
        <img
         ref={imgRef3} // Use ref for the correct image
         src={IMAGE_3_URL}
         alt="Mountain Biker"
         crossOrigin="anonymous"
         className={`${baseImageClasses} animate-move-2`}
         // Increased blur (25px) and spread (15px) for wider glow
         style={{ boxShadow: `0 0 25px 15px ${glowColor3}` }}
        />

       {/* Circle 3 */}
         <img
         ref={imgRef1} // Use ref for the correct image
         src={IMAGE_1_URL}
         alt="Friends viewing mountains"
         crossOrigin="anonymous"
         className={`${baseImageClasses} animate-move-3`}
         // Increased blur (25px) and spread (15px) for wider glow
         style={{ boxShadow: `0 0 25px 15px ${glowColor1}` }}
        />

    </div>
  );
}

export default AnimatedCircles;
