
// @ts-nocheck
'use server';
import { supabase } from '@/lib/supabase';
import { getMatchPrediction } from '@/ai/flows/get-match-prediction-flow';
import type { MatchPredictionOutput } from '@/ai/schemas/match-prediction-schemas';

async function getTeamStandings(teamId, season, league_id, matchDate) {
    if (!teamId || !season || !league_id) return null;
    const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .eq('season', season)
        .eq('league_id', league_id)
        .lt('match_date', matchDate)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .filter('team1_score', 'not.is', null)
        .filter('team2_score', 'not.is', null);

    if (matchesError) {
        console.error(`Error fetching matches for team ${teamId}:`, matchesError);
        return null;
    }

    const stats = {
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
        home: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
        away: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    };

    if (!allMatches) return stats;

    for (const match of allMatches) {
        const isHome = match.team1_id === teamId;
        const teamScore = isHome ? match.team1_score : match.team2_score;
        const opponentScore = isHome ? match.team2_score : match.team1_score;

        const venueStats = isHome ? stats.home : stats.away;
        venueStats.played++;
        venueStats.goalsFor += teamScore;
        venueStats.goalsAgainst += opponentScore;

        if (teamScore > opponentScore) {
            venueStats.won++;
            venueStats.points += 3;
        } else if (teamScore === opponentScore) {
            venueStats.drawn++;
            venueStats.points += 1;
        } else {
            venueStats.lost++;
        }
    }
    
    stats.played = stats.home.played + stats.away.played;
    stats.won = stats.home.won + stats.away.won;
    stats.drawn = stats.home.drawn + stats.away.drawn;
    stats.lost = stats.home.lost + stats.away.lost;
    stats.goalsFor = stats.home.goalsFor + stats.away.goalsFor;
    stats.goalsAgainst = stats.home.goalsAgainst + stats.away.goalsAgainst;
    stats.points = stats.home.points + stats.away.points;

    return stats;
}

async function getLastNMatchesStandings(teamId, season, league_id, isHome, matchDate, limit = 3) {
    const defaultStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
     if (!teamId || !season || !league_id) return { all: defaultStats, homeAway: defaultStats };
    
    let query = supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .eq('season', season)
        .eq('league_id', league_id)
        .lt('match_date', matchDate)
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .filter('team1_score', 'not.is', null)
        .filter('team2_score', 'not.is', null)
        .order('match_date', { ascending: false })
        .limit(limit);

    const { data: lastMatches, error: matchesError } = await query;
    
    if (matchesError) {
        console.error(`Error fetching last ${limit} matches for team ${teamId}:`, matchesError);
        return { all: defaultStats, homeAway: defaultStats };
    }

    const calculateStats = (matches, forHome) => {
        const stats = { ...defaultStats };
        if (!matches) return stats;
        for (const match of matches) {
            const teamIsHomeInMatch = match.team1_id === teamId;
            if (forHome !== null && forHome !== teamIsHomeInMatch) {
                continue;
            }
            stats.played++;
            const teamScore = teamIsHomeInMatch ? match.team1_score : match.team2_score;
            const opponentScore = teamIsHomeInMatch ? match.team2_score : match.team1_score;

            stats.goalsFor += teamScore;
            stats.goalsAgainst += opponentScore;

            if (teamScore > opponentScore) {
                stats.won++; stats.points += 3;
            } else if (teamScore === opponentScore) {
                stats.drawn++; stats.points += 1;
            } else {
                stats.lost++;
            }
        }
        return stats;
    };
    
    const allStats = calculateStats(lastMatches, null);
    
    let homeAwayQuery = supabase
        .from('matches')
        .select('team1_id, team2_id, team1_score, team2_score')
        .eq('season', season)
        .eq('league_id', league_id)
        .lt('match_date', matchDate)
        .filter('team1_score', 'not.is', null)
        .filter('team2_score', 'not.is', null)
        .order('match_date', { ascending: false });


    if (isHome) {
        homeAwayQuery = homeAwayQuery.eq('team1_id', teamId).limit(limit);
    } else {
        homeAwayQuery = homeAwayQuery.eq('team2_id', teamId).limit(limit);
    }
    
    const { data: lastHomeAwayMatches, error: homeAwayError } = await homeAwayQuery;

    if(homeAwayError){
         console.error(`Error fetching last ${limit} home/away matches for team ${teamId}:`, homeAwayError);
    }

    const homeAwayStats = calculateStats(lastHomeAwayMatches, isHome);
    
    return { all: allStats, homeAway: homeAwayStats };
}


