import { useState } from "react";
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
import { ReplyResponse } from "@/types";
import { useNavigate } from "react-router-dom"; // Usamos useNavigate para navegação manual

interface CommentCardProps {
  id: string;
  userId: string;
  author: string;
  username?: string; // Novo campo para o link do perfil
  content: string;
  agreeCount: number;
  disagreeCount: number;
  timestamp: string;
  initialReplies: ReplyResponse[];
}

export function CommentCard({
  id,
  userId,
  author,
  username,
  content,
  agreeCount: initialAgreeCount,
  disagreeCount: initialDisagreeCount,
  timestamp,
  initialReplies,
}: CommentCardProps) {
  
  // --- Estados Locais ---
  const [userVote, setUserVote] = useState<"agree" | "disagree" | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<ReplyResponse[]>(initialReplies);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agreeCount, setAgreeCount] = useState(initialAgreeCount);
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount);
  
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  const isLoggedIn = !!user;
  const isOwner = isLoggedIn && user?.id.toString() === userId;

  const topLevelReplies = replies.filter(reply => reply.parent_reply_id === null);

  // --- Ação de Navegar para o Perfil (Protegida) ---
  const handleProfileClick = () => {
    requireAuth(() => {
      if (username) {
        navigate(`/u/${username}`);
      }
    });
  };

  // --- Ação de Voto (Protegida) ---
  const handleVote = async (voteType: "agree" | "disagree") => {
    // O requireAuth garante que só executa se estiver logado
    requireAuth(async () => {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const originalVote = userVote;
        const originalAgree = agreeCount;
        const originalDisagree = disagreeCount;

        let newVoteType: "agree" | "disagree" | "none" = voteType;

        // Lógica otimista de atualização da UI
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
          setUserVote(voteType);
          if (voteType === 'agree') setAgreeCount(c => c + 1);
          else setDisagreeCount(c => c + 1);
        }

        try {
          const response = await fetch("http://127.0.0.1:8001/vote/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ post_id: parseInt(id), vote_type: newVoteType })
          });
          if (!response.ok) throw new Error("Falha ao registrar o voto.");
        } catch (err) {
          toast({ title: "Erro", description: "Não foi possível registrar seu voto.", variant: "destructive" });
          // Reverte em caso de erro
          setUserVote(originalVote);
          setAgreeCount(originalAgree);
          setDisagreeCount(originalDisagree);
        }
    });
  };

  // --- Ação de Responder (Protegida) ---
  const handleReplyAction = () => {
    requireAuth(() => {
        setIsReplying(!isReplying);
    });
  };

  const submitReply = async () => {
    const token = localStorage.getItem('userToken');
    if (!token || !replyContent.trim()) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/posts/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent,
          parent_reply_id: null
        })
      });

      if (!response.ok) throw new Error("Falha ao enviar.");

      const newReply = await response.json();
      setReplies(curr => [...curr, newReply]);
      setReplyContent("");
      setIsReplying(false);
      setShowReplies(true);
      toast({ title: "Resposta enviada!" });

    } catch (err) {
      toast({ title: "Erro", description: "Falha ao enviar resposta.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/posts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erro ao apagar.");
      
      toast({ title: "Post Apagado" });
      setIsDeleteModalOpen(false);
      window.location.reload(); 
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível apagar.", variant: "destructive" });
    }
  };

  return (
    <>
      <Card className="w-full bg-gradient-card border-border/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 justify-between">
                
                {/* ÁREA DO USUÁRIO (CLICÁVEL) */}
                <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={handleProfileClick}
                    title={username ? `Ver perfil de @${username}` : "Ver perfil"}
                >
                  <h4 className="font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                    {author}
                  </h4>
                  {username && <span className="text-xs text-muted-foreground group-hover:text-purple-300/70">@{username}</span>}
                  <span className="text-xs text-muted-foreground mx-2">• {timestamp}</span>
                </div>

                {isOwner && ( 
                  <Button
                    variant="danger"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsDeleteModalOpen(true)}
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
                  <ThumbsUp className="h-4 w-4" /> Concordo
                </VoteButton> 

                <VoteButton
                  variant="disagree"
                  count={disagreeCount}
                  active={userVote === "disagree"}
                  onClick={() => handleVote("disagree")}
                >
                  <ThumbsDown className="h-4 w-4" /> Discordo
                </VoteButton> 

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleReplyAction}
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
                    {showReplies ? "Ocultar" : `Ver ${replies.length} respostas`}
                  </Button>
                )}
              </div>

              {isReplying && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escreva sua resposta..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsReplying(false)}>Cancelar</Button>
                    <Button onClick={submitReply}>Enviar</Button>
                  </div>
                </div>
              )}

              {showReplies && (
                <div className="mt-4 pl-6 border-l border-border/40 space-y-4">
                  {topLevelReplies.map((reply) => (
                    <ReplyCard
                      key={reply.id}
                      replyData={reply}
                      allReplies={replies}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
           <div className="bg-[#111] border border-gray-700 rounded-2xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white mb-3">Excluir Comentário</h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="subtle" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete}>Apagar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}