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

interface CommentCardProps {
  id: string;
  userId?: string; // Alterado para opcional
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
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Lógica de login simples
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // TODO: O token JWT não nos diz o ID do usuário diretamente
    // Precisaremos de um endpoint /api/me para buscar o usuário logado
    // Por enquanto, vamos apenas checar se o token existe.
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
    // setCurrentUserId(idDoTokenDecodificado); // Isso virá na API de Posts
  }, []);

  const handleVote = async (type: "agree" | "disagree") => {
    if (!isLoggedIn) { alert("Faça login para votar."); return; }
    console.warn("API de Votos não implementada.");
  };

  const handleReply = async () => {
    if (!isLoggedIn) { alert("Faça login para responder."); return; }
    console.warn("API de Respostas não implementada.");
    // Lógica da API de Posts (POST /api/posts/:id/reply) virá aqui
    setReplyContent("");
    setIsReplying(false);
  };

  const confirmDelete = async () => {
    if (!isLoggedIn) { alert("Faça login para deletar."); return; }
    console.warn("API de Deletar não implementada.");
    // Lógica da API de Posts (DELETE /api/posts/:id) virá aqui
    setIsDeleteModalOpen(false);
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

                {/* TODO: A lógica 'currentUserId === userId' precisará ser validada com o token */}
                {isLoggedIn && currentUserId === userId && ( 
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
                  disabled={!isLoggedIn}
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
                      isLoggedIn={isLoggedIn}
                      currentUserId={currentUserId}
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