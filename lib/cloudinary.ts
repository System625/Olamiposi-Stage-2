const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;


if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.error('Missing Cloudinary configuration. Please check your environment variables.');
}

export async function uploadToCloudinary(file: string): Promise<string> {
  try {
    
    console.log('Cloudinary Config:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET
    });

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Missing Cloudinary configuration. Please check your environment variables.');
    }

    const base64Response = await fetch(file);
    if (!base64Response.ok) {
      throw new Error('Failed to process image file');
    }
    const blob = await base64Response.blob();

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log('Uploading to:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    console.log('Cloudinary Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });
    
    if (!response.ok) {
      console.error('Cloudinary API Error:', data);
      throw new Error(`Upload failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.secure_url) {
      throw new Error('No secure URL received from Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export function generateBarcodeUrl(text: string): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Missing Cloudinary configuration');
  }
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/text/co_rgb:FFFFFF,w_200/b_rgb:0E464F/l_text:Arial_14:${encodeURIComponent(text)},co_white,g_north,y_5/l_text:Arial_14_bold:${encodeURIComponent(text)},co_white,g_south,y_5/c_scale,w_200/fl_text_no_trim/e_gen_barcode`;
} 
