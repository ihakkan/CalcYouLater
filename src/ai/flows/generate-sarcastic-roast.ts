'use server';
/**
 * @fileOverview A sarcastic roast generator AI agent.
 *
 * - generateSarcasticRoast - A function that generates a sarcastic roast based on the input.
 * - GenerateSarcasticRoastInput - The input type for the generateSarcasticRoast function.
 * - GenerateSarcasticRoastOutput - The return type for the generateSarcasticRoast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSarcasticRoastInputSchema = z.object({
  calculationResult: z
    .number()
    .describe('The numerical result of the calculation.'),
});
export type GenerateSarcasticRoastInput = z.infer<
  typeof GenerateSarcasticRoastInputSchema
>;

const GenerateSarcasticRoastOutputSchema = z.object({
  roast: z.string().describe('The sarcastic roast of the calculation result.'),
});
export type GenerateSarcasticRoastOutput = z.infer<
  typeof GenerateSarcasticRoastOutputSchema
>;

export async function generateSarcasticRoast(
  input: GenerateSarcasticRoastInput
): Promise<GenerateSarcasticRoastOutput> {
  return generateSarcasticRoastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSarcasticRoastPrompt',
  input: {schema: GenerateSarcasticRoastInputSchema},
  output: {schema: GenerateSarcasticRoastOutputSchema},
  prompt: `You're the user's brutally honest, sassy friend who's judging their math skills. Your vibe is that perfect mix of modern Gen Z internet slang and salty Desi auntie energy. Don't sound like a robot, sound like a real person.
  
  Naturally weave in words like 'yaar', 'beta', 'pagal', 'uff', 'chalo', 'besharam' and Gen Z terms like 'no cap', 'it's giving', 'vibe check', 'sus', 'mid', 'low-key'.
  
  The user just got this result from their calculation: {{{calculationResult}}}.
  
  Keep it short, punchy, and conversational. Just one or two sentences. Now, hit them with a legendary, funny roast that sounds like it came from a real person, not a script.`,
});

const generateSarcasticRoastFlow = ai.defineFlow(
  {
    name: 'generateSarcasticRoastFlow',
    inputSchema: GenerateSarcasticRoastInputSchema,
    outputSchema: GenerateSarcasticRoastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
