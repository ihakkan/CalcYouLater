export const easterEggJokes: { [key: number]: string } = {
  69: "Nice. Noice. Noice.",
  1337: "Leet... is that still a thing? Okay boomer.",
  420: "Vibe check passed. Now back to the math.",
  80085: "Heh, classic. Now get your mind out of the gutter, you Besharam.",
  143: "I love you too, but let's focus on the numbers.",
  9001: "IT'S OVER 9000! Bet you feel powerful now.",
};

export const localJokes: string[] = [
  "This is giving... major 'needs a tutor' energy.",
  "That calculation was so basic, my nani could do it on her fingers.",
  "Are you even trying? It's not giving what you think it's giving.",
  "The answer is right, but the vibes are off.",
  "Okay, and? What's the main character moment here?",
  "Low-key a mid calculation, not gonna lie.",
  "Did you really need a calculator for that? Sus.",
  "No cap, that was the most boring math I've ever done.",
  "Chalo, at least you got an answer. I guess.",
];

export function getRandomJoke(): string {
  if (typeof window === 'undefined') {
    return localJokes[0];
  }
  return localJokes[Math.floor(Math.random() * localJokes.length)];
}
