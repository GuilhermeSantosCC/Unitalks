import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { CommentCard } from './CommentCard';

interface Comment {
  id: string;
  author?: string;
  name?: string;
  content?: string;
  message?: string;
  agreeCount?: number;
  likes?: number;
  disagreeCount?: number;
  disagree?: number;
  timestamp: any;
}

export function OpinionFeed() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

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
        }

        return {
          id: doc.id,
          ...data,
          timestamp: timestampStr
        };
      });
      
      setComments(commentsList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="opinion-feed space-y-4">
      {comments.map(comment => (
        <CommentCard
          key={comment.id}
          id={comment.id}
          author={comment.author || comment.name || "Anônimo"}
          content={comment.content || comment.message || ""}
          agreeCount={comment.agreeCount || comment.likes || 0}
          disagreeCount={comment.disagreeCount || comment.disagree || 0}
          timestamp={comment.timestamp}
        />
      ))}
    </div>
  );
}