export async function getMatchesByDate(startDate, endDate) {
    try {
        const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`*, match_date_iso:match_date`)
            .gte('match_date', startDate)
            .lte('match_date', endDate)
            .order('league_id', { ascending: true })
            .order('match_date', { ascending: true });

        if (matchesError) {
            console.error('Error fetching matches:', matchesError);
            return { data: null, error: `Error de Supabase: ${matchesError.message}` };
        }

        if (!matchesData || matchesData.length === 0) {
            return { data: [], error: null };
        }

        const teamIds = [...new Set(matchesData.flatMap(m => [m.team1_id, m.team2_id]).filter(Boolean))];
        const leagueIds = [...new Set(matchesData.map(m => m.league_id).filter(Boolean))];
        
        const { data: teamsData, error: teamsError } = await supabase.from('teams').select('id, name').in('id', teamIds);
        if (teamsError) return { data: null, error: `Error de Supabase al buscar equipos: ${teamsError.message}` };
        
        const { data: leaguesData, error: leaguesError } = await supabase.from('leagues').select('id, name, country_id').in('id', leagueIds);
        if (leaguesError) return { data: null, error: `Error de Supabase al buscar ligas: ${leaguesError.message}` };
        
        const countryIds = [...new Set(leaguesData.map(l => l.country_id).filter(Boolean))];
        const { data: countriesData, error: countriesError } = await supabase.from('countries').select('id, name').in('id', countryIds);
        if (countriesError) return { data: null, error: `Error de Supabase al buscar países: ${countriesError.message}` };
        
        const teamsMap = new Map(teamsData.map(t => [t.id, t]));
        const countriesMap = new Map(countriesData.map(c => [c.id, c]));
        const leaguesMap = new Map(leaguesData.map(l => [l.id, { ...l, countries: countriesMap.get(l.country_id) }]));

        const combinedData = matchesData.map(match => ({
            ...match,
            team1: teamsMap.get(match.team1_id),
            team2: teamsMap.get(match.team2_id),
            league: leaguesMap.get(match.league_id),
        }));

        const statsPromises = combinedData.map(match => {
            if (!match.team1_id || !match.team2_id || !match.season || !match.league_id) {
                return Promise.resolve({ ...match, prediction: { has_prediction: false } });
            }

            return Promise.all([
                getTeamStandings(match.team1_id, match.season, match.league_id, match.match_date),
                getTeamStandings(match.team2_id, match.season, match.league_id, match.match_date),
                getLastNMatchesStandings(match.team1_id, match.season, match.league_id, true, match.match_date),
                getLastNMatchesStandings(match.team2_id, match.season, match.league_id, false, match.match_date)
            ]).then(([team1Standings, team2Standings, team1Last3Data, team2Last3Data]) => {
                return { 
                    match, 
                    team1Standings, 
                    team2Standings, 
                    team1Last3Data, 
                    team2Last3Data 
                };
            });
        });

        const allStats = await Promise.all(statsPromises);
        
        const enrichedMatches = [];
        for (const { match, team1Standings, team2Standings, team1Last3Data, team2Last3Data } of allStats) {
            let prediction: MatchPredictionOutput = { has_prediction: false };
            
            if (match.team1 && match.team2 && team1Standings && team2Standings && team1Last3Data?.all && team2Last3Data?.all && team1Last3Data?.homeAway && team2Last3Data?.homeAway) {
                try {
                     prediction = await getMatchPrediction({
                        team1Name: match.team1.name,
                        team2Name: match.team2.name,
                        team1_standings: team1Standings,
                        team2_standings: team2Standings,
                        team1_last_3: team1Last3Data.all,
                        team2_last_3: team2Last3Data.all,
                        team1_last_3_home_away: team1Last3Data.homeAway,
                        team2_last_3_home_away: team2Last3Data.homeAway,
                    });
                } catch (e) {
                    console.error("Error getting match prediction", e);
                }
            }

            enrichedMatches.push({
                ...match,
                team1_standings: team1Standings,
                team2_standings: team2Standings,
                team1_last_3: team1Last3Data?.all,
                team2_last_3: team2Last3Data?.all,
                team1_last_3_home_away: team1Last3Data?.homeAway,
                team2_last_3_home_away: team2Last3Data?.homeAway,
                prediction
            });
        }
        
        return { data: enrichedMatches, error: null };
    } catch (e) {
        console.error('Unexpected error in getMatchesByDate:', e);
        return { data: null, error: `An unexpected error occurred: ${e.message}` };
    }
}
    

    