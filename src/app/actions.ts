'use server';

import { generateSarcasticRoast, type GenerateSarcasticRoastInput } from '@/ai/flows/generate-sarcastic-roast';

export async function getAIRoast(input: GenerateSarcasticRoastInput): Promise<string> {
  try {
    const result = await generateSarcasticRoast(input);
    return result.roast;
  } catch (error) {
    console.error('Error generating AI roast:', error);
    return "My circuits are fried. I can't even roast you properly right now.";
  }
}
