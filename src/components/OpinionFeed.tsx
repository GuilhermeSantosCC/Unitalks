import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard'; 
import { Skeleton } from './ui/skeleton'; 
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale'; 
import { PostResponse } from '@/types';
import { useSearchParams } from 'react-router-dom'; // Importar useSearchParams

export function OpinionFeed() {
  const [comments, setComments] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook para ler a URL (ex: ?q=python)
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true); // Reseta o loading ao mudar a busca
      setError(null);
      
      try {
        let url = "http://127.0.0.1:8001/posts/";
        
        // Se houver termo de busca, muda o endpoint
        if (searchQuery) {
          url = `http://127.0.0.1:8001/search?q=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Falha ao buscar posts: ${response.status}`);
        }

        const data: PostResponse[] = await response.json();
        
        // Se NÃO for busca, ordena por data (a busca já vem ordenada por relevância do backend)
        if (!searchQuery) {
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
        setComments(data);

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
  }, [searchQuery]); // Roda toda vez que a URL mudar (searchQuery)

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  return (
    <div className="opinion-feed space-y-4"> 
      {/* Mostra um título se estiver buscando */}
      {searchQuery && (
        <div className="mb-4 text-xl font-bold text-white">
          Resultados para: <span className="text-purple-400">"{searchQuery}"</span>
        </div>
      )}

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