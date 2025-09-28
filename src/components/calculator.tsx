'use client';

import { useState, useMemo } from 'react';
import { Divide, Minus, Plus, X, Bot, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIRoast } from '@/app/actions';
import { easterEggJokes, getRandomJoke } from '@/lib/jokes';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

type Operator = '+' | '-' | '*' | '/';

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [expression, setExpression] = useState('');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  
  const [response, setResponse] = useState<string | null>(null);
  const [isRoastLoading, setIsRoastLoading] = useState(false);
  const { toast } = useToast();

  const handleDigitInput = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const handleDecimalInput = () => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const performCalculation = (first: number, second: number, op: Operator): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return first / second;
      default: return second;
    }
  };

  const handleOperatorInput = (nextOperator: Operator) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      setExpression(prev => prev.slice(0, -2) + ` ${nextOperator} `);
      return;
    }
    
    setExpression(prev => `${prev} ${displayValue} ${nextOperator}`);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation(firstOperand, inputValue, operator);
      const resultString = String(result);
      setDisplayValue(resultString);
      setFirstOperand(result);
      checkAndSetResponse(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    if (operator === null || firstOperand === null) return;
    
    const secondOperand = parseFloat(displayValue);

    if (operator === '/' && secondOperand === 0) {
        toast({
            variant: "destructive",
            title: "Math Error",
            description: "You can't divide by zero, you silly goose.",
        });
        return;
    }
    
    const result = performCalculation(firstOperand, secondOperand, operator);
    const resultString = String(result);

    setDisplayValue(resultString);
    setExpression('');
    setFirstOperand(result); // Allow chaining operations
    checkAndSetResponse(result);
    setOperator(null);
    setWaitingForSecondOperand(true);
  };
  
  const checkAndSetResponse = (result: number) => {
    if (easterEggJokes[result]) {
      setResponse(easterEggJokes[result]);
    } else {
      setResponse(getRandomJoke());
    }
  }

  const handleClear = () => {
    setDisplayValue('0');
    setExpression('');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setResponse(null);
  };

  const handleRoast = async () => {
    setIsRoastLoading(true);
    setResponse(null);
    try {
      const result = firstOperand !== null && waitingForSecondOperand ? firstOperand : parseFloat(displayValue);
      if (isNaN(result)) {
        setResponse("Give me a number to work with first, genius.");
        return;
      }
      const roast = await getAIRoast({ calculationResult: result });
      setResponse(roast);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Overload",
        description: "The AI is too tired to roast you. Try again later.",
      });
    } finally {
      setIsRoastLoading(false);
    }
  };

  const canRoast = useMemo(() => {
    const value = firstOperand !== null && waitingForSecondOperand ? firstOperand : parseFloat(displayValue);
    return !isNaN(value);
  }, [displayValue, firstOperand, waitingForSecondOperand]);
  
  const buttons = [
    { label: 'C', onClick: handleClear, className: 'bg-muted text-muted-foreground hover:bg-muted/80 col-span-2' },
    { label: '*', onClick: () => handleOperatorInput('*'), variant: 'accent', icon: X },
    { label: '/', onClick: () => handleOperatorInput('/'), variant: 'accent', icon: Divide },
    { label: '7', onClick: () => handleDigitInput('7'), variant: 'secondary' },
    { label: '8', onClick: () => handleDigitInput('8'), variant: 'secondary' },
    { label: '9', onClick: () => handleDigitInput('9'), variant: 'secondary' },
    { label: '-', onClick: () => handleOperatorInput('-'), variant: 'accent', icon: Minus },
    { label: '4', onClick: () => handleDigitInput('4'), variant: 'secondary' },
    { label: '5', onClick: () => handleDigitInput('5'), variant: 'secondary' },
    { label: '6', onClick: () => handleDigitInput('6'), variant: 'secondary' },
    { label: '+', onClick: () => handleOperatorInput('+'), variant: 'accent', icon: Plus },
    { label: '1', onClick: () => handleDigitInput('1'), variant: 'secondary' },
    { label: '2', onClick: () => handleDigitInput('2'), variant: 'secondary' },
    { label: '3', onClick: () => handleDigitInput('3'), variant: 'secondary' },
    { label: '=', onClick: handleEquals, className: 'row-span-2', variant: 'primary' },
    { label: '0', onClick: () => handleDigitInput('0'), className: 'col-span-2', variant: 'secondary' },
    { label: '.', onClick: handleDecimalInput, variant: 'secondary' },
  ];

  return (
    <>
      <Card className="w-full max-w-sm overflow-hidden border-2 shadow-2xl shadow-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-primary">RoastCalc</CardTitle>
          <CardDescription>Your sassy calculating companion.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-muted p-4 text-right">
            <div className="h-6 text-muted-foreground text-xl break-all truncate text-right">
                {expression || ' '}
            </div>
            <p className="font-headline text-5xl font-bold text-foreground break-all" style={{lineHeight: '1.2'}}>
              {parseFloat(displayValue).toLocaleString('en-US', {maximumFractionDigits: 8})}
            </p>
          </div>
          <div className="grid grid-cols-4 grid-rows-5 gap-2">
             {buttons.map(btn => {
                const ButtonIcon = btn.icon;
                return (
                  <Button
                    key={btn.label}
                    onClick={btn.onClick}
                    className={cn('h-16 text-2xl font-bold', btn.className)}
                    variant={(btn.variant as any) || 'default'}
                    aria-label={btn.label}
                  >
                   {ButtonIcon ? <ButtonIcon className="h-7 w-7"/> : btn.label}
                  </Button>
                )
             })}
          </div>
          <Button onClick={handleRoast} disabled={isRoastLoading || !canRoast} className="w-full mt-4 h-14 text-lg font-bold" variant="outline">
            <Bot className="mr-2 h-6 w-6"/> {isRoastLoading ? 'Thinking of a good one...' : 'Get Roasted by AI'}
          </Button>
        </CardContent>
      </Card>
      
      {(response || isRoastLoading) && (
        <Card className="mt-4 w-full max-w-sm animate-in fade-in-50 slide-in-from-bottom-5">
            <CardFooter className="p-4">
                {isRoastLoading ? (
                    <div className="flex items-center space-x-3 w-full">
                        <Skeleton className="h-10 w-10 rounded-full bg-accent/30" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px] bg-muted" />
                            <Skeleton className="h-4 w-[150px] bg-muted" />
                        </div>
                    </div>
                ) : (
                    <p className="font-body text-center text-base italic text-muted-foreground w-full">
                        &ldquo;{response}&rdquo;
                    </p>
                )}
            </CardFooter>
        </Card>
      )}
    </>
  );
};

export default Calculator;
