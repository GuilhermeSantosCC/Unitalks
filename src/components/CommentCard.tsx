<<<<<<< Updated upstream
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { VoteButton } from "@/components/ui/vote-button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { db } from "@/firebase"
import { doc, updateDoc, increment } from "firebase/firestore"

interface CommentCardProps {
  id: string
  author: string
  content: string
  agreeCount: number
  disagreeCount: number
  timestamp: string
}

export function CommentCard({  
  id,
  author, 
  content, 
  agreeCount: initialAgreeCount, 
  disagreeCount: initialDisagreeCount,
  timestamp 
}: CommentCardProps) {
  const [userVote, setUserVote] = useState<'agree' | 'disagree' | null>(null)

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    if (!id) return;

    const postRef = doc(db, 'posts', id);
    if (userVote === voteType) {
      await updateDoc(postRef, {
        [voteType === 'agree' ? 'agreeCount' : 'disagreeCount']: increment(-1)
      });
      setUserVote(null);
    } else {
      const updates: { [key: string]: any } = {};
      if (userVote) {
        updates[userVote === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(-1);
      }
      updates[voteType === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(1);
      await updateDoc(postRef, updates);
      setUserVote(voteType);
    }
  }

  return (
    <Card className="w-full bg-gradient-card border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{author}</h4>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>
            
            <p className="text-foreground leading-relaxed">{content}</p>
            
            <div className="flex items-center gap-3 pt-2">
              <VoteButton
                variant="agree"
                active={userVote === 'agree'}
                count={initialAgreeCount}
                onClick={() => handleVote('agree')}
              >
                <ThumbsUp className="h-4 w-4" />
                Concordo
              </VoteButton>
              
              <VoteButton
                variant="disagree"
                active={userVote === 'disagree'}
                count={initialDisagreeCount}
                onClick={() => handleVote('disagree')}
              >
                <ThumbsDown className="h-4 w-4" />
                Discordo
              </VoteButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
=======
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VoteButton } from "@/components/ui/vote-button";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquareReply,
  CornerDownRight,
  Trash2,
  X,
} from "lucide-react";
import { db, auth } from "@/firebase";
import {
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged, User } from "firebase/auth";
import { ReplyCard } from "./ReplyCard";

interface CommentCardProps {
  id: string;
  userId: string;
  author: string;
  content: string;
  agreeCount: number;
  disagreeCount: number;
  timestamp: string;
}

interface ReplyData {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  userId: string;
}

export function CommentCard({
  id,
  userId,
  author,
  content,
  agreeCount: initialAgreeCount,
  disagreeCount: initialDisagreeCount,
  timestamp,
}: CommentCardProps) {
  const [userVote, setUserVote] = useState<"agree" | "disagree" | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      setCurrentUser(user)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReplies = async () => {
      const repliesRef = collection(db, "posts", id, "replies");
      const q = query(repliesRef, orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedReplies = snapshot.docs.map((doc) => ({
          id: doc.id,
          author: doc.data().author,
          content: doc.data().content,
          timestamp: new Date(
            doc.data().timestamp?.toDate()
          ).toLocaleString("pt-BR"),
          userId: doc.data().userId,
        }));
        setReplies(fetchedReplies);
      });
      return unsubscribe;
    };
    fetchReplies();
  }, [id]);

  const handleVote = async (type: "agree" | "disagree") => {
    if (!currentUser) return;
    const postRef = doc(db, "posts", id);
    const field = type === "agree" ? "agreeCount" : "disagreeCount";

    if (userVote === type) {
      await updateDoc(postRef, { [field]: increment(-1) });
      setUserVote(null);
    } else {
      if (userVote) {
        const oppositeField =
          userVote === "agree" ? "agreeCount" : "disagreeCount";
        await updateDoc(postRef, { [oppositeField]: increment(-1) });
      }
      await updateDoc(postRef, { [field]: increment(1) });
      setUserVote(type);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !currentUser) return;
    const replyRef = collection(db, "posts", id, "replies");
    await addDoc(replyRef, {
      author: currentUser.displayName || "Anônimo",
      content: replyContent,
      timestamp: serverTimestamp(),
      userId: currentUser.uid,
    });
    setReplyContent("");
    setIsReplying(false);
  };

  const confirmDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      const repliesRef = collection(db, "posts", id, "replies");
      const repliesSnapshot = await getDocs(repliesRef);
      const batch = writeBatch(db);
      repliesSnapshot.forEach((replyDoc) => batch.delete(replyDoc.ref));
      await batch.commit();

      const postRef = doc(db, "posts", id);
      await deleteDoc(postRef);
      console.log("Post e respostas deletados com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar post:", error);
    }
  };

  return (
    <>
      <Card className="w-full bg-gradient-card border-border/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{author}</h4>
                  <span className="text-xs text-muted-foreground">
                    {timestamp}
                  </span>
                </div>

                {currentUser && currentUser.uid === userId && (
                  <Button
                    variant="danger"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsDeleteModalOpen(true)}
                    title="Excluir post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-foreground leading-relaxed">{content}</p>

              <div className="flex items-center gap-3">
                <VoteButton
                  variant="agree"
                  count={initialAgreeCount}
                  active={userVote === "agree"}
                  onClick={() => handleVote("agree")}
                >
                  <ThumbsUp className="h-4 w-4" /> Concordo
                </VoteButton>

                <VoteButton
                  variant="disagree"
                  count={initialDisagreeCount}
                  active={userVote === "disagree"}
                  onClick={() => handleVote("disagree")}
                >
                  <ThumbsDown className="h-4 w-4" /> Discordo
                </VoteButton>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquareReply className="h-4 w-4" />
                  Responder
                </Button>

                {replies.length > 0 && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    <CornerDownRight className="h-4 w-4" />
                    {showReplies
                      ? "Ocultar respostas"
                      : `Ver ${replies.length} ${
                          replies.length > 1 ? "respostas" : "resposta"
                        }`}
                  </Button>
                )}
              </div>

              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escreva sua resposta..."
                  />
                  <Button onClick={handleReply}>Enviar</Button>
                </div>
              )}

              {showReplies && replies.length > 0 && (
                <div className="mt-4 pl-6 border-l border-border/40 space-y-4">
                  {replies.map((reply) => (
                    <ReplyCard
                      key={reply.id}
                      replyId={reply.id}
                      authorName={reply.author}
                      content={reply.content}
                      timestamp={reply.timestamp}
                      userId={reply.userId}
                      postId={id}
                      currentUser={currentUser}
                      loggedInUserDisplayName={
                        currentUser?.displayName || "Anônimo"
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-gray-700 rounded-2xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-white mb-3">
              Excluir Comentário
            </h2>

            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Tem certeza que deseja apagar este post e todas as suas respostas?
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end space-x-3">
              <Button variant="subtle" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Apagar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
>>>>>>> Stashed changes
