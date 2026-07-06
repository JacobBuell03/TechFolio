import LZString from 'lz-string';

/**
 * Encode portfolio data into a shareable URL hash.
 * Uses LZ compression + base64 to keep the URL as short as possible.
 */
export function encodePortfolio(data) {
  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodePortfolio(encoded) {
  try {
    // Try LZ-compressed first (new format)
    const lz = LZString.decompressFromEncodedURIComponent(encoded);
    if (lz) return JSON.parse(lz);
    // Fall back to old base64 format for existing shared links
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Shrink a base64 photo to a smaller thumbnail for sharing */
function shrinkPhoto(dataUrl, maxSize = 120) {
  return new Promise(resolve => {
    if (!dataUrl) return resolve('');
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

export async function buildShareUrl(data) {
  // Strip legacy PDF blob fields, shrink photo for URL
  const { resume, resumeName, photo, ...restProfile } = data.profile || {};
  const smallPhoto = await shrinkPhoto(photo, 120);
  const shareable = {
    ...data,
    profile: { ...restProfile, photo: smallPhoto },
  };
  const encoded = encodePortfolio(shareable);
  const base = window.location.origin + window.location.pathname;
  return `${base}#/portfolio/${encoded}`;
}

export function parseShareHash(hash) {
  const match = hash.match(/^#\/portfolio\/(.+)$/);
  if (!match) return null;
  return decodePortfolio(match[1]);
}
