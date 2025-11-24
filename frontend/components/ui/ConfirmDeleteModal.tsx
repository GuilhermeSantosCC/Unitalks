import React from "react";
import { Button } from "./button";
import { X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Excluir Comentário",
  message = "Tem certeza que deseja apagar este post e todas as suas respostas? Esta ação não pode ser desfeita.",
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-tech-gray rounded-2xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>

        {/* Mensagem */}
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">{message}</p>

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Apagar
          </Button>
        </div>
      </div>
    </div>
  );
}
