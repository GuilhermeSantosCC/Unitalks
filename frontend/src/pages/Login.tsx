import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react"; // Ícone de loading se tiver

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');

    if (!identifier || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const formData = new URLSearchParams();
    formData.append('username', identifier); 
    formData.append('password', password);

    try {
      const response = await fetch("http://127.0.0.1:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData, 
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Credenciais inválidas.");
        setLoading(false);
        return;
      }

      localStorage.setItem('userToken', data.access_token);
      toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
      navigate('/'); 

    } catch (err) {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] bg-[radial-gradient(circle_at_50%_0%,#1a1a2e_0%,transparent_70%)] font-sans p-4">
      
      {/* Card Central com Glassmorphism */}
      <div className="relative w-full max-w-md bg-[#141414]/60 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.1)] rounded-3xl p-8 overflow-hidden">
        
        {/* Borda Neon Superior */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />

        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Unitalks
            </h1>
            <p className="text-gray-400 text-sm">
              Entre para conectar-se com sua comunidade acadêmica
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-gray-300 ml-1">Email ou Usuário</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-gray-300 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 text-white font-semibold text-sm shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-[1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin" /> Acessando...
               </>
            ) : 'Entrar na Plataforma'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Ainda não tem uma conta? 
          <a href="/register" className="text-purple-400 hover:text-white font-medium ml-1 transition-colors hover:underline">
            Criar conta
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;