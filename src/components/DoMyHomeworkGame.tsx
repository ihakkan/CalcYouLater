"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Volume2, VolumeX, Delete, RefreshCw, Gamepad2 } from 'lucide-react';
import styles from "./DoMyHomeworkGame.module.css";

interface DoMyHomeworkGameProps {
  onFlip: () => void;
}

interface Problem {
  text: string;
  answer: number;
  x: number;
  y: number;
  id: number;
  popping: boolean;
}

interface PowerUp {
  type: 'heart';
  id: number;
  x: number;
  y: number;
  popping: boolean;
}

export const DoMyHomeworkGame: React.FC<DoMyHomeworkGameProps> = ({ onFlip }) => {
  const playfieldRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showingLevelUp, setShowingLevelUp] = useState(false);
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [answerValue, setAnswerValue] = useState("");

  const synth = useRef<SpeechSynthesis | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showProTip, setShowProTip] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  const playSound = useCallback((type: 'correct' | 'incorrect' | 'powerup' | 'start' | 'pop' | 'click' | 'win') => {
    if (isMuted || !audioContext.current) return;
    const context = audioContext.current;
    const o = context.createOscillator();
    const g = context.createGain();
    o.connect(g);
g.connect(context.destination);
    g.gain.setValueAtTime(0.1, context.currentTime);

    if (type === 'correct') {
      o.frequency.setValueAtTime(600, context.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.3);
    } else if (type === 'incorrect') {
      o.type = 'square';
      o.frequency.setValueAtTime(150, context.currentTime);
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
    } else if (type === 'powerup') {
        o.frequency.setValueAtTime(600, context.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.2);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.2);
    } else if (type === 'start') {
        o.frequency.setValueAtTime(261.63, context.currentTime);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.2);
    } else if (type === 'pop') {
      o.type = 'sine';
      o.frequency.setValueAtTime(1200, context.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
    } else if (type === 'click') {
        o.type = 'sine';
        o.frequency.setValueAtTime(440, context.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
    } else if (type === 'win') {
        o.frequency.setValueAtTime(523.25, context.currentTime);
        o.frequency.linearRampToValueAtTime(1046.50, context.currentTime + 0.2);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
    }

    o.start(context.currentTime);
    o.stop(context.currentTime + 0.5);
  }, [isMuted]);

  const createProblem = useCallback(() => {
    let text: string;
    let answer: number;
    let a, b, c;

    const currentLevel = level > 10 ? 10 : level;

    // Level 1-2: Basic addition/subtraction
    if (currentLevel <= 2) {
      const operator = Math.random() > 0.5 ? '+' : '-';
      a = Math.floor(Math.random() * (currentLevel * 10)) + 1;
      b = Math.floor(Math.random() * (currentLevel * 10)) + 1;
      if (operator === '-') {
        if (a < b) [a, b] = [b, a]; // ensure positive result
        answer = a - b;
      } else {
        answer = a + b;
      }
      text = `${a} ${operator} ${b}`;
    } 
    // Level 3-4: Multiplication and simple division
    else if (currentLevel <= 4) {
      const operator = Math.random() > 0.5 ? '*' : '/';
      if (operator === '*') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * (currentLevel * 2)) + 1;
        answer = a * b;
        text = `${a} × ${b}`;
      } else {
        b = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 9) + 2;
        a = b * answer;
        text = `${a} ÷ ${b}`;
      }
    }
    // Level 5-6: Decimal addition/subtraction
    else if (currentLevel <= 6) {
        const operator = Math.random() > 0.5 ? '+' : '-';
        a = parseFloat((Math.random() * 20).toFixed(1));
        b = parseFloat((Math.random() * 20).toFixed(1));
        if (operator === '-') {
            if (a < b) [a, b] = [b, a];
            answer = parseFloat((a - b).toFixed(1));
        } else {
            answer = parseFloat((a + b).toFixed(1));
        }
        text = `${a} ${operator} ${b}`;
    }
    // Level 7-8: Problems with brackets
    else if (currentLevel <= 8) {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        c = Math.floor(Math.random() * 5) + 2;
        const operator = Math.random() > 0.5 ? '+' : '-';
        if(operator === '+') {
          text = `(${a} + ${b}) × ${c}`;
          answer = (a + b) * c;
        } else {
          if (a < b) [a, b] = [b, a];
          text = `(${a} - ${b}) × ${c}`;
          answer = (a - b) * c;
        }
    }
    // Level 9-10: Simple algebra (find x)
    else {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 15) + 1; // This is 'x'
        c = answer + b;
        text = `x + ${b} = ${c}`;
    }

    const playfield = playfieldRef.current;
    const problemWidth = 100;
    const maxPx = playfield ? playfield.clientWidth - problemWidth : 300;
    const x = Math.random() * maxPx;

    return { text, answer, x, y: 0, id: Date.now(), popping: false };
  }, [level]);

  const speak = useCallback((text: string) => {
    if (!synth.current || !running || isMuted || !isMounted) return;
    const utterance = new SpeechSynthesisUtterance(text.replace('*', 'times').replace('/', 'divided by').replace('x', 'ex'));
    utterance.rate = 1.2;
    synth.current.speak(utterance);
  }, [running, isMuted, isMounted]);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(5);
    setLevel(1);
    setProblems([]);
    setPowerUps([]);
    setGameOver(false);
    setShowWinScreen(false);
    setShowProTip(true);
    playSound('start');
    setAnswerValue("");
    setTimeout(() => {
        setShowProTip(false);
        setShowingLevelUp(true);
        setTimeout(() => {
            setShowingLevelUp(false);
            setRunning(true);
        }, 1500);
    }, 2500); // Show tip for 2.5 seconds
  }, [playSound]);
  
  const handleAnswerSubmit = useCallback(() => {
    if (answerValue === "") return;
    const userAnswer = parseFloat(answerValue);
    if (isNaN(userAnswer)) return;

    const problemToSolve = problems.find(p => p.answer === userAnswer);

    if (problemToSolve) {
        setProblems(currentProblems => currentProblems.map(cp => cp.id === problemToSolve.id ? {...cp, popping: true} : cp));
        
        playSound('pop');
        setScore(s => s + 10);
        
        setTimeout(() => {
            setProblems(currentProblems => currentProblems.filter(p => p.id !== problemToSolve.id));
        }, 300);
    } else {
        playSound('incorrect');
        setLives(l => Math.max(0, l - 1));
    }
    
    setAnswerValue("");
  }, [problems, playSound, answerValue]);

  const handleKeyClick = useCallback((key: string) => {
    playSound('click');
    if (key === 'del') {
      setAnswerValue(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!answerValue.includes('.')) {
        setAnswerValue(prev => prev + key);
      }
    } else {
      setAnswerValue(prev => prev + key);
    }
  }, [playSound, answerValue]);

  const handlePowerUpClick = (powerUpId: number) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp) return;

    if (powerUp.type === 'heart') {
      setLives(l => l + 1);
    }
    
    setPowerUps(currentPowerUps => currentPowerUps.map(p => p.id === powerUpId ? {...p, popping: true} : p));
    playSound('powerup');
    
    setTimeout(() => {
        setPowerUps(currentPowerUps => currentPowerUps.filter(p => p.id !== powerUpId));
    }, 300);
  }

  useEffect(() => {
    if (!running || gameOver || showingLevelUp || !isMounted) return;

    const gameLoop = setInterval(() => {
      setProblems(prev =>
        prev.map(p => ({ ...p, y: p.y + (1 + level * 0.05) })).filter(p => {
          if (p.y > 100 && !p.popping) {
            setLives(l => Math.max(0, l - 1));
            return false;
          }
          return true;
        })
      );
      setPowerUps(prev =>
        prev.map(p => ({ ...p, y: p.y + 1 })).filter(p => {
          if (p.y > 100 && !p.popping) {
              return false;
          }
          return p.y <= 100;
        })
      );

      const maxProblems = level < 5 ? 3 : 1;

      // Add new problem
      if (problems.length < maxProblems && Math.random() < 0.02 + level * 0.005) {
        const newProblem = createProblem();
        setProblems(prev => [...prev, newProblem]);
        if(isMounted) speak(newProblem.text);
      }

      // Add new heart power-up
      if (Math.random() < 0.005) { // Lower chance for hearts
        const playfield = playfieldRef.current;
        const maxPx = playfield ? playfield.clientWidth - 40 : 300;
        const x = Math.random() * maxPx;
        setPowerUps(prev => [...prev, {type: 'heart', id: Date.now(), x, y: 0, popping: false}]);
      }
      
    }, 100);

    return () => clearInterval(gameLoop);
  }, [running, gameOver, createProblem, speak, score, level, showingLevelUp, problems.length, isMounted]);

  // Level up logic
  useEffect(() => {
    if (score > 0 && score >= level * 100) {
        if (level === 10) {
            setRunning(false);
            setShowWinScreen(true);
            playSound('win');
        } else {
            setRunning(false);
            setLevel(l => l + 1);
            setShowingLevelUp(true);
            setTimeout(() => {
                setShowingLevelUp(false);
                setRunning(true);
            }, 1500);
        }
    }
  }, [score, level, playSound]);

  useEffect(() => {
    if (lives <= 0) {
      setRunning(false);
      setGameOver(true);
    }
  }, [lives]);
  
  const startGame = () => {
    if (typeof window !== 'undefined' && !audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (gameOver || showWinScreen) {
      resetGame();
    } else {
      setRunning(true);
      playSound('start');
    }
    answerInputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!running) return;

      if (event.key >= '0' && event.key <= '9') {
        handleKeyClick(event.key);
      } else if (event.key === '.') {
        handleKeyClick('.');
      } else if (event.key === 'Backspace') {
        handleKeyClick('del');
      } else if (event.key === 'Enter') {
        handleAnswerSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [running, handleAnswerSubmit, handleKeyClick]);

  if (!isMounted) {
    return (
        <Card className={`w-full h-full overflow-hidden ${styles.gameContainer}`}>
            <CardHeader className="flex-row items-center justify-center text-center p-4">
                <CardTitle className="font-headline text-2xl" style={{color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>Do My Homework</CardTitle>
            </CardHeader>
             <CardContent className="h-full flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Loading Game...</p>
            </CardContent>
        </Card>
    );
  }

  const upperRowKeys = ['1', '2', '3', '4', '5'];
  const lowerRowKeys = ['6', '7', '8', '9', '0'];

  return (
    <Card className={`w-full h-full overflow-hidden ${styles.gameContainer}`}>
      <CardHeader className="flex-row items-center justify-between p-2 sm:p-4" style={{backgroundColor: '#4a90e2', borderBottom: '4px solid #357ABD'}}>
        <div className="w-1/4">
             <Button variant="ghost" size="icon" onClick={onFlip} aria-label="Back to Calculator">
                <RefreshCw className="h-5 w-5 text-white mr-1" />
                <Calculator className="h-6 w-6 text-white" />
            </Button>
        </div>
        <div className="w-auto text-center">
            <CardTitle className="font-headline text-lg sm:text-xl font-bold text-white whitespace-nowrap" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>
                Do My Homework
            </CardTitle>
        </div>
        <div className="w-1/4 flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsMuted(m => !m)} aria-label="Mute/Unmute TTS">
              {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full flex flex-col p-0">
        <div className={styles.stats}>
          <span className="text-yellow-300 font-bold">Score: {score}</span>
           <div className={styles.lifeCounter}>
             <span className={styles.heartIcon}>❤️</span>
             <span className="font-bold text-lg text-white drop-shadow-lg">{lives}</span>
           </div>
          <span className="text-green-300 font-bold">Level: {level}</span>
        </div>
        <div ref={playfieldRef} className={styles.playfield}>
          {(gameOver || showingLevelUp || showWinScreen || showProTip) && (
            <div className={styles.overlay}>
              {gameOver ? (
                <div>
                  <h2 style={{color: '#e53e3e', textShadow: '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 0, 0, 0.6)'}}>Game Over!</h2>
                  <p>Final Score: {score}</p>
                  <Button onClick={startGame} style={{backgroundColor: '#50e3c2', color: 'white', fontSize: '1.2rem', padding: '1rem 2rem'}}>Play Again</Button>
                </div>
              ) : showWinScreen ? (
                <div className="text-center">
                  <h2 className={`${styles.levelUpTitle} text-yellow-400`} style={{animation: 'none'}}>🎉 You Win! 🎉</h2>
                  <p className="my-4 text-lg font-bold">All levels completed! You beat this shitty game. You're a true king!</p>
                  <Button onClick={startGame} style={{backgroundColor: '#50e3c2', color: 'white', fontSize: '1.2rem', padding: '1rem 2rem'}}>Play Again</Button>
                </div>
              ) : showingLevelUp ? (
                <div>
                  <h2 className={styles.levelUpTitle}>Level {level}</h2>
                </div>
              ) : showProTip ? (
                 <div>
                    <h2 className="text-2xl font-bold text-blue-500 mb-2">Pro Tip:</h2>
                    <p className="text-lg">Collect ❤️ by tapping them to increase lives!</p>
                </div>
              ) : (
                <div>
                    <h2>Falling Math!</h2>
                    <p>Solve the problems before they hit the bottom.</p>
                    <Button onClick={startGame} style={{backgroundColor: '#50e3c2', color: 'white', fontSize: '1.2rem', padding: '1rem 2rem'}}>Start Game</Button>
                </div>
              )}
            </div>
          )}
          {problems.map(p => (
            <div key={p.id} className={`${styles.problem} ${p.popping ? styles.popping : ''}`} style={{ top: `${p.y}%`, left: `${p.x}px` }}>
              {p.text}
            </div>
          ))}
          {powerUps.map(p => (
            <div key={p.id} onClick={() => handlePowerUpClick(p.id)} className={`${styles.powerUp} ${p.popping ? styles.popping : ''}`} style={{ top: `${p.y}%`, left: `${p.x}px` }}>
              ❤️
            </div>
          ))}
        </div>
        <div className={styles.controls}>
          <Input
            ref={answerInputRef}
            type="text"
            placeholder="Your answer..."
            value={answerValue}
            readOnly
            disabled={!running || showingLevelUp}
            suppressHydrationWarning
            className="pointer-events-none text-center text-xl font-bold bg-white/80"
          />
          <Button onClick={handleAnswerSubmit} disabled={!running || showingLevelUp} style={{backgroundColor: '#7ed321', color: 'white', fontWeight: 'bold', fontSize: '1.1rem'}}>Enter</Button>
        </div>
        <div className={styles.keypad}>
            <div className="grid grid-cols-6 gap-2">
                {upperRowKeys.map(key => (
                    <Button key={key} data-key-type="number" className={styles.keypadKey} onClick={() => handleKeyClick(key)}>{key}</Button>
                ))}
                <Button data-key-type="delete" className={styles.keypadKey} onClick={() => handleKeyClick('del')}><Delete size={20}/></Button>
            </div>
            <div className="grid grid-cols-6 gap-2 mt-2">
                {lowerRowKeys.map(key => (
                    <Button key={key} data-key-type="number" className={styles.keypadKey} onClick={() => handleKeyClick(key)}>{key}</Button>
                ))}
                <Button data-key-type="decimal" className={styles.keypadKey} onClick={() => handleKeyClick('.')}>.</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
