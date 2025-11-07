// src/components/ui/CommentModal.tsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button"; // seu botão existente

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export function CommentModal({ isOpen, onClose, onSubmit }: CommentModalProps) {
  const [content, setContent] = useState("");

  // limpa quando modal fecha
  useEffect(() => {
    if (!isOpen) setContent("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (content.trim() === "") return;
    onSubmit(content.trim());
    setContent("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0f0f10] border border-tech-gray rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-3">Novo Comentário</h2>

        {/* textarea simples — não depende de outros componentes */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que você quer compartilhar?"
          rows={6}
          className="w-full min-h-[120px] bg-[#121212] text-foreground border border-tech-gray rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-tech-purple"
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="px-4 py-2 bg-tech-purple hover:bg-tech-purple-dark">
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;