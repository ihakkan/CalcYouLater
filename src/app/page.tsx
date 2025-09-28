import Calculator from '@/components/calculator';

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-sm">
        <Calculator />
      </div>
    </main>
  );
}
