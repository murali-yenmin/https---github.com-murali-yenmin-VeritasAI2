'use server';

export async function mediaUrlToDataUri(url: string) {
  if (!url || !url.startsWith('http')) {
    return { error: 'Please enter a valid URL.' };
  }
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
      const text = await response.text();
      // Heuristic to detect if it's a webpage
      if (text.trim().toLowerCase().includes('<html')) {
         return { error: 'The URL points to a webpage, not a direct image or video file. Please provide a direct link to the media.'};
      }
      return { error: `Unsupported or missing content type: '${contentType}'. Please provide a direct URL to an image or video file.` };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { dataUri: `data:${contentType};base64,${base64}` };
  } catch (error: any) {
    console.error('Error converting URL to data URI:', error);
    // Avoid leaking internal implementation details
    if (error.message.includes('fetch')) {
        return { error: 'Could not fetch media from the provided URL. Please check the URL and try again.' };
    }
    return { error: error.message || 'An unknown error occurred while fetching the URL.' };
  }
}
