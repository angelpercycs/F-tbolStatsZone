
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, AlertCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

const MatchDaySkeleton = () => (
  <div className="space-y-4 mt-6">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

const StandingsTable = ({ title, homeStats, awayStats, homeName, awayName }) => {
    if (!homeStats || !awayStats) {
        return (
            <div className="my-4 text-center text-muted-foreground">
                Datos de clasificación no disponibles.
            </div>
        );
    }
    return (
        <div className="my-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Equipo</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>G</TableHead>
                <TableHead>E</TableHead>
                <TableHead>P</TableHead>
                <TableHead>GF</TableHead>
                <TableHead>GC</TableHead>
                <TableHead className="font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{homeName}</TableCell>
                <TableCell>{homeStats.played}</TableCell>
                <TableCell>{homeStats.won}</TableCell>
                <TableCell>{homeStats.drawn}</TableCell>
                <TableCell>{homeStats.lost}</TableCell>
                <TableCell>{homeStats.goalsFor}</TableCell>
                <TableCell>{homeStats.goalsAgainst}</TableCell>
                <TableCell className="font-bold">{homeStats.points}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{awayName}</TableCell>
                <TableCell>{awayStats.played}</TableCell>
                <TableCell>{awayStats.won}</TableCell>
                <TableCell>{awayStats.drawn}</TableCell>
                <TableCell>{awayStats.lost}</TableCell>
                <TableCell>{awayStats.goalsFor}</TableCell>
                <TableCell>{awayStats.goalsAgainst}</TableCell>
                <TableCell className="font-bold">{awayStats.points}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
    );
};


const PredictionDisplay = ({ prediction, leagueId }) => {
  if (!prediction || !prediction.has_prediction) return null;

  const renderPredictionText = () => {
    if (!prediction.prediction_text || !prediction.winner_name) {
      return <p className="text-sm text-muted-foreground mb-3">{prediction.prediction_text}</p>;
    }
    const parts = prediction.prediction_text.split(prediction.winner_name);
    return (
       <p className="text-sm text-muted-foreground mb-3">
        {parts[0]}
        <strong className="text-primary">{prediction.winner_name}</strong>
        {parts[1]}
      </p>
    )
  }

  return (
    <div className="my-6 p-4 rounded-lg bg-muted/50 border">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Sugerencia de Pronóstico</h3>
      </div>
      {renderPredictionText()}
      <div className="space-y-1">
         <label className="text-sm font-medium">Probabilidad de acierto</label>
         <Progress value={50} className="w-full" />
      </div>
    </div>
  )
}

export const MatchList = ({ matches, error, loading }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTeamClick = (match) => {
    setSelectedMatch(match);
    setIsSheetOpen(true);
  };

  if (loading) {
    return <MatchDaySkeleton />;
  }
  
  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mt-6 text-center text-muted-foreground p-8 rounded-lg border border-dashed">
        <p>No hay encuentros para mostrar para esta fecha.</p>
      </div>
    );
  }

  const groupedByLeague = matches.reduce((acc, match) => {
    const leagueName = match.league?.name || 'Unknown League';
    if (!acc[leagueName]) {
      acc[leagueName] = {
        matches: [],
        country: match.league?.countries?.name || 'Unknown Country'
      };
    }
    acc[leagueName].matches.push(match);
    return acc;
  }, {});

  const sortedLeagues = Object.entries(groupedByLeague).sort(([leagueA, dataA]: [string, any], [leagueB, dataB]: [string, any]) => {
    const countryCompare = dataA.country.localeCompare(dataB.country);
    if (countryCompare !== 0) {
      return countryCompare;
    }
    return leagueA.localeCompare(leagueB);
  });

  return (
    <>
      <div className="w-full space-y-4 mt-4">
        {sortedLeagues.map(([leagueName, { matches: leagueMatches, country }]: [string, any]) => {
          return (
            <Card key={leagueName}>
              <CardContent className="p-0">
                <div className="p-4 font-bold flex items-center gap-2 border-b bg-muted/20">
                  <Flag className="h-5 w-5"/> {country} - {leagueName}
                </div>
                <div>
                  <div className="border-b last:border-b-0">
                    {leagueMatches.map((match, index) => {
                        const timeDisplay = match.match_date_iso 
                            ? match.match_date_iso.split('T')[1].substring(0, 5) 
                            : '--:--';

                        return (
                        <div key={match.id}>
                          <div className="flex items-center justify-between w-full px-4 py-4">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="w-16 text-muted-foreground text-center">{timeDisplay}</div>
                              <div className="flex flex-col items-start">
                                <button onClick={() => handleTeamClick(match)} className="text-left cursor-pointer hover:underline disabled:cursor-not-allowed disabled:no-underline" disabled={!match.team1_standings}>
                                  <span>{match.team1?.name ?? 'Equipo no encontrado'}</span>
                                </button>
                                <button onClick={() => handleTeamClick(match)} className="text-left cursor-pointer hover:underline disabled:cursor-not-allowed disabled:no-underline" disabled={!match.team2_standings}>
                                  <span>{match.team2?.name ?? 'Equipo no encontrado'}</span>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold">
                                {match.prediction?.has_prediction && (
                                    <div className="relative flex h-3 w-3">
                                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                                        <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                                    </div>
                                )}
                                <div className="flex flex-col items-center">
                                    <span>{match.team1_score ?? '-'}</span>
                                    <span>{match.team2_score ?? '-'}</span>
                                </div>
                            </div>
                          </div>
                          {index < leagueMatches.length -1 && <Separator />}
                        </div>
                    )})}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-[90vw] sm:max-w-lg overflow-y-auto">
          {selectedMatch && (
            <>
              <SheetHeader className="text-center">
                <SheetTitle>{selectedMatch.team1?.name} vs {selectedMatch.team2?.name}</SheetTitle>
                <SheetDescription>
                    {selectedMatch.league?.name}
                    <br />
                    <span className="font-semibold">Todas las estadísticas son Pre-Jornada</span>
                    <br />
                    <span className="text-xs">Resultados de liga, dentro de los 90 minutos reglamentarios.</span>
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <PredictionDisplay prediction={selectedMatch.prediction} leagueId={selectedMatch.league_id} />
                  <StandingsTable 
                  title="Clasificación General"
                  homeStats={selectedMatch.team1_standings}
                  awayStats={selectedMatch.team2_standings}
                  homeName={selectedMatch.team1?.name}
                  awayName={selectedMatch.team2?.name}
                />
                  <StandingsTable 
                  title="Clasificación Local/Visitante"
                  homeStats={selectedMatch.team1_standings?.home}
                  awayStats={selectedMatch.team2_standings?.away}
                  homeName={selectedMatch.team1?.name}
                  awayName={selectedMatch.team2?.name}
                />
                <StandingsTable 
                  title="Últimos 3 encuentros (General)"
                  homeStats={selectedMatch.team1_last_3}
                  awayStats={selectedMatch.team2_last_3}
                  homeName={selectedMatch.team1?.name}
                  awayName={selectedMatch.team2?.name}
                />
                <StandingsTable 
                  title="Últimos 3 encuentros (Local/Visitante)"
                  homeStats={selectedMatch.team1_last_3_home_away}
                  awayStats={selectedMatch.team2_last_3_home_away}
                  homeName={selectedMatch.team1?.name}
                  awayName={selectedMatch.team2?.name}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

    
