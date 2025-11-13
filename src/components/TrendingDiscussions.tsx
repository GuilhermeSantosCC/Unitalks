import { useState, useEffect } from "react";
import { Card } from "./ui/card";

interface Topic {
  id: string;
  title: string;
  votes: number;
  comments: number;
}

export function TrendingDiscussions() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    //
    // TODO: Implementar a chamada 'fetch' para a API de Posts (GET /api/trending)
    //
    console.warn("TrendingDiscussions: API de Trending não implementada.");
    // setTopics(dadosDaApi);
  }, []);

  return (
    <div className="w-80 p-6">
      <div className="text-center mb-8 py-4">
        <h1 className="text-3xl font-bold bg-gradient-tech bg-clip-text text-transparent mb-2">
          UniTalks
        </h1>
        <p className="text-muted-foreground">
          Seu espaço de fala!
        </p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Discussões do momento
        </h2>
        <div className="h-0.5 w-12 bg-gradient-tech rounded"></div>
      </div>

      <div className="space-y-4">
        {topics.length > 0 ? (
          topics.map((topic, index) => (
            <Card
              key={topic.id}
              className="p-4 bg-gradient-card border-tech-gray hover:border-tech-purple/50 transition-all duration-300 cursor-pointer group"
            >
              {/* ... JSX do Card (sem alteração) ... */}
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma discussão encontrada.</p>
        )}
      </div>
    </div>
  );
}