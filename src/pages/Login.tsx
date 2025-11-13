import React, { 
    useState, 
    FormEvent, 
    ChangeEvent 
} from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useToast } from "@/components/ui/use-toast";
import './Login.css'; 

const Login: React.FC = () => {
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch("http://127.0.0.1:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData, 
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Email ou senha inválidos.");
        setLoading(false);
        return;
      }

      localStorage.setItem('userToken', data.access_token);
      
      toast({
        title: "Login efetuado!",
        description: "Você será redirecionado para a página principal.",
      });
      navigate('/'); 

    } catch (err) {
      console.error("Falha ao conectar na API:", err);
      setError('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Bem-vindo(a) de volta!</h2>
        <p>Acesse sua conta no UniTalks</p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange} 
              placeholder="Digite seu email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange} 
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="register-link">
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;