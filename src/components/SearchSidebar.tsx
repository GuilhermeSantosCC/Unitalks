<<<<<<< Updated upstream
import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { db } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export function SearchSidebar() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddComment = async () => {
    try {
      const authorName = prompt("Por favor, digite seu nome:", "Anônimo");
      const contentText = prompt("Digite seu comentário:");

      if (contentText && authorName) {
        await addDoc(collection(db, "posts"), {
          author: authorName,
          content: contentText,
          agreeCount: 0,
          disagreeCount: 0,
          timestamp: serverTimestamp()
        });
        alert("Comentário adicionado com sucesso!");
      }
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
      alert("Ocorreu um erro ao adicionar o comentário.");
    }
  }

  return (
    <div className="w-80 p-6">
      <div className="mb-6">
        {/* --- LINHA RESTAURADA ABAIXO --- */}
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Aba de Pesquisa
        </h2>
        
=======
// src/components/SearchSidebar.tsx
import { useState, useEffect } from "react";
import { Search, Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { CommentModal } from "./ui/CommentModal"; // 👈 novo popup

export function SearchSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authorDisplayName, setAuthorDisplayName] = useState<string | null>(null);

  // --- Observador de login ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setAuthorDisplayName(userDocSnap.data().name);
          } else {
            console.warn("Documento do usuário não encontrado, usando email como nome.");
            setAuthorDisplayName(user.email);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do usuário:", error);
          setAuthorDisplayName(user.email);
        }
      } else {
        setAuthorDisplayName(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Função de adicionar comentário ---
  const handleAddComment = async (contentText: string) => {
    if (!currentUser) {
      alert("Você precisa estar logado para adicionar um comentário.");
      return;
    }

    const authorNameToSave = authorDisplayName || currentUser.email || "Anônimo";

    try {
      await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        authorName: authorNameToSave,
        content: contentText,
        agreeCount: 0,
        disagreeCount: 0,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
    }
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Ocorreu um erro ao tentar sair.");
    }
  };

  // --- JSX ---
  return (
    <div className="w-80 p-6">
      <div className="mb-6">
        {/* Título */}
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Aba de Pesquisa
        </h2>

        {/* Campo de busca */}
>>>>>>> Stashed changes
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar discussões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-tech-gray focus:border-tech-purple"
          />
        </div>

<<<<<<< Updated upstream
        <Button 
          onClick={handleAddComment}
          className="w-full bg-tech-purple hover:bg-tech-purple-dark text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-purple group"
=======
        {/* Botão Adicionar Comentário */}
        <Button
          onClick={() => setIsModalOpen(true)} // 👈 abre o modal
          disabled={!currentUser}
          className="w-full bg-tech-purple hover:bg-tech-purple-dark text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-purple group disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          title={!currentUser ? "Faça login para comentar" : "Adicionar Comentário"}
>>>>>>> Stashed changes
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Adicionar Comentário
        </Button>
<<<<<<< Updated upstream
      </div>

=======

        {/* Botão de Logout */}
        {currentUser && (
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        )}
      </div>

      {/* Card de busca */}
>>>>>>> Stashed changes
      {searchTerm && (
        <Card className="p-4 bg-gradient-card border-tech-gray">
          <h3 className="text-sm font-medium text-foreground mb-2">
            Resultados da busca
          </h3>
          <p className="text-xs text-muted-foreground">
            Buscar por: "{searchTerm}"
          </p>
        </Card>
      )}

      {/* Modal de comentário */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddComment}
      />
    </div>
<<<<<<< Updated upstream
  )
}
=======
  );
}
>>>>>>> Stashed changes
