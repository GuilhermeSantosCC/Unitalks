import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const UNIVERSITIES = [
  "USP - Universidade de São Paulo",
  "UNICAMP - Universidade Estadual de Campinas",
  "UNESP - Universidade Estadual Paulista",
  "UFRJ - Universidade Federal do Rio de Janeiro",
  "UFMG - Universidade Federal de Minas Gerais",
  "UNINOVE - Universidade Nove de Julho",
  "FIAP",
  "PUC - Pontifícia Universidade Católica",
  "Estácio",
  "Outra"
];

const COURSES = [
  "Ciência da Computação",
  "Engenharia de Software",
  "Sistemas de Informação",
  "Análise e Desenvolvimento de Sistemas",
  "Direito",
  "Medicina",
  "Administração",
  "Psicologia",
  "Engenharia Civil",
  "Outro"
];

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isStudent, setIsStudent] = useState(false);
  const [college, setCollege] = useState(''); 
  const [course, setCourse] = useState('');   

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Preencha os campos obrigatórios.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    const userData = {
      name,
      username,
      email,
      password,
      college: isStudent ? college : null,
      course: isStudent ? course : null
    };
    
    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData), 
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Erro no cadastro.");
        setLoading(false);
        return;
      }

      toast({ title: "Sucesso!", description: `Bem-vindo, @${data.username}!` });
      navigate('/login'); 

    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] bg-[radial-gradient(circle_at_50%_0%,#1a1a2e_0%,transparent_70%)] font-sans p-4 py-10">
      
      <div className="relative w-full max-w-[550px] bg-[#141414]/60 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.1)] rounded-3xl p-8 overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />

        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold mb-2 text-white">Criar Conta</h1>
            <p className="text-gray-400 text-sm">Junte-se ao UniTalks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-gray-300 ml-1">Nome de Exibição <span className="text-purple-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-gray-300 ml-1">Usuário (@) <span className="text-purple-500">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-gray-300 ml-1">Email <span className="text-purple-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
              required
            />
          </div>

          {/* Checkbox Customizado Tailwind */}
          <div className="flex items-center gap-3 my-5 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
            <input 
              type="checkbox" 
              id="isStudent" 
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
            />
            <label htmlFor="isStudent" className="cursor-pointer text-sm text-gray-300 select-none font-medium">
                Sou estudante universitário (Opcional)
            </label>
          </div>

          {/* Área Opcional Animada */}
          {isStudent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-gray-300 ml-1">Universidade</label>
                <select 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-gray-300 ml-1">Curso</label>
                <select 
                  value={course} 
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-gray-300 ml-1">Senha <span className="text-purple-500">*</span></label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
                    required
                />
            </div>
            <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-gray-300 ml-1">Confirmar <span className="text-purple-500">*</span></label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
                    required
                />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 text-white font-semibold text-sm shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-[1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</> : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Já possui uma conta? 
          <a href="/login" className="text-purple-400 hover:text-white font-medium ml-1 transition-colors hover:underline">
            Faça Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;