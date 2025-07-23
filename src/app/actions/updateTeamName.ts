
'use server';
import { supabase } from '@/lib/supabase';

/**
 * Updates the name of a team given its ID.
 * @param teamId The unique ID of the team to update.
 * @param newName The new name for the team.
 * @returns An object indicating success or an error.
 */
export async function updateTeamName(teamId: string, newName: string) {
    if (!teamId || !newName) {
        return { data: null, error: 'Team ID and new name are required.' };
    }

    try {
        // This is the core logic for updating a row:
        // 1. .from('teams'): Select the 'teams' table.
        // 2. .update({ name: newName }): Specify the new data for the columns you want to change.
        // 3. .eq('id', teamId): Specify WHICH row to update by matching its unique 'id'.
        const { data, error } = await supabase
            .from('teams')
            .update({ name: newName })
            .eq('id', teamId)
            .select(); // .select() returns the updated row, which is good practice.

        if (error) {
            console.error('Supabase error updating team name:', error);
            return { data: null, error: `Supabase error: ${error.message}` };
        }

        if (!data || data.length === 0) {
            return { data: null, error: `Team with ID ${teamId} not found.` };
        }

        console.log('Team updated successfully:', data[0]);
        return { data: data[0], error: null };

    } catch (e: any) {
        console.error('Unexpected error updating team name:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}
