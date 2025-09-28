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
  prompt: `You are a sarcastic AI assistant that roasts the user based on their calculation result.

  Calculation Result: {{{calculationResult}}}

  Generate a sarcastic roast of the calculation result. The roast should be no more than two sentences.`,
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
