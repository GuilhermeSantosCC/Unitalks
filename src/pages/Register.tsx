// src/pages/Register.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase'; // Import auth e db
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import da função de criar usuário
import { doc, setDoc } from 'firebase/firestore'; // Import para salvar dados no Firestore
import './Login.css'; //

const Register: React.FC = () => {
    // Estados do formulário (sem alterações)
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [college, setCollege] = useState<string>('');
    const [course, setCourse] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validações (sem alterações)
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

        try {
            // --- Cria o usuário no Firebase Authentication ---
            const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Usa a função do Firebase Auth
            const user = userCredential.user;

            if (user) {
                // --- Salva informações adicionais no Firestore ---
                // Cria uma referência para o documento do usuário na coleção 'users', usando o UID como ID
                const userDocRef = doc(db, "users", user.uid);
                // Define os dados do documento
                await setDoc(userDocRef, {
                    name: name,
                    email: user.email, // Usa o email confirmado pelo Firebase Auth
                    college: college,
                    course: course
                    // Você pode adicionar mais campos aqui se precisar, como data de criação, etc.
                });

                alert('Cadastro realizado com sucesso! Redirecionando...');
                navigate('/'); // Redireciona para a Home após sucesso
            } else {
                // Caso algo muito inesperado ocorra e o user seja nulo
                setError('Não foi possível criar o usuário. Tente novamente.');
            }

        } catch (err: any) { // Captura o erro específico do Firebase
            console.error("Erro no cadastro:", err);
            // Mapeia códigos de erro comuns para mensagens amigáveis
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('A senha é muito fraca (precisa de pelo menos 6 caracteres).');
            } else if (err.code === 'auth/invalid-email') {
                 setError('O formato do email é inválido.');
            } else {
                setError('Ocorreu um erro durante o cadastro. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    // JSX do formulário (sem alterações significativas na estrutura, apenas nos handlers que já estavam corretos)
    return (
        <div className="login-container"> {/* */}
            <div className="login-box"> {/* */}
                <h2>Crie sua conta no UniTalks</h2>
                <p>Preencha seus dados para se juntar à comunidade de discussões.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"> {/* */}
                        <label htmlFor="name">Nome:</label>
                        <input type="text" id="name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Digite seu nome ou apelido" required />
                    </div>
                    <div className="form-group"> {/* */}
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="Digite seu email" required />
                    </div>
                    <div className="form-group"> {/* */}
                        <label htmlFor="college">Faculdade/Universidade:</label>
                        <input type="text" id="college" value={college} onChange={(e: ChangeEvent<HTMLInputElement>) => setCollege(e.target.value)} placeholder="Ex: USP, FIAP, Uninove" required />
                    </div>
                    <div className="form-group"> {/* */}
                        <label htmlFor="course">Curso:</label>
                        <input type="text" id="course" value={course} onChange={(e: ChangeEvent<HTMLInputElement>) => setCourse(e.target.value)} placeholder="Ex: Ciência da Computação, Direito" required />
                    </div>
                    <div className="form-group"> {/* */}
                        <label htmlFor="password">Senha:</label>
                        <input type="password" id="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Crie sua senha (mín. 6 caracteres)" required />
                    </div>
                    <div className="form-group"> {/* */}
                        <label htmlFor="confirm-password">Confirme a Senha:</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required />
                    </div>
                    {error && <p className="error-message">{error}</p>} {/* */}
                    <button type="submit" className="login-button" disabled={loading}> {/* */}
                        {loading ? 'Cadastrando...' : 'Criar Conta'}
                    </button>
                </form>
                <p className="register-link"> {/* */}
                    Já tem uma conta? <a href="/login">Faça Login</a> {/* */}
                </p>
            </div>
        </div>
    );
};

export default Register;