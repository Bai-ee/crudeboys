export function loadImages() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.onerror = function() {
      console.warn(`Failed to load image: ${img.src}`);
      // Optionally set a fallback image
      img.src = 'path/to/fallback-image.png';
    };
  });
}

// Import and use in script.js
import { loadImages } from './imageLoader.js';
document.addEventListener('DOMContentLoaded', loadImages); 