// src/pages/Login.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase'; // Import auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import da função de login
import './Login.css'; //

const Login: React.FC = () => {
    // Estados do formulário (sem alterações)
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // Handlers (sem alterações)
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validação (sem alterações)
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }

        try {
            // --- Tenta fazer login com Firebase Auth ---
            await signInWithEmailAndPassword(auth, email, password); // Usa a função do Firebase Auth

            alert('Login realizado com sucesso! Redirecionando...');
            navigate('/'); // Redireciona para a Home após sucesso

        } catch (err: any) { // Captura o erro específico do Firebase
            console.error("Erro no login:", err);
            // Mapeia códigos de erro comuns do Firebase para mensagens amigáveis
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                 setError('Email ou senha inválidos. Verifique suas credenciais.');
            } else if (err.code === 'auth/invalid-email') {
                setError('O formato do email é inválido.');
            } else if (err.code === 'auth/too-many-requests') {
                 setError('Muitas tentativas de login falharam. Tente novamente mais tarde.');
            } else {
                setError('Ocorreu um erro durante o login. Verifique sua conexão ou tente novamente.');
            }
        } finally {
            setLoading(false); // Desativa o loading em caso de sucesso ou erro
        }
    };

    // JSX do formulário (sem alterações significativas na estrutura)
    return (
        <div className="login-container"> {/* */}
            <div className="login-box"> {/* */}
                <h2>Bem-vindo(a) de volta!</h2>
                <p>Acesse sua conta no UniTalks</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"> {/* */}
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" value={email} onChange={handleEmailChange} placeholder="Digite seu email" required />
                    </div>
                    <div className="form-group"> {/* */}
                        <label htmlFor="password">Senha:</label>
                        <input type="password" id="password" value={password} onChange={handlePasswordChange} placeholder="Digite sua senha" required />
                    </div>

                    {error && <p className="error-message">{error}</p>} {/* */}
                    <button type="submit" className="login-button" disabled={loading}> {/* */}
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className="register-link"> {/* */}
                    Não tem uma conta? <a href="/register">Cadastre-se</a> {/* */}
                </p>
            </div>
        </div>
    );
};

export default Login;