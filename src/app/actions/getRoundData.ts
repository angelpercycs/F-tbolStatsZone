
'use server';
import { supabase } from '@/lib/supabase';
import { getMatchesByDate } from './getMatches';

export async function getCountries() {
    const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching countries:', error);
        return { data: null, error: `Error de Supabase: ${error.message}` };
    }
    return { data, error: null };
}

export async function getLeaguesByCountry(countryId: string) {
    const { data, error } = await supabase
        .from('leagues')
        .select('id, name, season')
        .eq('country_id', countryId)
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching leagues:', error);
        return { data: null, error: `Error de Supabase: ${error.message}` };
    }

    const leaguesWithSeasons = data.map(league => {
        return {
            id: `${league.id}-${league.season}`,
            name: `${league.name} (${league.season})`,
            league_id: league.id,
            season: league.season
        };
    });

    return { data: leaguesWithSeasons, error: null };
}

export async function getRoundsForLeague(leagueId: string, season: string) {
    const { data, error } = await supabase
        .from('matches')
        .select('matchday')
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('matchday', { ascending: true });

    if (error) {
        console.error('Error fetching rounds:', error);
        return { data: null, error: `Error de Supabase: ${error.message}` };
    }

    const uniqueRounds = [...new Set(data.map(match => match.matchday).filter(Boolean))].sort((a,b) => {
        const numA = parseInt(a.toString().match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.toString().match(/\d+/)?.[0] || '0');
        return numA - numB;
    });

    return { data: uniqueRounds, error: null };
}

export async function getMatchesByRound(leagueId: string, season: string, round: string) {
    const { data: roundMatches, error } = await supabase
        .from('matches')
        .select('match_date')
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('matchday', round)
        .order('match_date', { ascending: false });

    if (error || !roundMatches || roundMatches.length === 0) {
        console.error('Could not find matches for the selected round', error);
        return { data: [], error: "No se encontraron partidos para la jornada seleccionada." };
    }

    const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`*, match_date_iso:match_date`)
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('matchday', round)
        .order('match_date', { ascending: true });

    if (matchesError) {
        return { data: null, error: `Error de Supabase al buscar partidos: ${matchesError.message}` };
    }

    const dates = matchesData.map(m => new Date(m.match_date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    minDate.setUTCHours(0, 0, 0, 0);
    maxDate.setUTCHours(23, 59, 59, 999);

    const result = await getMatchesByDate(minDate.toISOString(), maxDate.toISOString());

    if (result.error) return result;
    
    const filteredMatches = result.data.filter((m: any) => 
        m.league_id.toString() === leagueId.toString() && 
        m.season.toString() === season.toString() && 
        m.matchday && m.matchday.toString() === round.toString()
    );
    
    return { data: filteredMatches, error: null };
}
