import React, { 
    useState, 
    FormEvent, 
    ChangeEvent 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import './Login.css'; 

const Register: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [college, setCollege] = useState<string>(''); 
  const [course, setCourse] = useState<string>('');   
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !email || !college || !course || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('A senha e a confirmação de senha não coincidem.');
      setLoading(false);
      return;
    }

    const userData = {
      name: name,
      email: email,
      college: college,
      course: course,
      password: password
    };
    
    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData), 
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Ocorreu um erro desconhecido no cadastro.");
        setLoading(false);
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Conta criada. Agora você pode fazer o login.",
      });
      navigate('/login'); 

    } catch (err) {
      console.error("Falha ao conectar na API:", err); // Manter console.error para debug
      setError('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Crie sua conta no UniTalks</h2>
        <p>Preencha seus dados para se juntar à comunidade de discussões.</p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Digite seu nome ou apelido"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="college">Faculdade/Universidade:</label>
            <input
              type="text"
              id="college"
              value={college}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCollege(e.target.value)}
              placeholder="Ex: USP, FIAP, Uninove"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="course">Curso:</label>
            <input
              type="text"
              id="course"
              value={course}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCourse(e.target.value)}
              placeholder="Ex: Ciência da Computação, Direito"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Crie sua senha (mín. 6 caracteres)"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirme a Senha:</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="register-link">
          Já tem uma conta? <a href="/login">Faça Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;