import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AiDentify - AI Content Analysis Tool',
  description:
    'Instantly determine if an image is AI-generated or a real human with AiDentify. Our advanced tool provides detailed analysis and confidence scores.',
  keywords:
    'AI image detector, human or AI, AI-generated image analysis, AiDentify, image authenticity, deepfake detection',
  openGraph: {
    title: 'AiDentify - AI Content Analysis Tool',
    description:
      'Instantly determine if an image is AI-generated or a real human with AiDentify. Our advanced tool provides detailed analysis and confidence scores.',
    url: 'https://aidentify.vercel.app/',
    siteName: 'AiDentify',
    images: [
      {
        url: 'https://aidentify.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AiDentify - AI Content Analysis Tool',
    description:
      'Instantly determine if an image is AI-generated or a real human with AiDentify. Our advanced tool provides detailed analysis and confidence scores.',
    creator: '@aidentify',
    images: ['https://aidentify.vercel.app/og-image.png'],
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://aidentify.vercel.app/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
