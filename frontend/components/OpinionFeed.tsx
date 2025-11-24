import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard'; 
import { Skeleton } from './ui/skeleton'; 
import { Button } from './ui/button'; 
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale'; 
import { PostResponse } from '@/types';
import { useSearchParams } from 'react-router-dom';

export function OpinionFeed() {
  const [comments, setComments] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 10; 

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");

  const fetchPosts = async (offset: number, isNewContext: boolean = false) => {
    if (isNewContext) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      let url = "";
      
      if (searchQuery) {
        url = `http://127.0.0.1:8001/search?q=${encodeURIComponent(searchQuery)}`;
      } else {
        url = `http://127.0.0.1:8001/posts/?skip=${offset}&limit=${LIMIT}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Falha ao buscar posts: ${response.status}`);
      }

      const data: PostResponse[] = await response.json();

      if (searchQuery) {
        setComments(data);
        setHasMore(false); 
      } else {
        if (isNewContext) {
           setComments(data); 
        } else {
           setComments(prev => [...prev, ...data]); 
        }
        
        if (data.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Um erro inesperado ocorreu.");
      }
      console.error("Erro no fetch do OpinionFeed:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    fetchPosts(0, true);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const newSkip = skip + LIMIT;
    setSkip(newSkip);
    fetchPosts(newSkip, false);
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive-foreground bg-destructive/90 text-center p-6 rounded-lg">
         <h3 className="font-semibold">Erro ao carregar o feed</h3>
         <p className="text-sm">{error}</p>
         <p className="text-xs mt-2"></p>
      </div>
    );
  }

  return (
    <div className="opinion-feed space-y-4 pb-8"> 
      {searchQuery && (
        <div className="mb-4 text-xl font-bold text-white">
          Resultados para: <span className="text-purple-400">"{searchQuery}"</span>
        </div>
      )}

      {comments.length > 0 ? (
        <>
            {comments.map(post => (
              <CommentCard
                key={post.id}
                id={post.id.toString()}
                userId={post.owner.id.toString()}
                author={post.owner.name}
                content={post.content}
                agreeCount={post.agree_count}
                disagreeCount={post.disagree_count}
                timestamp={format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                initialReplies={post.replies || []} 
              />
            ))}
            
            {!searchQuery && hasMore && (
                <Button 
                    onClick={handleLoadMore} 
                    disabled={isLoadingMore}
                    variant="outline" 
                    className="w-full mt-4 border-tech-gray text-gray-400 hover:text-white hover:bg-white/10"
                >
                    {isLoadingMore ? "Carregando..." : "Carregar mais posts..."}
                </Button>
            )}
            
            {!searchQuery && !hasMore && comments.length > 0 && (
              <p className="text-center text-xs text-gray-600 mt-4">
                Você chegou ao fim do feed.
              </p>
            )}
        </>
      ) : (
        <div className="text-gray-400 text-center p-12 bg-[#1D1D1D] rounded-lg border border-gray-800">
           <p className="text-lg font-semibold mb-2">Nenhum post encontrado.</p>
           {searchQuery ? (
             <p className="text-sm">Tente buscar por outro termo.</p>
           ) : (
             <p className="text-sm">Seja o primeiro a postar!</p>
           )}
        </div>
      )}
    </div>
  );
}