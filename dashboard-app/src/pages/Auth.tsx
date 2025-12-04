import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, Shield } from 'lucide-react';

export default function Auth() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Bem-vindo de volta!');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Conta criada! Verifique o seu email.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container h-screen flex-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card upload-card"
                style={{ maxWidth: '500px' }}
            >
                <div className="upload-header">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Betano-logo-5.png"
                        alt="Betano"
                        className="upload-logo"
                    />
                </div>

                <motion.h1
                    key={isLogin ? 'login-title' : 'register-title'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="upload-title"
                >
                    {isLogin ? 'Bem-vindo' : 'Criar Conta'}
                </motion.h1>
                <p className="upload-subtitle">
                    {isLogin
                        ? 'Entre para aceder aos seus dados'
                        : 'Comece a analisar as suas apostas hoje'}
                </p>

                <form onSubmit={handleAuth} style={{ marginBottom: '32px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label
                            htmlFor="email"
                            style={{
                                display: 'block',

                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontSize: '0.75rem'
                            }}
                        >
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Mail size={18} color="var(--color-text-secondary)" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="exemplo@email.com"
                                style={{
                                    width: '100%',
                                    paddingLeft: '44px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                        <label
                            htmlFor="password"
                            style={{
                                display: 'block',

                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontSize: '0.75rem'
                            }}
                        >
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Lock size={18} color="var(--color-text-secondary)" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                minLength={6}
                                style={{
                                    width: '100%',
                                    paddingLeft: '44px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px' }}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'Entrar' : 'Começar Agora'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div style={{
                    paddingTop: '24px',
                    borderTop: '2px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '12px'
                    }}>
                        {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-betano-orange)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px',
                            transition: 'var(--transition-smooth)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-betano-orange-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-betano-orange)'}
                    >
                        {isLogin ? 'Criar conta gratuitamente' : 'Fazer login'}
                    </button>
                </div>

                <div className="privacy-notice" style={{ marginTop: '28px' }}>
                    <Shield size={20} color="var(--color-betano-blue)" />
                    <div>
                        <h4>Dados Seguros</h4>
                        <p>
                            Os seus dados são guardados de forma segura na sua conta pessoal. Apenas você tem acesso.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
