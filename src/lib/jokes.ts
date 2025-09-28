export const easterEggJokes: { [key: number]: string } = {
  69: "Nice.",
  1337: "Wow, such an elite calculator. You must be a hax0r.",
  420: "Blaze it! But maybe after you're done with math.",
  80085: "Heh, you found the classic. Now get your mind out of the gutter.",
  143: "I love you too, but let's focus on the numbers.",
  9001: "It's over 9000!",
};

export const localJokes: string[] = [
  "I've seen abacuses with more processing power.",
  "Are you sure you're pressing the right buttons? Or just any buttons?",
  "This calculation is so simple, my cousin's smart-toaster could do it.",
  "Congratulations, you've successfully completed a task a 5-year-old could do.",
  "Was that... supposed to be impressive?",
  "I'm not saying it's a bad result, but I'm also not not saying it.",
  "Your math skills are... developing.",
  "Calculation complete. Don't strain yourself.",
  "There's the number. Now what?",
];

export function getRandomJoke(): string {
  if (typeof window === 'undefined') {
    return localJokes[0];
  }
  return localJokes[Math.floor(Math.random() * localJokes.length)];
}
