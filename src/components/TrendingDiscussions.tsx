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
    // TODO: A lógica 'fetch' da API de Posts (GET /api/trending) virá na branch 'feature/api-posts'
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-tech-purple transition-colors">
                    {topic.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="text-tech-green">↑</span>
                      {topic.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {topic.comments}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-medium text-tech-purple ml-2">
                  #{index + 1}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma discussão encontrada.</p>
        )}
      </div>
    </div>
  );
}