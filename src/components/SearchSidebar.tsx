import { useState, useEffect, KeyboardEvent } from "react";
import { Search, Plus, LogOut, User, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommentModal } from "./ui/CommentModal";
import { useToast } from "./ui/use-toast";

export function SearchSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token); 
    
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    toast({ title: "Logout efetuado", description: "Até a próxima!" });
    navigate('/login');
  };

  const handleAddComment = () => {
    if (!isLoggedIn) {
      toast({ title: "Acesso Negado", description: "Faça login para postar.", variant: "destructive" });
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  // --- LÓGICA DE PESQUISA (ENTER) ---
  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate('/');
      }
    }
  };

  // --- LÓGICA DE CRIAR POST ---
  const submitNewPost = async (contentText: string) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast({ title: "Erro", description: "Sessão expirada.", variant: "destructive" });
      navigate('/login');
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: contentText }),
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || "Falha ao criar post.");
      }

      toast({ title: "Post Criado!", description: "Seu post foi adicionado ao feed." });
      setIsModalOpen(false);
      window.location.reload(); 

    } catch (err) {
      if (err instanceof Error) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      } else {
        toast({ title: "Erro", description: "Não foi possível enviar o post.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="w-80 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="mb-6">
        
        {/* --- BOTÃO PÁGINA INICIAL --- */}
        <Button
            onClick={() => {
                setSearchTerm("");
                navigate("/");
            }}
            variant="ghost"
            className="w-full justify-start text-lg font-bold mb-4 hover:bg-white/5 text-foreground"
        >
            <Home className="mr-2 h-6 w-6" />
            Página Inicial
        </Button>

        <h2 className="text-lg font-semibold text-foreground mb-4">
          Pesquisar no Unitalks
        </h2>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar e pressionar Enter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-10 bg-input border-tech-gray focus:border-tech-purple"
          />
        </div>

        {/* Botões de Ação */}
        <Button
          onClick={handleAddComment}
          className="w-full bg-tech-purple hover:bg-tech-purple-dark text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-purple group mb-4"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Adicionar Comentário
        </Button>

        {isLoggedIn && (
          <div className="space-y-2">
            <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
            >
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
            </Button>
            <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
            </Button>
          </div>
        )}
      </div>

      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitNewPost} 
      />
    </div>
  );
}