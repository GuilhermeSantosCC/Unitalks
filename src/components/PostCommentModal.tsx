// components/PostCommentModal.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast"; // Assumindo que você usa um sistema de toast/notificação

interface PostCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Opcional: Se a postagem estiver relacionada a um ID de discussão, adicione aqui.
  // Neste caso, vamos criar um novo post geral.
  // discussionId?: string; 
}

export function PostCommentModal({ isOpen, onClose }: PostCommentModalProps) {
  const [content, setContent] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);
  const currentUser = auth.currentUser; // Pega o usuário logado

  const handlePost = async () => {
    if (!content.trim()) {
      toast({ title: "Ops!", description: "O comentário não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (!currentUser) {
      toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para comentar.", variant: "destructive" });
      return;
    }

    setIsPosting(true);
    try {
      // Cria um novo post na coleção 'posts' (que seus CommentCards leem)
      await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        author: currentUser.displayName || "Usuário Anônimo",
        content: content,
        agreeCount: 0,
        disagreeCount: 0,
        timestamp: serverTimestamp(),
      });

      toast({ title: "Sucesso!", description: "Seu comentário foi postado.", variant: "default" });
      setContent("");
      onClose();
    } catch (error) {
      console.error("Erro ao postar comentário:", error);
      toast({ title: "Erro", description: "Falha ao enviar o comentário. Tente novamente.", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1D1D1D] border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
        <h2 className="text-xl font-bold text-white mb-4">Adicionar Novo Comentário</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva sua opinião ou inicie uma discussão..."
          rows={5}
          className="mb-4 bg-gray-700 border-gray-600 text-white focus:ring-purple-500"
        />
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isPosting}>
            Cancelar
          </Button>
          <Button
            onClick={handlePost}
            disabled={isPosting || !content.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isPosting ? "Enviando..." : "Postar Comentário"}
          </Button>
        </div>
      </div>
    </div>
  );
}