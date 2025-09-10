# AI or Human? - A Content Analysis Tool

This is an advanced Next.js application built in Firebase Studio that determines whether a piece of content (text, image, or video) is AI-generated or human-created.

## Key Features

*   **Multi-Content Analysis**: You can analyze three different types of media to determine their origin:
    *   **Text**: Paste in any text to see if it was written by an AI or a human.
    *   **Images**: Upload an image or provide a URL to check if it's AI-generated. It includes support for various formats, including `.avif` by converting it on the client.
    *   **Videos**: Upload a video or provide a URL to analyze for AI generation.

*   **Advanced Analysis Dashboard**: The results are presented in a clean, data-driven dashboard that includes:
    *   **AI vs. Human Determination**: A clear verdict on whether the content is likely AI-generated or human-created.
    *   **Confidence Score**: A percentage indicating the model's confidence in its determination.
    *   **Detailed Breakdown**: In-depth analysis covering aspects like visual artifacts, linguistic patterns, or temporal inconsistencies, presented in an easy-to-navigate accordion.

*   **Editing Tool Detection**: For images classified as human-created, the tool will analyze for signs of digital manipulation and suggest which editing software (like Photoshop, GIMP, etc.) might have been used.

*   **Dynamic Model Likelihood**: The report dynamically identifies which specific AI models (e.g., Midjourney, DALL-E 3, Gemini, Sora, Veo) were most likely used to generate the content, along with a likelihood percentage for each.

*   **Robust Input Options**:
    *   Supports **drag-and-drop** and standard file-picking for uploads.
    *   Handles remote content via **URL** for images and videos.
    *   Includes built-in file size limits (10MB for images, 50MB for videos) and user-friendly toast notifications to guide users.

*   **Modern & Responsive UI/UX**: The application features a professional, clean design that is fully responsive and provides an optimal viewing experience on desktops, tablets, and mobile devices. It's built with Next.js, TypeScript, Tailwind CSS, and ShadCN UI components.

*   **Genkit AI Backend**: The analysis is powered by Google's Genkit, using advanced models like Gemini to provide state-of-the-art content analysis.
