import imageCompression from "browser-image-compression";

const OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
};

/**
 * Compresses an image File before upload using browser-image-compression.
 * Handles EXIF orientation, resizes to 1280px max, caps at 1MB.
 * Falls back to the original file if compression fails.
 */
export async function compressImage(file, options = {}) {
  try {
    return await imageCompression(file, { ...OPTIONS, ...options });
  } catch {
    return file;
  }
}
