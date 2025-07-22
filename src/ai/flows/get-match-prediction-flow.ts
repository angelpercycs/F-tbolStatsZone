
'use server';
/**
 * @fileOverview A flow to generate a prediction for a football match.
 *
 * - getMatchPrediction - A function that generates a prediction for a given match.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { 
    MatchPredictionInput,
    MatchPredictionOutput,
    StandingsSchema
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
    
    const checkWinnerConditions = (
        overall: z.infer<typeof StandingsSchema>,
        last3: z.infer<typeof StandingsSchema>,
        last3HomeAway: z.infer<typeof StandingsSchema>,
        homeAwayStandings: z.infer<typeof StandingsSchema>
    ) => {
        // Condition 0: Handle division by zero for played games
        if (overall.played === 0 || homeAwayStandings.played === 0) return false;

        // Condition 1: Mínimo de Partidos Jugados
        if (overall.played < 9) return false;

        // Condition 2: Buena Defensa Reciente (General)
        if (last3.goalsAgainst >= 3) return false;
        
        // Condition 3: Buen Ataque Reciente (General)
        if (last3.goalsFor <= 2) return false;

        // Condition 4: Buena Racha como Local/Visitante (Defensa y Ataque)
        if (last3HomeAway.goalsAgainst >= 3 || last3HomeAway.goalsFor <= 2) return false;
        
        // Condition 5: Porcentaje de Victorias Sólido (General)
        if ((overall.won / overall.played) * 100 <= 45) return false;

        // Condition 6: Pocas Derrotas como Local/Visitante
        if ((homeAwayStandings.lost / homeAwayStandings.played) * 100 >= 35) return false;

        // Condition 7: Balance de goles positivo en general
        if (overall.goalsFor <= overall.goalsAgainst) return false;

        // Condition 8: Racha positiva reciente como Local/Visitante
        if (last3HomeAway.won <= last3HomeAway.lost) return false;
        
        // Si todas las condiciones se cumplen
        return true;
    };
    
    const team1IsPotentialWinner = checkWinnerConditions(
        input.team1_standings,
        input.team1_last_3,
        input.team1_last_3_home_away,
        input.team1_standings.home || input.team1_standings
    );

    const team2IsPotentialWinner = checkWinnerConditions(
        input.team2_standings,
        input.team2_last_3,
        input.team2_last_3_home_away,
        input.team2_standings.away || input.team2_standings
    );

    // Si solo uno de los dos equipos cumple
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

    // Si ambos o ninguno cumplen, no hay predicción
    return {
        has_prediction: false,
    };
  }
);
