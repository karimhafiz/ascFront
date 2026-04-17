const OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
};

export async function compressImage(file, options = {}) {
  try {
    const { default: imageCompression } = await import("browser-image-compression");
    return await imageCompression(file, { ...OPTIONS, ...options });
  } catch {
    return file;
  }
}
