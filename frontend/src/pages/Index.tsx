"use client";

import { TrendingDiscussions } from "@/components/TrendingDiscussions";
import { OpinionFeed } from "@/components/OpinionFeed";
import { SearchSidebar } from "@/components/SearchSidebar";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-background-dark text-foreground">
      {/* Coluna da Esquerda */}
      <aside className="w-1/4 border-r border-border/50">
        <TrendingDiscussions />
      </aside>
      
      {/* Coluna Central */}
      <section className="w-1/2 p-6 space-y-4 overflow-y-auto">
        <OpinionFeed />
      </section>
      
      {/* Coluna da Direita */}
      <aside className="w-1/4 border-l border-border/50">
        <SearchSidebar />
      </aside>
    </main>
  );
}