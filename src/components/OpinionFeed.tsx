import React, { useState, useEffect } from 'react';
import { CommentCard } from './CommentCard'; 

// Interface (sem alteração)
interface Comment {
  id: string;
  userId?: string;
  authorName?: string;
  content?: string;
  agreeCount?: number;
  disagreeCount?: number;
  timestamp: any;
}

export function OpinionFeed() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    //
    // TODO: Implementar a chamada 'fetch' para a API de Posts (GET /api/posts)
    //
    console.warn("OpinionFeed: API de Posts não implementada. Mostrando feed vazio.");
    // setComments(dadosDaApi);
  }, []); 

  return (
    <div className="opinion-feed space-y-4"> 
      {comments.map(comment => (
        <CommentCard
          key={comment.id}
          id={comment.id}
          userId={comment.userId}
          author={comment.authorName || "Anônimo"} 
          content={comment.content || ""} 
          agreeCount={comment.agreeCount || 0}
          disagreeCount={comment.disagreeCount || 0}
          timestamp={comment.timestamp}
        />
      ))}
      {comments.length === 0 && (
         <p className="text-gray-400 text-center p-8 bg-[#1D1D1D] rounded-lg">
            Nenhum post encontrado. (API de Posts ainda não conectada).
         </p>
      )}
    </div>
  );
}