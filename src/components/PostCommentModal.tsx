import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PostCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Esta função é passada pelo SearchSidebar
  onSubmit: (content: string) => Promise<void>; 
}

export function PostCommentModal({ isOpen, onClose, onSubmit }: PostCommentModalProps) {
  const [content, setContent] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      toast({ title: "Ops!", description: "O comentário não pode estar vazio.", variant: "destructive" });
      return;
    }
    
    setIsPosting(true);
    try {
      // Chama a função que foi passada pelo SearchSidebar
      // A lógica real (o 'fetch' da API de Posts) estará lá
      await onSubmit(content); 
      
      // Limpa o conteúdo e fecha o modal ao submeter
      setContent("");
      onClose(); 
      
    } catch (error) {
      console.error("Erro ao postar comentário:", error);
      toast({ title: "Erro", description: "Falha ao enviar o comentário. Tente novamente.", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  // Limpa o textarea quando o modal é fechado
  React.useEffect(() => {
    if (!isOpen) {
      setContent("");
    }
  }, [isOpen]);

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