// src/components/OpinionFeed.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; //
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { CommentCard } from './CommentCard'; //

// Interface sem isDeleted
interface Comment {
  id: string;
  userId?: string;
  authorName?: string;
  content?: string; // Mantém string
  agreeCount?: number;
  disagreeCount?: number;
  timestamp: any;
}

export function OpinionFeed() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc')); //

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => {
        const data = doc.data();
        let timestampStr = "Agora";
        if (data.timestamp) {
          const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          timestampStr = new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } //

        return {
          id: doc.id,
          userId: data.userId,
          authorName: data.authorName,
          content: data.content || "", // Fallback para string vazia
          agreeCount: data.agreeCount || 0,
          disagreeCount: data.disagreeCount || 0,
          timestamp: timestampStr
          // isDeleted removido
        } satisfies Comment;
      });
      setComments(commentsList);
    });

    return () => unsubscribe();
  }, []); //

  return (
    <div className="opinion-feed space-y-4"> {/* */}
      {comments.map(comment => (
        <CommentCard
          key={comment.id}
          id={comment.id}
          userId={comment.userId}
          author={comment.authorName || "Anônimo"} //
          content={comment.content || ""} // Passa string
          agreeCount={comment.agreeCount || 0}
          disagreeCount={comment.disagreeCount || 0}
          timestamp={comment.timestamp}
          // isDeleted não é passado
        />
      ))}
    </div>
  );
}