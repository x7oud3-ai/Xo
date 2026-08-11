import { convertFileToBase64 } from '../data/avatars';

/**
 * Uploads an image file to ImgBB via backend server proxy or direct fallback
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  // 1. Prepare/Resize the image to a lightweight base64 string first
  const base64Data = await convertFileToBase64(file);

  try {
    // 2. Try proxying through the backend server endpoint
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Data }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Backend upload proxy error, attempting direct ImgBB fallback...', err);
  }

  // 3. Fallback: Direct upload to ImgBB API from client
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const formData = new URLSearchParams();
    formData.append('image', cleanBase64);

    const directRes = await fetch('https://api.imgbb.com/1/upload?key=d015dd34e005b5dd56d68d2fe147c267', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const directData = await directRes.json();
    if (directData.success && directData.data?.url) {
      return directData.data.url;
    }
  } catch (directErr) {
    console.error('Direct ImgBB upload failed:', directErr);
  }

  // 4. Safe fallback: return processed base64 data URL if network fails
  return base64Data;
}
