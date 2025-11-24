import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  college: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

// Cria o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor" (o componente que vai "segurar" os dados)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('userToken');
            toast({ title: "Sessão expirada", description: "Por favor, faça login novamente.", variant: "destructive" });
          }
          throw new Error("Falha ao buscar dados do usuário.");
        }

        const userData: User = await response.json();
        setUser(userData);

      } catch (err) {
        console.error("Erro no AuthContext:", err);
        localStorage.removeItem('userToken');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    toast({ title: "Logout efetuado", description: "Até a próxima!" });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}