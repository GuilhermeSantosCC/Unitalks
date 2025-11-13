import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard'; 
import { Skeleton } from './ui/skeleton'; 
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale'; 
import { PostResponse } from '@/types';

export function OpinionFeed() {
  const [comments, setComments] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/posts/");

        if (!response.ok) {
          throw new Error(`Falha ao buscar posts: ${response.status} ${response.statusText}`);
        }

        const data: PostResponse[] = await response.json();
        
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setComments(sortedData);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Um erro inesperado ocorreu.");
        }
        console.error("Erro no fetch do OpinionFeed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts(); 
  }, []); 

  // --- Renderização ---

  if (isLoading) {
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
         <p className="text-xs mt-2">(Verifique se a API da porta 8001 está rodando)</p>
      </div>
    );
  }

  return (
    <div className="opinion-feed space-y-4"> 
      {comments.length > 0 ? (
        comments.map(post => (
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
        ))
      ) : (
        <p className="text-gray-400 text-center p-8 bg-[#1D1D1D] rounded-lg">
           Nenhum post encontrado. 
           Seja o primeiro a postar clicando em "Adicionar Comentário"!
        </p>
      )}
    </div>
  );
}