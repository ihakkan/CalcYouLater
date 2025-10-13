import Calculator from '@/components/calculator';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-sm">
        <Calculator />
      </div>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        If you don't like it just hate him{' '}
        <a
          href="https://hakkan.is-a.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary hover:underline"
        >
          Hakkan
        </a>
      </footer>
    </main>
  );
}
