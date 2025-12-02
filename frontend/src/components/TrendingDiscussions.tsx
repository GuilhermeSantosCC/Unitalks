import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { PostResponse } from "@/types"; 
import { useNavigate } from "react-router-dom";

export function TrendingDiscussions() {
  const [topics, setTopics] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/posts/trending");
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error("Erro ao buscar trending topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleNavigateToPost = (content: string) => {
    navigate(`/?q=${encodeURIComponent(content)}`);
  };

  return (
    <div className="w-80 p-6 hidden lg:block"> 
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
          Assuntos do Momento
        </h2>
        <div className="h-0.5 w-12 bg-gradient-tech rounded"></div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
            <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </>
        ) : topics.length > 0 ? (
          topics.map((topic, index) => (
            <Card
              key={topic.id}
              onClick={() => handleNavigateToPost(topic.content)}
              className="p-4 bg-gradient-card border-tech-gray hover:border-tech-purple/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
              title="Ver discussão"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-tech-purple transition-colors line-clamp-2">
                    {topic.content}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="text-xs">▲</span>
                      {topic.agree_count}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {topic.replies ? topic.replies.length : 0}
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
          <p className="text-muted-foreground text-sm text-center">
              Nenhum destaque no momento.
          </p>
        )}
      </div>
    </div>
  );
}