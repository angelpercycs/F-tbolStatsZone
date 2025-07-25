
"use client";

import { DailyMatches } from "@/components/daily-matches";
import { DateMatches } from "@/components/date-matches";
import { RoundMatches } from "@/components/round-matches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdBanner } from "@/components/ad-banner";
import Image from "next/image";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image src="/icon.svg" alt="Fútbol Stats Zone Logo" width={28} height={28} className="h-7 w-7" />
                <span className="text-xl font-bold text-accent-foreground/90">Fútbol Stats Zone <span className="text-xs font-medium text-primary">Beta</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <AdBanner />
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="daily">Encuentros del día</TabsTrigger>
              <TabsTrigger value="date">Por Fecha</TabsTrigger>
              <TabsTrigger value="round">Por Liga</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <DailyMatches />
            </TabsContent>
            <TabsContent value="date">
              <DateMatches />
            </TabsContent>
            <TabsContent value="round">
              <RoundMatches />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-4 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fútbol Stats Zone. All rights reserved.
          </div>
      </footer>
    </div>
  );
}
