'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setIsPromptVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    
    // The type for BeforeInstallPromptEvent is not standard so we cast to any
    (installPromptEvent as any).prompt();

    (installPromptEvent as any).userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPromptEvent(null);
      setIsPromptVisible(false);
    });
  };

  const handleDismissClick = () => {
    setIsPromptVisible(false);
  }

  if (!isPromptVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-50">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="font-headline text-primary">Install CalcYouLater</CardTitle>
                <CardDescription>Get the full roasted experience, offline and on your homescreen!</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Tired of our sass? Install the app so we can roast you anytime, anywhere. It's fast, works offline, and is probably smarter than your last calculation.</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleDismissClick}>Not Now</Button>
                <Button onClick={handleInstallClick}>
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
};

export default InstallPrompt;
