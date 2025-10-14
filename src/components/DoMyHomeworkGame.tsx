"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Volume2, VolumeX, Delete } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(false);
  
  const [problems, setProblems] = useState<any[]>([]);
  const [powerUps, setPowerUps] = useState<any[]>([]);
  const [answerValue, setAnswerValue] = useState("");

  const synth = useRef<SpeechSynthesis | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  const playSound = useCallback((type: 'correct' | 'incorrect' | 'powerup' | 'start' | 'pop' | 'click') => {
    if (!audioContext.current) return;
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
      b = Math.floor(Math.random() * a);
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
    const playfield = playfieldRef.current;
    const problemWidth = 100;
    const maxPx = playfield ? playfield.clientWidth - problemWidth : 300;
    const x = Math.random() * maxPx;

    return { a, b, operator, answer, text: `${a} ${operator} ${b}`, x, y: 0, id: Date.now(), popping: false };
  }, [level]);

  const speak = useCallback((text: string) => {
    if (!synth.current || !running || isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text.replace('*', 'times').replace('/', 'divided by'));
    utterance.rate = 1.2;
    synth.current.speak(utterance);
  }, [running, isMuted]);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(5);
    setLevel(1);
    setProblems([]);
    setPowerUps([]);
    setGameOver(false);
    setRunning(true);
    playSound('start');
    setAnswerValue("");
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

  const handleKeyClick = (key: string) => {
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
  };

  useEffect(() => {
    if (!running || gameOver) return;

    const gameLoop = setInterval(() => {
      setProblems(prev =>
        prev.map(p => ({ ...p, y: p.y + 1 })).filter(p => {
          if (p.y > 100 && !p.popping) {
            setLives(l => Math.max(0, l - 1));
            return false;
          }
          return true;
        })
      );
      setPowerUps(prev =>
        prev.map(p => ({ ...p, y: p.y + 1 })).filter(p => p.y <= 100)
      );

      if (Math.random() < 0.02 + level * 0.005) {
        const newProblem = createProblem();
        setProblems(prev => [...prev, newProblem]);
        speak(newProblem.text);
      }
      
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

  const upperRowKeys = ['1', '2', '3', '4', '5'];
  const lowerRowKeys = ['6', '7', '8', '9', '0'];

  return (
    <Card className={`w-full h-full overflow-hidden ${styles.gameContainer}`}>
      <CardHeader className="flex-row items-center justify-between p-2 sm:p-4" style={{backgroundColor: '#4a90e2', borderBottom: '4px solid #357ABD'}}>
        <div className="w-1/4">
             <Button variant="ghost" size="icon" onClick={onFlip} aria-label="Back to Calculator">
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
            <div key={p.id} className={`${styles.problem} ${p.popping ? styles.popping : ''}`} style={{ top: `${p.y}%`, left: `${p.x}px` }}>
              {p.text}
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
            disabled={!running}
            suppressHydrationWarning
            className="pointer-events-none"
            style={{textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold'}}
          />
          <Button onClick={handleAnswerSubmit} disabled={!running} style={{backgroundColor: '#7ed321', color: 'white', fontWeight: 'bold', fontSize: '1.1rem'}}>Enter</Button>
        </div>
        <div className={styles.keypad}>
            <div className="grid grid-cols-6 gap-2">
                {upperRowKeys.map(key => (
                    <Button key={key} variant="outline" className={styles.keypadKey} onClick={() => handleKeyClick(key)}>{key}</Button>
                ))}
                <Button variant="destructive" className={styles.keypadKey} onClick={() => handleKeyClick('del')}><Delete size={20}/></Button>
            </div>
            <div className="grid grid-cols-6 gap-2 mt-2">
                {lowerRowKeys.map(key => (
                    <Button key={key} variant="outline" className={styles.keypadKey} onClick={() => handleKeyClick(key)}>{key}</Button>
                ))}
                <Button variant="outline" className={styles.keypadKey} onClick={() => handleKeyClick('.')}>.</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
