
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
    
    const checkWinnerCondition = (
        overall, 
        last3, 
        last3HomeAway, 
        homeAwayStandings
    ) => {
        if (!overall || !last3 || !last3HomeAway || !homeAwayStandings) return false;
        if (overall.played === 0 || homeAwayStandings.played === 0) return false;

        const meetsMinPlayed = overall.played >= 9;
        const goodRecentDefense = last3.goalsAgainst < 3;
        const goodRecentAttack = last3.goalsFor > 2;
        const goodHomeAwayStreak = last3HomeAway.goalsAgainst < 3 && last3HomeAway.goalsFor > 2;
        const solidWinRate = (overall.won / overall.played) * 100 > 45;
        const fewVenueLosses = (homeAwayStandings.lost / homeAwayStandings.played) * 100 < 35;
        
        return meetsMinPlayed && goodRecentDefense && goodRecentAttack && goodHomeAwayStreak && solidWinRate && fewVenueLosses;
    };
    
    const team1IsPotentialWinner = checkWinnerCondition(
        input.team1_standings, 
        input.team1_last_3,
        input.team1_last_3_home_away,
        input.team1_standings?.home
    );

    const team2IsPotentialWinner = checkWinnerCondition(
        input.team2_standings,
        input.team2_last_3,
        input.team2_last_3_home_away,
        input.team2_standings?.away
    );

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

    return {
        has_prediction: false,
    };
  }
);
