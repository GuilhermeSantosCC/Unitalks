import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// --- LISTAS DE PERNAMBUCO & TECNOLOGIA ---

const PE_UNIVERSITIES = [
  "CESAR School",
  "UFPE - Universidade Federal de Pernambuco",
  "UFRPE - Universidade Federal Rural de Pernambuco",
  "UPE - Universidade de Pernambuco",
  "UNICAP - Universidade Católica de Pernambuco",
  "IFPE - Instituto Federal de Pernambuco",
  "Faculdade Senac PE",
  "UNINASSAU - Centro Universitário Maurício de Nassau",
  "UNIT - Universidade Tiradentes",
  "FBV - Faculdade Boa Viagem (Wyden)",
  "Faculdade ESUDA",
  "FICR - Faculdade Imaculada Conceição do Recife",
  "FAFIRE - Faculdade Frassinetti do Recife",
  "Outra" // Opção gatilho
].sort();

const TECH_COURSES = [
  "Análise e Desenvolvimento de Sistemas",
  "Ciência da Computação",
  "Ciência de Dados (Data Science)",
  "Defesa Cibernética",
  "Design de Games / Jogos Digitais",
  "Engenharia da Computação",
  "Engenharia de Software",
  "Gestão da Tecnologia da Informação",
  "Inteligência Artificial",
  "Redes de Computadores",
  "Segurança da Informação",
  "Sistemas de Informação",
  "Sistemas para Internet",
  "Outro" // Opção gatilho
].sort();

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados Opcionais
  const [isStudent, setIsStudent] = useState(false);
  
  // Lógica de Seleção + Campo Customizado
  const [college, setCollege] = useState(''); 
  const [customCollege, setCustomCollege] = useState(''); // Para digitar a faculdade
  
  const [course, setCourse] = useState('');   
  const [customCourse, setCustomCourse] = useState(''); // Para digitar o curso

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // --- VALIDAÇÕES ---
  
  const validateUsername = (user: string) => {
    const regex = /^[a-zA-Z0-9._-]{3,20}$/;
    const isOnlyNumbers = /^[0-9]+$/.test(user);
    
    if (!regex.test(user)) return "Usuário deve ter 3-20 caracteres (letras, números, . - _)";
    if (isOnlyNumbers) return "Usuário não pode conter apenas números.";
    return null;
  };

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(pass)) {
      return "Senha fraca: Mínimo 8 caracteres, com maiúscula, minúscula, número e especial (@$!%*?&).";
    }
    if (pass.includes(" ")) return "A senha não pode conter espaços.";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Validação de Campos Obrigatórios
    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    if (name.length < 2 || name.length > 50) {
      setError('Nome de exibição deve ter entre 2 e 50 caracteres.');
      setLoading(false);
      return;
    }

    const userError = validateUsername(username);
    if (userError) {
      setError(userError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }
    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      setLoading(false);
      return;
    }

    // --- Lógica do "Outro" ---
    // Se selecionou "Outra", usa o valor digitado. Se não, usa o valor do select.
    let finalCollege = null;
    let finalCourse = null;

    if (isStudent) {
      // Validação da Faculdade
      if (!college) {
        setError('Selecione uma universidade ou desmarque a opção de estudante.');
        setLoading(false);
        return;
      }
      if (college === "Outra" && !customCollege.trim()) {
        setError('Por favor, digite o nome da sua universidade.');
        setLoading(false);
        return;
      }
      finalCollege = college === "Outra" ? customCollege : college;

      // Validação do Curso (Só se tiver faculdade)
      if (college) {
          if (!course) {
             setError('Selecione um curso.');
             setLoading(false);
             return;
          }
          if (course === "Outro" && !customCourse.trim()) {
              setError('Por favor, digite o nome do seu curso.');
              setLoading(false);
              return;
          }
          finalCourse = course === "Outro" ? customCourse : course;
      }
    }

    // Preparar dados para API
    const userData = {
      name,
      username,
      email,
      password,
      college: finalCollege,
      course: finalCourse
    };
    
    try {
      const response = await fetch("fetch(\${import.meta.env.VITE_API_URL_USER}/register/", {
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

      toast({ 
        title: "Cadastro realizado! 🎉", 
        description: `Bem-vindo, @${data.username}! Faça login para continuar.` 
      });
      navigate('/login'); 

    } catch (err) {
      setError('Erro ao conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] bg-[radial-gradient(circle_at_50%_0%,#1a1a2e_0%,transparent_70%)] font-sans p-4 py-10">
      
      <div className="relative w-full max-w-[600px] bg-[#141414]/60 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.1)] rounded-3xl p-8 overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />

        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold mb-2 text-white">Criar Conta</h1>
            <p className="text-gray-400 text-sm">Junte-se à comunidade UniTalks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nome e Usuário na mesma linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-[10px] text-gray-500 ml-1">3-20 caracteres, letras e números</p>
            </div>
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
              
              {/* Seleção de Universidade */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-gray-300 ml-1">Universidade</label>
                <select 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione sua instituição...</option>
                  {PE_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {/* Campo condicional para digitar universidade */}
                {college === "Outra" && (
                   <input
                    type="text"
                    value={customCollege}
                    onChange={(e) => setCustomCollege(e.target.value)}
                    placeholder="Digite o nome da sua universidade"
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 animate-in fade-in"
                   />
                )}
              </div>
              
              {/* Seleção de Curso (Só aparece se tiver faculdade selecionada) */}
              {college && (
                  <div className="space-y-1.5 text-left animate-in fade-in slide-in-from-top-1">
                      <label className="text-xs font-medium text-gray-300 ml-1">Curso</label>
                      <select 
                        value={course} 
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Selecione seu curso...</option>
                        {TECH_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {/* Campo condicional para digitar curso */}
                      {course === "Outro" && (
                        <input
                            type="text"
                            value={customCourse}
                            onChange={(e) => setCustomCourse(e.target.value)}
                            placeholder="Digite o nome do seu curso"
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 animate-in fade-in"
                        />
                      )}
                  </div>
              )}
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
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 text-white font-semibold text-sm shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-[1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Validando...</> : 'Finalizar Cadastro'}
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