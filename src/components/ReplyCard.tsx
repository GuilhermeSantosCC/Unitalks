import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button"; 
import { MessageSquareReply, Trash2, CornerDownRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from './ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReplyResponse } from '@/types';

// Props que o ReplyCard espera
interface ReplyCardProps {
    replyData: ReplyResponse;     // A resposta que este card deve renderizar
    allReplies: ReplyResponse[]; // A lista completa de todas as respostas do post
} 

export const ReplyCard: React.FC<ReplyCardProps> = ({
    replyData,
    allReplies 
}) => {
    // 2. Pega os dados da resposta atual
    const { id: replyId, post_id: postId, owner_id: userId } = replyData;
    const authorName = replyData.owner.name;
    const content = replyData.content;
    const timestamp = format(new Date(replyData.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR });

    const [isReplyingToReply, setIsReplyingToReply] = useState(false);
    const [nestedReplyContent, setNestedReplyContent] = useState('');
    const [showNestedReplies, setShowNestedReplies] = useState(false);

    const { user, isLoading: isAuthLoading } = useAuth();
    const isLoggedIn = !!user;
    const isOwner = isLoggedIn && !isAuthLoading && user?.id === userId;

    // 3. Lógica de Aninhamento: Encontra as respostas "filhas"
    const nestedReplies = allReplies.filter(reply => reply.parent_reply_id === replyId);

    // --- LÓGICA DE RESPOSTA ANINHADA ---
    const handleSendNestedReply = async () => {
      if (!isLoggedIn) { toast({ title: "Acesso Negado", description: "Faça login para responder.", variant: "destructive"}); return; }
      if (!nestedReplyContent.trim()) {
        toast({ title: "Ops!", description: "A resposta não pode estar vazia.", variant: "destructive"});
        return;
      }
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive"});
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8001/posts/${postId}/replies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            content: nestedReplyContent,
            parent_reply_id: replyId // <-- A MÁGICA: aninha a resposta
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Falha ao enviar resposta.");
        }
        
        toast({ title: "Resposta enviada!" });
        window.location.reload(); // Recarrega para ver a nova resposta aninhada

      } catch (err) {
         if (err instanceof Error) {
            toast({ title: "Erro", description: err.message, variant: "destructive" });
         }
      }
    }; 

    const handleDeleteReply = async () => {
      if (!isOwner) { toast({ title: "Acesso Negado", description: "Você não é o dono desta resposta.", variant: "destructive"}); return; }
      
      // TODO: Implementar endpoint 'DELETE /replies/{reply_id}'
      console.warn("API de Deletar Resposta ainda não implementada.");
      toast({ title: "Em breve", description: "A API para deletar respostas será implementada." });
    }; 

    return (
        <Card className="bg-muted/50 border-border/30"> 
            <CardContent className="p-3 text-sm"> 
                <div className="flex items-center gap-2 mb-1 justify-between"> 
                    <div className="flex items-center gap-2"> 
                        <h5 className="font-semibold text-foreground/90">{authorName}</h5>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                    </div>
                    {isOwner && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={handleDeleteReply} title="Apagar Resposta"> <Trash2 className="h-3 w-3" /> </Button>
                    )}
                </div>

                <p className="text-foreground/80 leading-relaxed mb-2">{content}</p> 

                <div className="flex items-center gap-2"> 
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-auto p-1 text-xs"
                        onClick={() => setIsReplyingToReply(!isReplyingToReply)}
                        disabled={!isLoggedIn}
                        title={!isLoggedIn ? "Faça login para responder" : "Responder"}
                    >
                        <MessageSquareReply className="h-3 w-3 mr-1" /> Responder
                    </Button> 
                    
                    {/* 4. Só mostra o botão se houver respostas aninhadas */}
                    {nestedReplies.length > 0 && (
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-auto p-1 text-xs" onClick={() => setShowNestedReplies(!showNestedReplies)}> 
                        <CornerDownRight className="h-3 w-3 mr-1" /> 
                        {showNestedReplies ? "Ocultar" : `Ver ${nestedReplies.length} ${nestedReplies.length > 1 ? "respostas" : "resposta"}`}
                      </Button> 
                    )}
                </div>

                 {isReplyingToReply && (
                    <div className="mt-2 space-y-2"> 
                        <Textarea placeholder={`Respondendo a ${authorName}...`} value={nestedReplyContent} onChange={(e) => setNestedReplyContent(e.target.value)} className="bg-input border-tech-gray focus:border-tech-purple text-xs" rows={2}/> 
                        <div className="flex justify-end gap-2"> 
                            <Button variant="ghost" size="sm" onClick={() => { setIsReplyingToReply(false); setNestedReplyContent(''); }}> Cancelar </Button>
                             <Button size="sm" className="bg-tech-purple hover:bg-tech-purple-dark text-white" onClick={handleSendNestedReply}> Enviar </Button> 
                        </div>
                    </div>
                 )}

                 {/* 5. Bloco para Exibir Respostas ANINHADAS (Recursão) */}
                 {showNestedReplies && (
                    <div className="mt-3 pl-4 border-l-2 border-border/30 space-y-2"> 
                        {nestedReplies.length > 0 ? (
                            nestedReplies.map(nestedReply => (
                                <ReplyCard
                                    key={nestedReply.id}
                                    replyData={nestedReply}
                                    allReplies={allReplies}
                                />
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground italic py-1">Nenhuma resposta aqui.</p>
                        )}
                    </div>
                 )}
            </CardContent>
        </Card>
    );
};