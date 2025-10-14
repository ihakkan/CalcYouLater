'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Divide, Minus, Plus, X, Delete } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { easterEggJokes, getRandomJoke } from '@/lib/jokes';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import InstallPrompt from '@/components/install-prompt';

type Operator = '+' | '-' | '*' | '/';

const funnyResponses = [
  "Bro idk 💀",
  "Math? Nah fam.",
  "Try harder 😂",
  "42. Always 42.",
  "Skill issue.",
  "Ask Siri lol.",
  "Nope 😏",
  "Brain.exe failed.",
  "Guess it yourself.",
  "Close enough 👍",
  "That’s illegal 💀",
  "Error 404 math.",
  "Touch grass 🌿",
  "Too lazy rn 😴",
  "Bro… really?",
  "Try again, genius.",
  "Not my problem 🤷‍♂️",
  "Just vibe bro 🎶",
  "You wish 😌",
  "Nice try 😂",
  "Wrong but confident!",
  "Even Google gave up.",
  "1+1=window 🪟",
  "Math broke 💥",
  "Ask your teacher 📚"
];


const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [expression, setExpression] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  
  const [isFunnyResponse, setIsFunnyResponse] = useState(false);
  const [actualResult, setActualResult] = useState<number | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize AudioContext on the client after the first user interaction to comply with browser autoplay policies.
    // A separate function `initializeAudio` will be called on the first button press.
  }, []);

  const playClickSound = useCallback(() => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [audioContext]);
  
  const initializeAudio = () => {
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(newAudioContext);
    }
  };

  const handleInteraction = (callback: (...args: any[]) => void) => (...args: any[]) => {
    initializeAudio();
    playClickSound();
    callback(...args);
  };

  const handleDigitInput = useCallback((digit: string) => {
    if (isFunnyResponse) {
      handleClear(false); // don't play sound again
      setDisplayValue(digit);
      return;
    }
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  }, [isFunnyResponse, waitingForSecondOperand, displayValue]);

  const handleDecimalInput = useCallback(() => {
    if (isFunnyResponse) {
      handleClear(false);
      setDisplayValue('0.');
      return;
    }
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  }, [isFunnyResponse, waitingForSecondOperand, displayValue]);

  const performCalculation = (first: number, second: number, op: Operator): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return first / second;
      default: return second;
    }
  };
  
  const checkAndSetResponse = (result: number) => {
    if (isFunnyResponse) return;
    if (easterEggJokes[result]) {
      setResponse(easterEggJokes[result]);
    } else {
      setResponse(getRandomJoke());
    }
  }

  const handleOperatorInput = useCallback((nextOperator: Operator) => {
    if (isFunnyResponse) {
      handleClear(false);
    }
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
        setOperator(nextOperator);
        setExpression(prev => prev.slice(0, -2) + ` ${nextOperator} `);
        return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
      setExpression(`${displayValue} ${nextOperator} `);
    } else if (operator) {
      const result = performCalculation(firstOperand, inputValue, operator);
      const resultString = String(result);
      setDisplayValue(resultString);
      setFirstOperand(result);
      setExpression(`${resultString} ${nextOperator} `);
      checkAndSetResponse(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  }, [displayValue, firstOperand, isFunnyResponse, operator, waitingForSecondOperand]);

  const handleEquals = useCallback(() => {
    if (isFunnyResponse && actualResult !== null) {
      setDisplayValue(String(actualResult));
      setExpression('');
      setFirstOperand(actualResult);
      checkAndSetResponse(actualResult);
      setActualResult(null);
      setIsFunnyResponse(false);
      setOperator(null);
      setWaitingForSecondOperand(false);
      setResponse(getRandomJoke());
      return;
    }

    if (operator === null || firstOperand === null || waitingForSecondOperand) return;
    
    const secondOperand = parseFloat(displayValue);

    if (operator === '/' && secondOperand === 0) {
        toast({
            variant: "destructive",
            title: "Math Error",
            description: "You can't divide by zero. Are you trying to break the universe?",
        });
        return;
    }
    
    const result = performCalculation(firstOperand, secondOperand, operator);
    
    if (Math.random() < 0.9) {
      const funnyResponse = funnyResponses[Math.floor(Math.random() * funnyResponses.length)];
      setDisplayValue(funnyResponse);
      setResponse("Tap '=' again to see the real answer.");
      setIsFunnyResponse(true);
      setActualResult(result);
      setExpression(expression + displayValue);
      return;
    }

    const resultString = String(result);
    setDisplayValue(resultString);
    setExpression('');
    setFirstOperand(null); 
    checkAndSetResponse(result);
    setOperator(null);
    setWaitingForSecondOperand(false);
  }, [isFunnyResponse, actualResult, operator, firstOperand, waitingForSecondOperand, displayValue, expression, toast]);
  
  const handleClear = useCallback((playSound = true) => {
    if (playSound) playClickSound();
    setDisplayValue('0');
    setExpression('');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setResponse(null);
    setIsFunnyResponse(false);
    setActualResult(null);
  }, [playClickSound]);

  const handleBackspace = useCallback(() => {
    if (isFunnyResponse) {
      handleClear(false);
      return;
    }
    if (waitingForSecondOperand) {
      return;
    }
    setDisplayValue(prev => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  }, [isFunnyResponse, waitingForSecondOperand, handleClear]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Initialize audio on the first keydown event
      initializeAudio();
      
      let keyHandled = true;
      if (event.key >= '0' && event.key <= '9') {
        handleDigitInput(event.key);
      } else if (event.key === '.') {
        handleDecimalInput();
      } else if (['+', '-', '*', '/'].includes(event.key)) {
        handleOperatorInput(event.key as Operator);
      } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault(); // Prevent form submission if any
        handleEquals();
      } else if (event.key === 'Backspace') {
        handleBackspace();
      } else if (event.key === 'Escape' || event.key.toLowerCase() === 'c') {
        handleClear(false); // keydown doesn't need the extra sound
      } else {
        keyHandled = false;
      }
      
      if(keyHandled) {
        playClickSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDigitInput, handleDecimalInput, handleOperatorInput, handleEquals, handleBackspace, handleClear, playClickSound]);
  
  const fullExpression = useMemo(() => {
    if(isFunnyResponse) return displayValue;
    if (expression === '') return displayValue;
    if (waitingForSecondOperand) return expression.trim();
    return expression + displayValue;
  }, [expression, displayValue, waitingForSecondOperand, isFunnyResponse]);
  
  const getDisplayFontSize = (text: string) => {
    const length = text.length;
    if (length > 20) return 'text-2xl';
    if (length > 15) return 'text-3xl';
    if (length > 10) return 'text-4xl';
    return 'text-5xl';
  }

  const buttons = [
    { label: 'C', onClick: () => handleClear(false), className: 'bg-muted text-muted-foreground hover:bg-muted/80 col-span-2' },
    { label: '⌫', onClick: handleBackspace, variant: 'accent', icon: Delete },
    { label: '÷', onClick: () => handleOperatorInput('/'), variant: 'accent', icon: Divide },
    { label: '7', onClick: () => handleDigitInput('7'), variant: 'secondary' },
    { label: '8', onClick: () => handleDigitInput('8'), variant: 'secondary' },
    { label: '9', onClick: () => handleDigitInput('9'), variant: 'secondary' },
    { label: '×', onClick: () => handleOperatorInput('*'), variant: 'accent', icon: X },
    { label: '4', onClick: () => handleDigitInput('4'), variant: 'secondary' },
    { label: '5', onClick: () => handleDigitInput('5'), variant: 'secondary' },
    { label: '6', onClick: () => handleDigitInput('6'), variant: 'secondary' },
    { label: '-', onClick: () => handleOperatorInput('-'), variant: 'accent', icon: Minus },
    { label: '1', onClick: () => handleDigitInput('1'), variant: 'secondary' },
    { label: '2', onClick: () => handleDigitInput('2'), variant: 'secondary' },
    { label: '3', onClick: () => handleDigitInput('3'), variant: 'secondary' },
    { label: '+', onClick: () => handleOperatorInput('+'), variant: 'accent', icon: Plus },
    { label: '0', onClick: () => handleDigitInput('0'), className: 'col-span-2', variant: 'secondary' },
    { label: '.', onClick: handleDecimalInput, variant: 'secondary' },
    { label: '=', onClick: handleEquals, variant: 'primary', className: 'bg-primary text-primary-foreground' },
  ];

  return (
    <>
      <InstallPrompt />
      <div className="h-24 mb-4">
        {response && (
            <Card className="w-full max-w-sm animate-in fade-in-0 zoom-in-90 duration-500 fill-mode-both bg-card border-primary">
                <CardFooter className="p-3">
                    <p className="font-headline text-center text-lg font-medium text-primary w-full">
                        &ldquo;{response}&rdquo;
                    </p>
                </CardFooter>
            </Card>
        )}
      </div>

      <Card className="w-full max-w-sm overflow-hidden border-2 shadow-2xl shadow-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-primary">CalcYouLater</CardTitle>
          <CardDescription>The calculator with an attitude.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-muted p-4 text-right flex items-center justify-end h-[76px]">
             <p className={cn("font-headline font-bold text-foreground break-words", getDisplayFontSize(fullExpression))} style={{lineHeight: '1.2'}}>
              {fullExpression}
            </p>
          </div>
          <div className="grid grid-cols-4 grid-rows-5 gap-2">
             {buttons.map(btn => {
                const ButtonIcon = btn.icon;
                return (
                  <Button
                    key={btn.label}
                    onClick={handleInteraction(btn.onClick)}
                    className={cn('h-16 text-2xl font-bold', btn.className)}
                    variant={(btn.variant as any) || 'default'}
                    aria-label={btn.label}
                  >
                   {ButtonIcon ? <ButtonIcon className="h-7 w-7"/> : btn.label}
                  </Button>
                )
             })}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Calculator;
