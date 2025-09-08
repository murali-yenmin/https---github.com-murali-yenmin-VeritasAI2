'use server';

export async function mediaUrlToDataUri(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch media from URL: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType) {
      throw new Error('Could not determine content type from URL.');
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { dataUri: `data:${contentType};base64,${base64}` };
  } catch (error: any) {
    console.error('Error converting URL to data URI:', error);
    return { error: error.message || 'An unknown error occurred.' };
  }
}
