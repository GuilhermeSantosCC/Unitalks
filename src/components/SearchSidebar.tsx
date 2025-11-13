import { useState, useEffect } from "react";
import { Search, Plus, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom"; 
import { CommentModal } from "./ui/CommentModal"; 

export function SearchSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de login
  const navigate = useNavigate(); 

  // Verifica se o usuário está logado ao carregar o componente
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token); // !! converte a string (ou null) para boolean
  }, []);

  // Função de Logout (funcional)
  const handleLogout = () => {
    localStorage.removeItem('userToken'); // Remove o token
    setIsLoggedIn(false);
    navigate('/login'); // Redireciona para o login
  };

  // Função de Adicionar Comentário (apenas abre o modal)
  const handleAddComment = () => {
    if (!isLoggedIn) {
      alert("Você precisa estar logado para adicionar um comentário.");
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  // Função que o Modal vai chamar (ainda não implementada)
  const submitNewPost = async (contentText: string) => {
    console.warn("API de Posts não implementada.");
    console.log("Conteúdo:", contentText);
    // Lógica da API de Posts virá aqui em outra branch
    setIsModalOpen(false);
  };

  return (
    <div className="w-80 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Aba de Pesquisa
        </h2>

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

        <Button
          onClick={handleAddComment}
          className="w-full bg-tech-purple hover:bg-tech-purple-dark text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-glow-purple group mb-4"
          title={!isLoggedIn ? 'Faça login para comentar' : 'Adicionar Comentário'}
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Adicionar Comentário
        </Button>

        {isLoggedIn && (
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 mb-2"
          >
            <User className="h-4 w-4 mr-2" />
            Meu Perfil
          </Button>
        )}

        {isLoggedIn && (
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

      {/* O Modal de comentário agora é "burro" */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitNewPost} // Chama a função stubbed
      />
    </div>
  );
}