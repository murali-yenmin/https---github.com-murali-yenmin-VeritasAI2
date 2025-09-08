'use server';

export async function mediaUrlToDataUri(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/*,video/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media from URL: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || (!contentType.startsWith('image/') && !contentType.startsWith('video/'))) {
      // Check if the body is HTML, often a sign of a webpage instead of a direct media link
      const text = await response.text();
      if (text.trim().toLowerCase().startsWith('<!doctype html')) {
         throw new Error('The URL points to a webpage, not a direct image or video file. Please provide a direct link to the media.');
      }
      throw new Error(`Unsupported or missing content type: '${contentType}'. Please provide a direct URL to an image or video file.`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { dataUri: `data:${contentType};base64,${base64}` };
  } catch (error: any) {
    console.error('Error converting URL to data URI:', error);
    return { error: error.message || 'An unknown error occurred while fetching the URL.' };
  }
}
