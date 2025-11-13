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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReplyCard } from "./ReplyCard";
import { toast } from "./ui/use-toast";
import { useAuth } from "@/context/AuthContext"; 

// --- Interfaces (sem alteração) ---
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
  authorName: string;
  content: string;
  timestamp: string;
  userId: string;
  postId: string;
}
// --- Fim das Interfaces ---

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
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Contadores locais para atualização otimista
  const [agreeCount, setAgreeCount] = useState(initialAgreeCount);
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount);
  
  const { user, isLoading: isAuthLoading } = useAuth();
  const isLoggedIn = !!user;
  const isOwner = isLoggedIn && !isAuthLoading && user?.id.toString() === userId;

  useEffect(() => {
    // TODO: Na próxima branch, vamos carregar o estado de voto do usuário
    // (ex: /api/posts/votes/me) para que o botão 'active' seja persistente.
    // Por enquanto, 'userVote' é apenas local.
  }, [id, user]);

  
  const handleVote = async (voteType: "agree" | "disagree") => {
    if (!isLoggedIn) { 
      toast({ title: "Acesso Negado", description: "Faça login para votar.", variant: "destructive"}); 
      return; 
    }
    
    const token = localStorage.getItem('userToken');
    if (!token) { 
      toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive"});
      return;
    }

    const originalVote = userVote;
    const originalAgree = agreeCount;
    const originalDisagree = disagreeCount;

    let newVoteType: "agree" | "disagree" | "none" = voteType;

    if (userVote === voteType) {
      setUserVote(null);
      newVoteType = "none";
      if (voteType === 'agree') setAgreeCount(c => c - 1);
      else setDisagreeCount(c => c - 1);

    } else if (userVote) {
      setUserVote(voteType);
      if (voteType === 'agree') {
        setAgreeCount(c => c + 1);
        setDisagreeCount(c => c - 1);
      } else {
        setAgreeCount(c => c - 1);
        setDisagreeCount(c => c + 1);
      }
    } else {
      // Novo voto
      setUserVote(voteType);
      if (voteType === 'agree') setAgreeCount(c => c + 1);
      else setDisagreeCount(c => c + 1);
    }

    // 2. Envio para a API
    try {
      const response = await fetch("http://127.0.0.1:8001/vote/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: parseInt(id),
          vote_type: newVoteType
        })
      });

      if (!response.ok) {
        // Se a API falhar, reverte a UI
        throw new Error("Falha ao registrar o voto.");
      }

    } catch (err) {
      // 3. Reversão (Rollback) em caso de erro
      toast({ title: "Erro", description: "Não foi possível registrar seu voto.", variant: "destructive" });
      setUserVote(originalVote);
      setAgreeCount(originalAgree);
      setDisagreeCount(originalDisagree);
    }
  };

  const handleReply = async () => {
    if (!isLoggedIn) { toast({ title: "Acesso Negado", description: "Faça login para responder.", variant: "destructive"}); return; }
    console.warn("API de Respostas (Replies) não implementada.");
    setReplyContent("");
    setIsReplying(false);
  };

  const confirmDelete = async () => {
    if (!isOwner) { 
      toast({ title: "Acesso Negado", description: "Você não é o dono deste post.", variant: "destructive"}); 
      return; 
    }
    
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive"});
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8001/posts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Não foi possível apagar o post.");
      }

      toast({ title: "Post Apagado", description: "Seu post foi removido." });
      setIsDeleteModalOpen(false);
      window.location.reload(); 

    } catch (err) {
      if (err instanceof Error) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      }
      console.error("Erro ao deletar post:", err);
    }
  };

  const fetchReplies = () => {
    if (!showReplies) { 
        console.warn("API de Respostas não implementada.");
    }
    setShowReplies(!showReplies); 
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

                {isOwner && ( 
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
                  count={agreeCount}
                  active={userVote === "agree"}
                  onClick={() => handleVote("agree")}
                >
                  <ThumbsUp className="h-4 w-4" />
                </VoteButton>

                <VoteButton
                  variant="disagree"
                  count={disagreeCount}
                  active={userVote === "disagree"}
                  onClick={() => handleVote("disagree")}
                >
                  <ThumbsDown className="h-4 w-4" />
                </VoteButton>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  disabled={!isLoggedIn}
                >
                  <MessageSquareReply className="h-4 w-4" />
                  Responder
                </Button>
                
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={fetchReplies}
                  >
                    <CornerDownRight className="h-4 w-4" />
                    {showReplies ? "Ocultar respostas" : `Ver respostas`}
                  </Button>
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

              {showReplies && (
                <div className="mt-4 pl-6 border-l border-border/40 space-y-4">
                  {replies.length > 0 ? (
                    replies.map((reply) => (
                      <ReplyCard
                        key={reply.id}
                        {...reply}
                        isLoggedIn={isLoggedIn}
                        currentUserId={user ? user.id.toString() : null}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhuma resposta encontrada.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {}
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
              Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.
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