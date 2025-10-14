"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from 'lucide-react';
import styles from "./DoMyHomeworkGame.module.css";

interface DoMyHomeworkGameProps {
  onFlip: () => void;
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
  
  const [problems, setProblems] = useState<any[]>([]);
  const [powerUps, setPowerUps] = useState<any[]>([]);

  const synth = useRef<SpeechSynthesis | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  const playSound = useCallback((type: 'correct' | 'incorrect' | 'powerup' | 'start') => {
    if (!audioContext.current) return;
    const context = audioContext.current;
    const o = context.createOscillator();
    const g = context.createGain();
    o.connect(g);
    g.connect(context.destination);

    if (type === 'correct') {
      o.frequency.setValueAtTime(600, context.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, context.currentTime);
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.3);
    } else if (type === 'incorrect') {
      o.type = 'square';
      o.frequency.setValueAtTime(150, context.currentTime);
      g.gain.setValueAtTime(0.1, context.currentTime);
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
    } else if (type === 'powerup') {
        o.frequency.setValueAtTime(600, context.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.2);
        g.gain.setValueAtTime(0.1, context.currentTime);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.2);
    } else if (type === 'start') {
        o.frequency.setValueAtTime(261.63, context.currentTime);
        g.gain.setValueAtTime(0.1, context.currentTime);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.2);
    }

    o.start(context.currentTime);
    o.stop(context.currentTime + 0.5);
  }, []);

  const createProblem = useCallback(() => {
    const operators = ['+', '-', '*', '/'];
    let operator = operators[Math.floor(Math.random() * Math.min(level, 4))];
    let a, b, answer;

    if (operator === '+') {
      a = Math.floor(Math.random() * (level * 10));
      b = Math.floor(Math.random() * (level * 10));
      answer = a + b;
    } else if (operator === '-') {
      a = Math.floor(Math.random() * (level * 10));
      b = Math.floor(Math.random() * a); // ensure positive result
      answer = a - b;
    } else if (operator === '*') {
      a = Math.floor(Math.random() * (level + 1)) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      answer = a * b;
    } else { // division
      b = Math.floor(Math.random() * (level + 1)) + 1;
      answer = Math.floor(Math.random() * 9) + 1;
      a = b * answer;
    }

    return { a, b, operator, answer, text: `${a} ${operator} ${b}` };
  }, [level]);

  const speak = useCallback((text: string) => {
    if (!synth.current || !running) return;
    const utterance = new SpeechSynthesisUtterance(text.replace('*', 'times').replace('/', 'divided by'));
    utterance.rate = 1.2;
    synth.current.speak(utterance);
  }, [running]);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(5);
    setLevel(1);
    setProblems([]);
    setPowerUps([]);
    setGameOver(false);
    setRunning(true);
    playSound('start');
  }, [playSound]);
  
  const handleAnswerSubmit = useCallback(() => {
    if (!answerInputRef.current) return;
    const userAnswer = parseInt(answerInputRef.current.value, 10);
    if (isNaN(userAnswer)) return;

    let wasCorrect = false;
    let answeredId: number | null = null;
    
    const remainingProblems = problems.filter(p => {
        if (!wasCorrect && p.answer === userAnswer) {
            wasCorrect = true;
            answeredId = p.id;
            // Mark for popping animation, but remove it from the next state
            setProblems(currentProblems => currentProblems.map(cp => cp.id === p.id ? {...cp, popping: true} : cp));
            return false; 
        }
        return true;
    });

    if (wasCorrect) {
        setScore(s => s + 10);
        playSound('correct');
        // Let the pop animation play, then remove the element
        setTimeout(() => {
            setProblems(currentProblems => currentProblems.filter(p => p.id !== answeredId));
        }, 300);
    } else {
        playSound('incorrect');
        setLives(l => Math.max(0, l - 1));
    }
    
    if (answerInputRef.current) {
        answerInputRef.current.value = '';
    }
  }, [problems, playSound]);


  useEffect(() => {
    if (!running || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move problems down
      setProblems(prev =>
        prev.map(p => ({ ...p, y: p.y + 1 })).filter(p => {
          if (p.y > 100 && !p.popping) {
            setLives(l => Math.max(0, l - 1));
            return false;
          }
          return true;
        })
      );
      // Move powerups down
      setPowerUps(prev =>
        prev.map(p => ({ ...p, y: p.y + 1 })).filter(p => p.y <= 100)
      );

      // Add new problems
      if (Math.random() < 0.02 + level * 0.005) {
        const newProblem = createProblem();
        setProblems(prev => [...prev, { ...newProblem, x: Math.random() * 80, y: 0, id: Date.now(), popping: false }]);
        speak(newProblem.text);
      }
      
      // Level up
      if (score > level * 100) {
        setLevel(l => l + 1);
      }

    }, 100);

    return () => clearInterval(gameLoop);
  }, [running, gameOver, createProblem, speak, score, level]);

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
    if (gameOver) {
      resetGame();
    } else {
      setRunning(true);
      playSound('start');
    }
    answerInputRef.current?.focus();
  };

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

  return (
    <Card className={`w-full h-full overflow-hidden ${styles.gameContainer}`}>
      <CardHeader className="flex-row items-center justify-between p-4" style={{backgroundColor: '#4a90e2', borderBottom: '4px solid #357ABD'}}>
        <div className="w-1/4">
             <Button variant="ghost" size="icon" onClick={onFlip} aria-label="Back to Calculator">
                <Calculator className="h-6 w-6 text-white" />
            </Button>
        </div>
        <div className="w-1/2 text-center">
            <CardTitle className="font-headline text-xl font-bold text-white whitespace-nowrap" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>
                Do My Homework
            </CardTitle>
        </div>
        <div className="w-1/4" />
      </CardHeader>
      <CardContent className="h-full flex flex-col p-0">
        <div className={styles.stats}>
          <span>Score: {score}</span>
           <div className={styles.lifeCounter}>
             <span className={styles.heartIcon}>❤️</span>
             <span className="font-bold text-lg">{lives}</span>
           </div>
          <span>Level: {level}</span>
        </div>
        <div ref={playfieldRef} className={styles.playfield}>
          {!running && (
            <div className={styles.overlay}>
              {gameOver ? (
                <div>
                  <h2>Game Over!</h2>
                  <p>Final Score: {score}</p>
                  <Button onClick={startGame} style={{backgroundColor: '#50e3c2', color: 'white', fontSize: '1.2rem', padding: '1rem 2rem'}}>Play Again</Button>
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
            <div key={p.id} className={`${styles.problem} ${p.popping ? styles.popping : ''}`} style={{ top: `${p.y}%`, left: `${p.x}%` }}>
              {p.text}
            </div>
          ))}
        </div>
        <div className={styles.controls}>
          <Input
            ref={answerInputRef}
            type="number"
            placeholder="Your answer..."
            onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
            disabled={!running}
            suppressHydrationWarning
            style={{textAlign: 'center', fontSize: '1.1rem'}}
          />
          <Button onClick={handleAnswerSubmit} disabled={!running} style={{backgroundColor: '#7ed321', color: 'white', fontWeight: 'bold', fontSize: '1.1rem'}}>Enter</Button>
        </div>
      </CardContent>
    </Card>
  );
};
