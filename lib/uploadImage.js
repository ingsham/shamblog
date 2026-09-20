'use client';

const MAX_WIDTH = 1800;
const QUALITY = 0.84;
const SKIP_RESIZE_UNDER = 400 * 1024;

function readAsImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    image.src = url;
  });
}

/**
 * Shrinks large photos in the browser before they are sent. Desktop camera
 * files are routinely 6–12 MB, which would be rejected by the upload limit and
 * would slow every reader down.
 */
async function prepare(file) {
  if (file.type === 'image/gif' || file.size < SKIP_RESIZE_UNDER) return file;

  try {
    const image = await readAsImage(file);
    if (image.width <= MAX_WIDTH) return file;

    const scale = MAX_WIDTH / image.width;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (err) {
    return file;
  }
}

export default async function uploadImage(file) {
  const prepared = await prepare(file);
  const form = new FormData();
  form.append('file', prepared);

  const res = await fetch('/api/upload', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'The upload failed.');
  return data.url;
}
