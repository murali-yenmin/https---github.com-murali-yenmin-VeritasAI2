import { AIHumanDetector } from '@/components/ai-human-detector';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary tracking-tight">
            AI or Human?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Upload an image, video, or paste text. Our advanced AI will determine if it's real or computer-generated.
          </p>
        </div>
      </header>
      <main className="flex-grow flex items-start justify-center p-4 sm:px-6 lg:px-8">
        <AIHumanDetector />
      </main>
      <footer className="py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VeritasAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
