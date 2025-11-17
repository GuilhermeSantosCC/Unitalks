import { useState, useEffect, KeyboardEvent } from "react";
import { Search, Plus, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import { CommentModal } from "./ui/CommentModal";
import { useToast } from "./ui/use-toast";

export function SearchSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams(); // Para ler a URL atual
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token); 
    
    // Se já houver uma busca na URL, preenche o input
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

  // --- NOVA LÓGICA DE PESQUISA ---
  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        // Muda a URL para /?q=termo
        // O OpinionFeed vai perceber a mudança e recarregar
        navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        // Se limpar e der enter, volta para o feed normal
        navigate('/');
      }
    }
  };

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

      if (!response.ok) throw new Error("Falha ao criar post.");

      toast({ title: "Post Criado!", description: "Seu post foi adicionado ao feed." });
      setIsModalOpen(false);
      window.location.reload(); 

    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível enviar o post.", variant: "destructive" });
    }
  };

  return (
    <div className="w-80 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Aba de Pesquisa
        </h2>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar e pressionar Enter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch} // Escuta o Enter
            className="pl-10 bg-input border-tech-gray focus:border-tech-purple"
          />
        </div>

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