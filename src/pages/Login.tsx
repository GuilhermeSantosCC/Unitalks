

import React, { 
    useState, 
    FormEvent, 
    ChangeEvent 
} from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Login.css'; 


const Login: React.FC = () => {
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Hook de navegação (útil após o login)
  const navigate = useNavigate();

  // 2. Funções de handler de mudança (Tipando o evento: ChangeEvent<HTMLInputElement>)
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
  }

  // 3. Função de Submissão (Tipando o evento: FormEvent<HTMLFormElement>)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError(''); 

    // *** 4. Lógica de Autenticação (Integração com o Backend) ***
    console.log('Tentativa de Login com:', { email, password });

    try {
        // --- SUBSTITUA ESTA SIMULAÇÃO PELA SUA CHAMADA REAL À API ---
        
        // Exemplo:
        // const response = await fetch('/api/login', { 
        //   method: 'POST', 
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email, password }) 
        // });
        
        // if (!response.ok) {
        //     // Tratar erro HTTP
        //     throw new Error('Erro na requisição');
        // }
        
        // const data = await response.json();
        
        // SIMULAÇÃO DE SUCESSO:
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = { success: true, token: 'fake-token-do-unitalks' };
        
        if (data.success) {
            localStorage.setItem('userToken', data.token); // Salva o token
            alert('Login SIMULADO realizado com sucesso! Redirecionando...');
            navigate('/'); 
        } else {
            setError('Credenciais inválidas. Verifique seu email e senha.'); 
        }

    } catch (err) {
        
        setError('Ocorreu um erro na comunicação com o servidor. Tente novamente.');
    }
  };

 
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Bem-vindo(a) de volta!</h2>
        <p>Acesse sua conta no UniTalks</p>

        <form onSubmit={handleSubmit}>
          
          {/* Campo de Email */}
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

          {/* Campo de Senha */}
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

          <button type="submit" className="login-button">
            Entrar
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