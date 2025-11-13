import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button"; 
import { MessageSquareReply, Trash2, CornerDownRight } from 'lucide-react'; 

interface ReplyData {
    id: string;
    postId: string;
    userId: string;
    authorName: string;
    content: string;
    timestamp: any;
    parentReplyId?: string | null;
} 

interface ReplyCardProps {
    replyId: string;
    postId: string;
    userId: string; // ID do autor DESTA resposta
    authorName: string;
    content: string;
    timestamp: string;
    // Passado do CommentCard
    isLoggedIn: boolean;
    currentUserId: string | null;
} 

export const ReplyCard: React.FC<ReplyCardProps> = ({
    replyId, postId, userId, authorName, content, timestamp,
    isLoggedIn, 
    currentUserId 
}) => {
    const [isReplyingToReply, setIsReplyingToReply] = useState(false);
    const [nestedReplyContent, setNestedReplyContent] = useState('');
    const [nestedReplies, setNestedReplies] = useState<ReplyData[]>([]);
    const [showNestedReplies, setShowNestedReplies] = useState(false);

    useEffect(() => {
      if (showNestedReplies) {
        //
        // TODO: Implementar fetch para /api/posts/:postId/replies/:replyId/replies
        //
        console.warn("API de Respostas Aninhadas não implementada.");
        // setNestedReplies(dadosDaApi);
      } else {
        setNestedReplies([]);
      }
    }, [showNestedReplies, postId, replyId]); 

    const handleSendNestedReply = async () => {
      if (!isLoggedIn) { alert("Faça login para responder."); return; }
      console.warn("API de Respostas Aninhadas não implementada.");
    }; 

    const handleDeleteReply = async () => {
      if (!isLoggedIn) { alert("Faça login para deletar."); return; }
      console.warn("API de Deletar Resposta não implementada.");
    }; 

    return (
        <Card className="bg-muted/50 border-border/30"> 
            <CardContent className="p-3 text-sm"> 
                <div className="flex items-center gap-2 mb-1 justify-between"> 
                    <div className="flex items-center gap-2"> 
                        <h5 className="font-semibold text-foreground/90">{authorName}</h5>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                    </div>
                    {/* TODO: Lógica de 'currentUserId === userId' precisa ser validada com token */}
                    {isLoggedIn && currentUserId === userId && (
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
                    {/* TODO: Esconder "Ver Respostas" se não houver respostas aninhadas */}
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-auto p-1 text-xs" onClick={() => setShowNestedReplies(!showNestedReplies)}> <CornerDownRight className="h-3 w-3 mr-1" /> {showNestedReplies ? "Ocultar" : "Ver"} Respostas </Button> 
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

                 {showNestedReplies && (
                    <div className="mt-3 pl-4 border-l-2 border-border/30 space-y-2"> 
                        {nestedReplies.length > 0 ? (
                            nestedReplies.map(nestedReply => (
                                <ReplyCard
                                    key={nestedReply.id}
                                    {...nestedReply}
                                    isLoggedIn={isLoggedIn}
                                    currentUserId={currentUserId}
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