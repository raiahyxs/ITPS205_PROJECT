import React, { useEffect, useRef, useState } from 'react';

// Helper function to get the average color of an image element
// This function is used for the glow effect and remains the same.
const getAverageColor = (imgElement, componentName, callback) => {
  const processImage = () => {
    const canvas = document.createElement('canvas');
    const sampleSize = 100;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      console.error(`${componentName}: Failed to get 2D context for image color averaging. Img src:`, imgElement ? imgElement.src : "Unknown image");
      callback('rgb(100,100,100)');
      return;
    }
    try {
      ctx.clearRect(0, 0, sampleSize, sampleSize); // Clear canvas before drawing
      ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;
      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;
      if (pixelCount === 0) {
        console.warn(`${componentName}: Image data is empty for color averaging. Src:`, imgElement.src);
        callback('rgb(100,100,100)');
        return;
      }
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2];
      }
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);
      // console.log(`${componentName}: Avg color for ${imgElement.src}: rgb(${r},${g},${b})`);
      callback(`rgb(${r},${g},${b})`);
    } catch (e) {
      console.error(`${componentName}: Error in getAverageColor (CORS issue?). Src:`, imgElement.src, "Error:", e);
      callback('rgb(100,100,100)');
    }
  };

  if (!imgElement) {
    console.error(`${componentName}: getAverageColor called with null imgElement.`);
    callback('rgb(100,100,100)');
    return;
  }

  if (imgElement.complete && imgElement.naturalHeight !== 0 && imgElement.naturalWidth !== 0) {
    // console.log(`${componentName}: Image already complete. Src:`, imgElement.src);
    processImage();
  } else if (imgElement.complete && (imgElement.naturalHeight === 0 || imgElement.naturalWidth === 0)) {
    console.error(`${componentName}: Image loaded but has 0 dimensions (broken link?). Src:`, imgElement.src);
    callback('rgb(100,100,100)');
  } else {
    // console.log(`${componentName}: Image not loaded, setting listeners. Src:`, imgElement.src);
    const loadListener = () => { /* console.log(`${componentName}: Image loaded via listener. Src:`, imgElement.src); */ processImage(); cleanup(); };
    const errorListener = () => { console.error(`${componentName}: Error loading image via listener. Src:`, imgElement.src); callback('rgb(100,100,100)'); cleanup(); };
    const cleanup = () => {
      imgElement.removeEventListener('load', loadListener);
      imgElement.removeEventListener('error', errorListener);
    };
    imgElement.addEventListener('load', loadListener);
    imgElement.addEventListener('error', errorListener);
  }
};

function AnimatedRectangles() {
  const componentName = "AnimatedRectangles";
  // Image URLs - these will be displayed as rectangles.
  // The actual display dimensions are controlled by the Tailwind keyframes.
  const IMAGE_1_URL = "https://picsum.photos/id/1018/400/300"; // Landscape
  const IMAGE_2_URL = "https://picsum.photos/id/1028/400/300"; // Deer
  const IMAGE_3_URL = "https://picsum.photos/id/1041/400/300"; // Boat

  const imgRef1 = useRef(null);
  const imgRef2 = useRef(null);
  const imgRef3 = useRef(null);

  const [glowColor1, setGlowColor1] = useState('rgba(100,100,100,0.4)');
  const [glowColor2, setGlowColor2] = useState('rgba(100,100,100,0.4)');
  const [glowColor3, setGlowColor3] = useState('rgba(100,100,100,0.4)');

  useEffect(() => {
    // Log to confirm useEffect is running and refs are available
    console.log(`${componentName}: useEffect running. Refs:`, imgRef1.current, imgRef2.current, imgRef3.current);
    if (imgRef1.current) {
      getAverageColor(imgRef1.current, componentName, (avgColor) => setGlowColor1(`${avgColor.replace(')', ', 0.5)').replace('rgb', 'rgba')}`));
    } else { console.warn(`${componentName}: imgRef1.current is null in useEffect`); }
    if (imgRef2.current) {
      getAverageColor(imgRef2.current, componentName, (avgColor) => setGlowColor2(`${avgColor.replace(')', ', 0.5)').replace('rgb', 'rgba')}`));
    } else { console.warn(`${componentName}: imgRef2.current is null in useEffect`); }
    if (imgRef3.current) {
      getAverageColor(imgRef3.current, componentName, (avgColor) => setGlowColor3(`${avgColor.replace(')', ', 0.5)').replace('rgb', 'rgba')}`));
    } else { console.warn(`${componentName}: imgRef3.current is null in useEffect`); }
  }, []);

  // Base classes for the images. `rounded-xl` makes the corners suitable for rectangles.
  // `object-cover` ensures the image covers the area defined by width/height from keyframes.
  const baseImageClasses = "absolute rounded-xl object-cover shadow-lg transform-gpu";

  return (
    // Container for the animation. Sized to fit the largest animated state.
    // The border is for debugging and can be removed.
    <div className="relative w-[25rem] h-[20rem] p-4 border-2 border-dashed border-red-500">
      <img
        ref={imgRef1}
        src={IMAGE_1_URL}
        alt="Animated decorative rectangle 1"
        crossOrigin="anonymous" // Important for fetching pixel data from external images
        className={`${baseImageClasses} animate-rect-move-1`} // Applies the rectangular animation
        style={{ boxShadow: `0 0 25px 15px ${glowColor1}` }}
      />
      <img
        ref={imgRef2}
        src={IMAGE_2_URL}
        alt="Animated decorative rectangle 2"
        crossOrigin="anonymous"
        className={`${baseImageClasses} animate-rect-move-2`} // Applies the rectangular animation
        style={{ boxShadow: `0 0 25px 15px ${glowColor2}` }}
      />
      <img
        ref={imgRef3}
        src={IMAGE_3_URL}
        alt="Animated decorative rectangle 3"
        crossOrigin="anonymous"
        className={`${baseImageClasses} animate-rect-move-3`} // Applies the rectangular animation
        style={{ boxShadow: `0 0 25px 15px ${glowColor3}` }}
      />
    </div>
  );
}
export default AnimatedRectangles;
