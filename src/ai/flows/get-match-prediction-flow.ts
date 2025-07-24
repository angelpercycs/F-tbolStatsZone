
'use server';
/**
 * @fileOverview A flow to generate a prediction for a football match.
 *
 * - getMatchPrediction - A function that generates a prediction for a given match.
 */

import { ai } from '@/ai/genkit';
import type { 
    MatchPredictionInput,
    MatchPredictionOutput
} from '@/ai/schemas/match-prediction-schemas';
import {
    MatchPredictionInputSchema, 
    MatchPredictionOutputSchema
} from '@/ai/schemas/match-prediction-schemas';


export async function getMatchPrediction(
  input: MatchPredictionInput
): Promise<MatchPredictionOutput> {
  return getMatchPredictionFlow(input);
}

const getMatchPredictionFlow = ai.defineFlow(
  {
    name: 'getMatchPredictionFlow',
    inputSchema: MatchPredictionInputSchema,
    outputSchema: MatchPredictionOutputSchema,
  },
  async (input) => {
    
    // Simplified diagnostic check
    const checkWinnerCondition = (standings) => {
        if (!standings || standings.played === 0) return false;
        const winPercentage = (standings.won / standings.played) * 100;
        return winPercentage > 40;
    };
    
    const team1IsPotentialWinner = checkWinnerCondition(input.team1_standings);
    const team2IsPotentialWinner = checkWinnerCondition(input.team2_standings);

    // If only one of the two teams meets the simplified condition
    if (team1IsPotentialWinner && !team2IsPotentialWinner) {
        return {
            has_prediction: true,
            prediction_text: `Hay una probabilidad de victoria para ${input.team1Name} basado en su rendimiento superior.`,
            winner_name: input.team1Name,
            probability: 50,
        };
    }
    
    if (!team1IsPotentialWinner && team2IsPotentialWinner) {
       return {
            has_prediction: true,
            prediction_text: `Hay una probabilidad de victoria para ${input.team2Name} basado en su rendimiento superior.`,
            winner_name: input.team2Name,
            probability: 50,
        };
    }

    // If both or neither meet the condition, no prediction
    return {
        has_prediction: false,
    };
  }
);

