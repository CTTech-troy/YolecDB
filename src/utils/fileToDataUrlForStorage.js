const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Invalid read result'));
    };
    reader.onerror = () => reject(reader.error || new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export async function fileToDataUrlForStorage(file) {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Choose an image file');
  }

  if (typeof createImageBitmap !== 'function') {
    return readFileAsDataURL(file);
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return readFileAsDataURL(file);
  }

  try {
    let w = bitmap.width;
    let h = bitmap.height;
    const maxDim = Math.max(w, h);
    if (maxDim > MAX_EDGE) {
      const scale = MAX_EDGE / maxDim;
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return readFileAsDataURL(file);
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const out = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    if (out && out.length > 500) return out;
  } catch {
    bitmap.close?.();
  }

  return readFileAsDataURL(file);
}
