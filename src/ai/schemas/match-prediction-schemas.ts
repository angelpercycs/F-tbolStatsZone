
/**
 * @fileOverview Schemas and types for match prediction.
 */
import { z } from 'zod';

export const StandingsSchema = z.object({
    played: z.number().default(0),
    won: z.number().default(0),
    drawn: z.number().default(0),
    lost: z.number().default(0),
    goalsFor: z.number().default(0),
    goalsAgainst: z.number().default(0),
    points: z.number().default(0),
    home: z.object({
        played: z.number().default(0),
        won: z.number().default(0),
        drawn: z.number().default(0),
        lost: z.number().default(0),
        goalsFor: z.number().default(0),
        goalsAgainst: z.number().default(0),
        points: z.number().default(0),
    }).optional(),
    away: z.object({
        played: z.number().default(0),
        won: z.number().default(0),
        drawn: z.number().default(0),
        lost: z.number().default(0),
        goalsFor: z.number().default(0),
        goalsAgainst: z.number().default(0),
        points: z.number().default(0),
    }).optional(),
});


export const MatchPredictionInputSchema = z.object({
  team1Name: z.string().describe('The name of the home team.'),
  team2Name: z.string().describe('The name of the away team.'),
  team1_standings: StandingsSchema,
  team2_standings: StandingsSchema,
  team1_last_3: StandingsSchema,
  team2_last_3: StandingsSchema,
  team1_last_3_home_away: StandingsSchema,
  team2_last_3_home_away: StandingsSchema,
});
export type MatchPredictionInput = z.infer<typeof MatchPredictionInputSchema>;

export const MatchPredictionOutputSchema = z.object({
  has_prediction: z.boolean().describe('Whether a prediction is available for this match.'),
  prediction_text: z.string().optional().describe('A brief text explaining the prediction.'),
  winner_name: z.string().optional().describe('The name of the predicted winning team.'),
  probability: z.number().optional().describe('The probability of the prediction, from 0 to 100.'),
});
export type MatchPredictionOutput = z.infer<typeof MatchPredictionOutputSchema>;
