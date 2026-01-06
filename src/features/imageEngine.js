/**
 * Optimizes Cloudinary URLs for fast loading
 * @param {string} url - Original URL from DB
 * @param {number} width - Required width
 * @returns {string} Optimized URL
 */

export const optimizeImage = (url, width = 800) => {
    if (!url) return "/placeholder.png";
    if(!url.includes("cloudinary.com")) return url;

      // URL mein '/upload/' dhoond kar uske baad optimization parameters insert karta hai
  // q_auto: Quality auto-adjust
  // f_auto: Format auto-adjust (WebP/AVIF depending on browser)

    return url.replace("/upload/", `/upload/w_${width},c_fill,g_auto,q_auto,f_auto/`);
};