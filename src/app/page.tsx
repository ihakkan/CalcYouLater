import Calculator from '@/components/calculator';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-between bg-background p-4 antialiased">
      <div />
      <div className="w-full max-w-sm">
        <Calculator />
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
