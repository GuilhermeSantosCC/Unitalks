// src/components/CommentCard.tsx

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card"; //
import { VoteButton } from "@/components/ui/vote-button"; //
import { ThumbsUp, ThumbsDown, MessageSquareReply, CornerDownRight, Trash2 } from "lucide-react"; //
import { db, auth } from "@/firebase"; //
import {
    doc, updateDoc, increment, collection, addDoc, serverTimestamp,
    getDoc, query, orderBy, onSnapshot, deleteDoc, getDocs, writeBatch
} from "firebase/firestore"; //
import { Textarea } from "@/components/ui/textarea"; //
import { Button } from "@/components/ui/button"; //
import { onAuthStateChanged, User } from "firebase/auth"; //
import { ReplyCard } from "./ReplyCard"; //

// Interface SEM isDeleted, content é string
interface CommentCardProps {
    id: string;
    userId?: string;
    author: string;
    content: string; // <<< string
    agreeCount: number;
    disagreeCount: number;
    timestamp: string;
} //

// Interface SEM isDeleted, content é string
interface ReplyData {
    id: string;
    postId: string;
    userId: string;
    authorName: string;
    content: string; // <<< string
    timestamp: any;
    parentReplyId?: string | null;
} //

export function CommentCard({
    id, // postId
    userId, // post author UserId
    author,
    content,
    agreeCount: initialAgreeCount,
    disagreeCount: initialDisagreeCount,
    timestamp
}: CommentCardProps) {
    // Estados
    const [userVote, setUserVote] = useState<'agree' | 'disagree' | null>(null);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(null);
    const [replies, setReplies] = useState<ReplyData[]>([]);
    const [showReplies, setShowReplies] = useState(false);

    // useEffect para autenticação
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                try {
                    const userDocSnap = await getDoc(userDocRef);
                    setAuthorDisplayName(userDocSnap.exists() ? userDocSnap.data().name : user.email);
                } catch (error) { console.error("Erro ao buscar nome:", error); setAuthorDisplayName(user.email); }
            } else { setAuthorDisplayName(null); }
        });
        return () => unsubscribe();
    }, []); //

    // useEffect para buscar respostas (NÃO busca isDeleted)
    useEffect(() => {
        if (showReplies && id) {
            const repliesRef = collection(db, "posts", id, "replies");
            const q = query(repliesRef, orderBy("timestamp", "asc"));
            const unsubscribeReplies = onSnapshot(q, (snapshot) => {
                const fetchedReplies = snapshot.docs.map(doc => {
                    const data = doc.data();
                    let timestampStr = "Agora";
                    if (data.timestamp) {
                        const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                        timestampStr = new Date(date).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    }
                    return {
                        id: doc.id,
                        postId: data.postId,
                        userId: data.userId,
                        authorName: data.authorName || "Anônimo",
                        content: data.content || "", // <<< Fallback string
                        timestamp: timestampStr,
                        parentReplyId: data.parentReplyId || null
                        // isDeleted removido
                    } as ReplyData;
                 });
                setReplies(fetchedReplies); // Atualização aqui dispara re-render
            });
            return () => unsubscribeReplies();
        } else {
             setReplies([]);
        }
    }, [showReplies, id]); //

    // handleVote (sem alterações)
    const handleVote = async (voteType: 'agree' | 'disagree') => { /* ... */ }; //

    // handleSendReply (sem alertas)
    const handleSendReply = async () => {
        if (!currentUser) { console.warn("Usuário não logado tentou responder."); return; }
        if (!replyContent.trim()) { console.warn("Tentativa de enviar resposta vazia."); return; }
        const authorNameToSave = authorDisplayName || currentUser.email || "Anônimo";
        try {
            const repliesRef = collection(db, "posts", id, "replies");
            await addDoc(repliesRef, { postId: id, userId: currentUser.uid, authorName: authorNameToSave, content: replyContent, timestamp: serverTimestamp() });
            setReplyContent(''); setIsReplying(false); console.log("Resposta enviada com sucesso!");
        } catch (error) { console.error("Erro ao enviar resposta:", error); }
    }; //

    // --- Função handleDeletePost com Exclusão Permanente ---
    const handleDeletePost = async () => {
        if (!currentUser || currentUser.uid !== userId) { console.warn("Tentativa de apagar post sem permissão."); return; }
        if (window.confirm("Tem certeza que deseja apagar este post e todas as suas respostas? Esta ação não pode ser desfeita.")) {
            try {
                // Apagar replies primeiro
                const repliesRef = collection(db, "posts", id, "replies");
                const repliesQuery = query(repliesRef);
                const repliesSnapshot = await getDocs(repliesQuery);
                const batch = writeBatch(db);
                repliesSnapshot.forEach((replyDoc) => { batch.delete(replyDoc.ref); });
                await batch.commit();
                console.log("Respostas associadas deletadas permanentemente.");

                // Depois apagar o post
                const postRef = doc(db, "posts", id);
                await deleteDoc(postRef);
                console.log("Post deletado permanentemente!");

            } catch (error) { console.error("Erro ao deletar post e/ou suas respostas:", error); }
        }
    }; //

    return (
        <Card className="w-full bg-gradient-card border-border/50 transition-all duration-300"> {/* */}
            <CardContent className="p-6"> {/* */}
                <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                        {/* Cabeçalho */}
                        <div className="flex items-center gap-2 justify-between"> {/* */}
                            <div className="flex items-center gap-2"> {/* */}
                                <h4 className="font-semibold text-foreground">{author}</h4>
                                <span className="text-xs text-muted-foreground">{timestamp}</span>
                            </div>
                            {currentUser && currentUser.uid === userId && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleDeletePost} title="Apagar Post"> <Trash2 className="h-4 w-4" /> </Button> //
                            )}
                        </div>

                        {/* Conteúdo */}
                        <p className="text-foreground leading-relaxed">{content}</p> {/* */}

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-3 pt-2 flex-wrap"> {/* */}
                            <VoteButton variant="agree" active={userVote === 'agree'} count={initialAgreeCount} onClick={() => handleVote('agree')}> <ThumbsUp className="h-4 w-4" /> Concordo </VoteButton> {/* */}
                            <VoteButton variant="disagree" active={userVote === 'disagree'} count={initialDisagreeCount} onClick={() => handleVote('disagree')}> <ThumbsDown className="h-4 w-4" /> Discordo </VoteButton> {/* */}
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setIsReplying(!isReplying)} disabled={!currentUser} title={!currentUser ? "Faça login para responder" : "Responder"}> <MessageSquareReply className="h-4 w-4 mr-1" /> Responder </Button> {/* */}
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => setShowReplies(!showReplies)}> <CornerDownRight className="h-3 w-3 mr-1" /> {showReplies ? "Ocultar Respostas" : "Ver Respostas"} </Button> {/* */}
                        </div>

                        {/* Campo de Resposta */}
                        {isReplying && (
                             <div className="mt-4 space-y-2 pl-4 border-l-2 border-border/50"> {/* */}
                                <Textarea placeholder="Escreva sua resposta..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="bg-input border-tech-gray focus:border-tech-purple" /> {/* */}
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => { setIsReplying(false); setReplyContent(''); }}> Cancelar </Button>
                                    <Button size="sm" className="bg-tech-purple hover:bg-tech-purple-dark text-white" onClick={handleSendReply}> Enviar Resposta </Button> {/* */}
                                </div>
                            </div>
                        )}

                        {/* Bloco para Exibir Respostas (COM FILTRO !) */}
                        {showReplies && (
                            <div className="mt-4 pl-4 border-l-2 border-border/50 space-y-3"> {/* */}
                                {replies.length > 0 ? (
                                    replies
                                        // <<< Filtro para renderizar APENAS replies de nível 1 >>>
                                        .filter(reply => !reply.parentReplyId)
                                        .map(reply => (
                                            <ReplyCard
                                                key={reply.id}
                                                replyId={reply.id}
                                                postId={id}
                                                userId={reply.userId}
                                                authorName={reply.authorName}
                                                content={reply.content || ""}
                                                timestamp={reply.timestamp}
                                                currentUser={currentUser} // <<< Passa o estado currentUser
                                                loggedInUserDisplayName={authorDisplayName}
                                                // isDeleted não existe mais
                                            />
                                        ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">Nenhuma resposta ainda.</p>
                                )}
                                {/* Mensagem se houver replies mas todas forem aninhadas */}
                               {replies.length > 0 && replies.every(reply => !!reply.parentReplyId) && !replies.some(reply => !reply.parentReplyId) && (
                                   <p className="text-xs text-muted-foreground italic">Todas as respostas estão aninhadas em outras respostas.</p>
                               )}
                            </div>
                        )}

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}