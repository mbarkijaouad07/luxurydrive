/**
 * Formats a number as Moroccan Dirham (DH)
 * Uses en-US locale for comma-separated thousands: 3,000 DH
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string e.g. "3,000 DH"
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 DH';
  const num = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(num)) return '0 DH';
  return `${num.toLocaleString('en-US')} DH`;
};

/**
 * Safely extracts a single image URL from various formats (Array, JSON string, or single string)
 * @param {Array|string} images - The images data
 * @param {boolean} fallback - Whether to return a placeholder if no image is found
 * @returns {string} The image URL or placeholder
 */
export const getImageUrl = (images, fallback = true) => {
  let url = null;
  
  try {
    if (Array.isArray(images)) {
      url = images[0];
    } else if (typeof images === 'string' && images) {
      if (images.startsWith('[') || images.startsWith('{')) {
        const parsed = JSON.parse(images);
        url = Array.isArray(parsed) ? parsed[0] : parsed;
      } else {
        url = images;
      }
    }
  } catch (err) {
    console.error('Error parsing image URL:', err);
  }

  if (!url && fallback) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800';
  }
  
  return url;
};
