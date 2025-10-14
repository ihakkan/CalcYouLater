'use client';
import { useState } from 'react';
import { Calculator } from '@/components/calculator';
import { DoMyHomeworkGame } from '@/components/DoMyHomeworkGame';
import FlipContainer from '@/components/FlipContainer';

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between bg-background p-4 antialiased">
      <div />
      <div className="w-full max-w-md h-[800px]">
        <FlipContainer
          isFlipped={isFlipped}
          front={<Calculator onFlip={() => setIsFlipped(true)} />}
          back={<DoMyHomeworkGame onFlip={() => setIsFlipped(false)} />}
        />
      </div>
      <footer className="w-full text-center text-sm text-muted-foreground">
        Got a problem with the attitude? Complain to{' '}
        <a
          href="https://hakkan.is-a.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary hover:underline"
        >
          Hakkan
        </a>
        .
      </footer>
    </main>
  );
}
