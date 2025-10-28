// src/components/ReplyCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"; //
import { Textarea } from "@/components/ui/textarea"; //
import { Button } from "@/components/ui/button"; //
import { MessageSquareReply, Trash2, CornerDownRight } from 'lucide-react'; //
import { db, auth } from '@/firebase'; //
import { collection, addDoc, serverTimestamp, doc, getDoc, deleteDoc, query, where, orderBy, onSnapshot, writeBatch, getDocs } from "firebase/firestore"; //
import { User } from "firebase/auth"; //

// Interface ReplyData (sem alterações)
interface ReplyData {
    id: string;
    postId: string;
    userId: string;
    authorName: string;
    content: string;
    timestamp: any;
    parentReplyId?: string | null;
} //

// Props do ReplyCard ATUALIZADAS
interface ReplyCardProps {
    replyId: string;
    postId: string;
    userId: string; // ID do autor DESTA resposta
    authorName: string;
    content: string;
    timestamp: string;
    currentUser: User | null; // <<< Usuário logado vindo do pai
    loggedInUserDisplayName: string | null; // <<< Nome do usuário logado vindo do pai
} //

export const ReplyCard: React.FC<ReplyCardProps> = ({
    replyId, postId, userId, authorName, content, timestamp,
    currentUser, // <<< Recebe como prop
    loggedInUserDisplayName // <<< Recebe como prop
}) => {
    // Estados
    const [isReplyingToReply, setIsReplyingToReply] = useState(false);
    const [nestedReplyContent, setNestedReplyContent] = useState('');
    // Estados currentUser e replyAuthorDisplayName REMOVIDOS
    const [nestedReplies, setNestedReplies] = useState<ReplyData[]>([]);
    const [showNestedReplies, setShowNestedReplies] = useState(false);

    // useEffect para buscar respostas ANINHADAS
    useEffect(() => {
        if (showNestedReplies && postId && replyId) {
            const repliesRef = collection(db, "posts", postId, "replies");
            const q = query(repliesRef, where("parentReplyId", "==", replyId), orderBy("timestamp", "asc"));
            const unsubscribeNested = onSnapshot(q, (snapshot) => {
                const fetchedNestedReplies = snapshot.docs.map(doc => {
                    const data = doc.data();
                    let timestampStr = "Agora";
                    if (data.timestamp) {
                        const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                        timestampStr = new Date(date).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    }
                    return { /* ... campos ... */
                        id: doc.id,
                        postId: data.postId,
                        userId: data.userId,
                        authorName: data.authorName || "Anônimo",
                        content: data.content || "",
                        timestamp: timestampStr,
                        parentReplyId: data.parentReplyId
                    } as ReplyData;
                });
                setNestedReplies(fetchedNestedReplies);
            });
            return () => unsubscribeNested();
        } else {
            setNestedReplies([]);
        }
    }, [showNestedReplies, postId, replyId]); //

    // handleSendNestedReply (Usa props)
    const handleSendNestedReply = async () => {
        if (!currentUser) { console.warn("Usuário não logado tentou enviar resposta aninhada."); return; }
        if (!nestedReplyContent.trim()) { console.warn("Tentativa de enviar resposta aninhada vazia."); return; }
        const authorNameToSave = loggedInUserDisplayName || currentUser.email || "Anônimo";
        try {
            const repliesRef = collection(db, "posts", postId, "replies");
            await addDoc(repliesRef, { postId: postId, userId: currentUser.uid, authorName: authorNameToSave, content: nestedReplyContent, timestamp: serverTimestamp(), parentReplyId: replyId });
            setNestedReplyContent(''); setIsReplyingToReply(false); console.log("Resposta aninhada enviada com sucesso!");
        } catch (error) { console.error("Erro ao enviar resposta aninhada:", error); }
    }; //

    // handleDeleteReply (Usa prop currentUser)
    const handleDeleteReply = async () => {
        if (!currentUser || currentUser.uid !== userId) { console.warn("Tentativa de apagar resposta sem permissão."); return; }
        if (window.confirm("Tem certeza que deseja apagar esta resposta?")) {
            try {
                const replyRef = doc(db, "posts", postId, "replies", replyId);
                await deleteDoc(replyRef);
                console.log("Resposta deletada permanentemente!");
                // Faltaria deletar filhos recursivamente aqui
            } catch (error) { console.error("Erro ao deletar resposta:", error); }
        }
    }; //

    return (
        <Card className="bg-muted/50 border-border/30"> {/* */}
            <CardContent className="p-3 text-sm"> {/* */}
                {/* Cabeçalho */}
                <div className="flex items-center gap-2 mb-1 justify-between"> {/* */}
                    <div className="flex items-center gap-2"> {/* */}
                        <h5 className="font-semibold text-foreground/90">{authorName}</h5>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                    </div>
                    {currentUser && currentUser.uid === userId && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={handleDeleteReply} title="Apagar Resposta"> <Trash2 className="h-3 w-3" /> </Button> //
                    )}
                </div>

                {/* Conteúdo */}
                <p className="text-foreground/80 leading-relaxed mb-2">{content}</p> {/* */}

                {/* Botões de Ação */}
                <div className="flex items-center gap-2"> {/* */}
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-auto p-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setIsReplyingToReply(!isReplyingToReply)}
                        disabled={!currentUser} // <<< Usa prop currentUser
                        title={!currentUser ? "Faça login para responder" : "Responder"}
                    >
                        <MessageSquareReply className="h-3 w-3 mr-1" /> Responder
                    </Button> {/* */}
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-auto p-1 text-xs" onClick={() => setShowNestedReplies(!showNestedReplies)}> <CornerDownRight className="h-3 w-3 mr-1" /> {showNestedReplies ? "Ocultar" : "Ver"} Respostas </Button> {/* */}
                </div>

                 {/* Campo para Resposta Aninhada */}
                 {isReplyingToReply && (
                    <div className="mt-2 space-y-2"> {/* */}
                        <Textarea placeholder={`Respondendo a ${authorName}...`} value={nestedReplyContent} onChange={(e) => setNestedReplyContent(e.target.value)} className="bg-input border-tech-gray focus:border-tech-purple text-xs" rows={2}/> {/* */}
                        <div className="flex justify-end gap-2"> {/* */}
                            <Button variant="ghost" size="sm" onClick={() => { setIsReplyingToReply(false); setNestedReplyContent(''); }}> Cancelar </Button>
                             <Button size="sm" className="bg-tech-purple hover:bg-tech-purple-dark text-white" onClick={handleSendNestedReply}> Enviar </Button> {/* */}
                        </div>
                    </div>
                 )}

                 {/* Bloco para Exibir Respostas ANINHADAS */}
                 {showNestedReplies && (
                    <div className="mt-3 pl-4 border-l-2 border-border/30 space-y-2"> {/* */}
                        {nestedReplies.length > 0 ? (
                            nestedReplies.map(nestedReply => (
                                <ReplyCard
                                    key={nestedReply.id}
                                    replyId={nestedReply.id}
                                    postId={postId}
                                    userId={nestedReply.userId}
                                    authorName={nestedReply.authorName}
                                    content={nestedReply.content || ""}
                                    timestamp={nestedReply.timestamp}
                                    currentUser={currentUser} // <<< Passa adiante
                                    loggedInUserDisplayName={loggedInUserDisplayName} // <<< Passa adiante
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