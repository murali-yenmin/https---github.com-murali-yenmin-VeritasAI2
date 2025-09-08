import { AIHumanDetector } from '@/components/ai-human-detector';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
            AI or Human?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image of a face and our advanced AI will determine if the person is real or computer-generated.
          </p>
        </div>
      </header>
      <main className="flex-grow flex items-start justify-center p-4">
        <AIHumanDetector />
      </main>
      <footer className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI or Human? All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
