import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard'; 
import { Skeleton } from './ui/skeleton'; // Para um loading profissional
import { format } from 'date-fns'; // Para formatar datas
import { ptBR } from 'date-fns/locale'; // Para datas em português

// --- Interfaces ---
// Estas interfaces definem o "contrato" de dados que esperamos da API.
// Elas DEVEM bater com os 'schemas.py' do seu post_service.

// O 'owner' (dono) do post, baseado no 'schemas.UserResponse'
interface PostOwner {
  id: number;
  name: string;
  email: string;
  college?: string;
}

// O Post, baseado no 'schemas.PostResponse'
interface Post {
  id: number;
  content: string;
  created_at: string; // O JSON sempre envia datas como string (ISO)
  owner_id: number;
  owner: PostOwner;
  agree_count: number;
  disagree_count: number;
}

export function OpinionFeed() {
  const [comments, setComments] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Criamos uma função async dentro do useEffect para poder usar 'await'
    const fetchPosts = async () => {
      try {
        // 1. Faz o 'fetch' na sua API de posts (porta 8001)
        const response = await fetch("http://127.0.0.1:8001/posts/");

        if (!response.ok) {
          throw new Error(`Falha ao buscar posts: ${response.status} ${response.statusText}`);
        }

        const data: Post[] = await response.json();
        
        // 2. Ordena os posts pelo mais recente
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

    fetchPosts(); // Executa a função
  }, []); // [] significa que isso roda apenas 1 vez, quando o componente é montado

  // --- Renderização Profissional com Estados ---

  // 1. Estado de Carregamento
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    );
  }

  // 2. Estado de Erro
  if (error) {
    return (
      <div className="text-destructive-foreground bg-destructive/90 text-center p-6 rounded-lg">
         <h3 className="font-semibold">Erro ao carregar o feed</h3>
         <p className="text-sm">{error}</p>
         <p className="text-xs mt-2">(Verifique se a API da porta 8001 está rodando)</p>
      </div>
    );
  }

  // 3. Estado de Sucesso (com ou sem posts)
  return (
    <div className="opinion-feed space-y-4"> 
      {comments.length > 0 ? (
        comments.map(post => (
          // Mapeamos os dados da API para as props do CommentCard
          <CommentCard
            key={post.id}
            id={post.id.toString()}
            userId={post.owner.id.toString()}
            author={post.owner.name}
            content={post.content}
            agreeCount={post.agree_count}
            disagreeCount={post.disagree_count}
            // Formatamos a data (ex: "13/11/2025 às 17:05")
            timestamp={format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          />
        ))
      ) : (
        // 3b. Estado de Sucesso (vazio)
        <p className="text-gray-400 text-center p-8 bg-[#1D1D1D] rounded-lg">
           Nenhum post encontrado. 
           Seja o primeiro a postar clicando em "Adicionar Comentário"!
        </p>
      )}
    </div>
  );
}