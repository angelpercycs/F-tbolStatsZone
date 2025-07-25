
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { getMatchesByDate } from "@/app/actions/getMatches";
import { MatchList } from "@/components/match-list";
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertTitle } from "@/components/ui/alert";

export function DateMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showOnlyPredicted, setShowOnlyPredicted] = useState(false);

  const fetchMatches = useCallback(async (date) => {
    if (!date) return;
    setLoading(true);
    setError(null);
    setMatches([]);
    setShowOnlyPredicted(false);

    const startDate = startOfDay(date).toISOString();
    const endDate = endOfDay(date).toISOString();

    // @ts-ignore
    const result = await getMatchesByDate(startDate, endDate);
    if (result.error) {
      setError(result.error);
    } else {
      setMatches(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMatches(selectedDate);
  }, [selectedDate, fetchMatches]);

  const hasAnyPrediction = useMemo(() => {
    // @ts-ignore
    return !loading && matches.some(match => match.prediction?.has_prediction);
  }, [matches, loading]);

  const filteredMatches = useMemo(() => {
    if (showOnlyPredicted) {
      // @ts-ignore
      return matches.filter(match => match.prediction?.has_prediction);
    }
    return matches;
  }, [matches, showOnlyPredicted]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Búsqueda por Fecha</CardTitle>
        <CardDescription>Selecciona una fecha para ver todos los encuentros programados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        {hasAnyPrediction && (
          <Alert variant="destructive" className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                  <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
              </div>
              <AlertTitle className="font-semibold text-destructive-foreground">¡Partidos con pronóstico disponibles!</AlertTitle>
            </div>
            <Button onClick={() => setShowOnlyPredicted(!showOnlyPredicted)} variant="outline" size="sm" className="bg-transparent text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10">
              {showOnlyPredicted ? 'Mostrar todos' : 'Mostrar solo con pronóstico'}
            </Button>
          </Alert>
        )}
        <MatchList matches={filteredMatches} error={error} loading={loading} />
      </CardContent>
    </Card>
  );
}
