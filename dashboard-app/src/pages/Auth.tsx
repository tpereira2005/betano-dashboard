import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, Shield, Eye, EyeOff, CheckCircle2, XCircle, KeyRound } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password';

// Helper function to translate Supabase errors to Portuguese
function translateAuthError(error: string): string {
    const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email ou password incorretos',
        'Email not confirmed': 'Email ainda não confirmado. Verifique a sua caixa de entrada.',
        'User already registered': 'Este email já está registado',
        'Password should be at least 6 characters': 'A password deve ter pelo menos 6 caracteres',
        'Invalid email': 'Email inválido',
        'Email rate limit exceeded': 'Demasiadas tentativas. Aguarde alguns minutos.',
        'For security purposes, you can only request this after': 'Por segurança, aguarde antes de tentar novamente.',
        'Unable to validate email address: invalid format': 'Formato de email inválido',
        'Signup is disabled': 'O registo está temporariamente desativado',
    };

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMap)) {
        if (error.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    return error;
}

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: 'Fraca', color: 'var(--color-danger)' };
    if (score <= 4) return { score: 2, label: 'Média', color: '#F59E0B' };
    return { score: 3, label: 'Forte', color: 'var(--color-success)' };
}

export default function Auth() {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = password === confirmPassword;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Bem-vindo de volta!');
            } else if (mode === 'register') {
                if (!passwordsMatch) {
                    toast.error('As passwords não coincidem');
                    setIsLoading(false);
                    return;
                }
                if (passwordStrength.score < 2) {
                    toast.error('Por favor, escolha uma password mais forte');
                    setIsLoading(false);
                    return;
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Conta criada! Verifique o seu email.');
            } else if (mode === 'forgot-password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth`,
                });
                if (error) throw error;
                toast.success('Email de recuperação enviado! Verifique a sua caixa de entrada.');
                setMode('login');
            }
        } catch (error: any) {
            const message = translateAuthError(error.message || 'Ocorreu um erro.');
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const getTitle = () => {
        switch (mode) {
            case 'login': return 'Bem-vindo';
            case 'register': return 'Criar Conta';
            case 'forgot-password': return 'Recuperar Password';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'login': return 'Entre para aceder aos seus dados';
            case 'register': return 'Comece a analisar as suas apostas hoje';
            case 'forgot-password': return 'Insira o seu email para recuperar a password';
        }
    };

    const getButtonText = () => {
        switch (mode) {
            case 'login': return 'Entrar';
            case 'register': return 'Começar Agora';
            case 'forgot-password': return 'Enviar Email';
        }
    };

    return (
        <div className="container h-screen flex-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card upload-card auth-card"
                style={{ maxWidth: '500px' }}
            >
                <div className="upload-header">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Betano-logo-5.png"
                        alt="Betano"
                        className="upload-logo"
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className="upload-title">{getTitle()}</h1>
                        <p className="upload-subtitle">{getSubtitle()}</p>

                        <form onSubmit={handleAuth} style={{ marginBottom: '32px' }}>
                            {/* Email Field */}
                            <div className="auth-field">
                                <label htmlFor="email" className="auth-label">
                                    Email
                                </label>
                                <div className="auth-input-wrapper">
                                    <div className="auth-input-icon">
                                        <Mail size={18} color="var(--color-text-secondary)" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input auth-input"
                                        placeholder="exemplo@email.com"
                                    />
                                </div>
                            </div>

                            {/* Password Field (not shown for forgot-password) */}
                            {mode !== 'forgot-password' && (
                                <div className="auth-field">
                                    <label htmlFor="password" className="auth-label">
                                        Password
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <div className="auth-input-icon">
                                            <Lock size={18} color="var(--color-text-secondary)" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input auth-input"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="auth-toggle-password"
                                            aria-label={showPassword ? 'Esconder password' : 'Mostrar password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} color="var(--color-text-secondary)" />
                                            ) : (
                                                <Eye size={18} color="var(--color-text-secondary)" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator (only on register) */}
                                    {mode === 'register' && password.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="password-strength"
                                        >
                                            <div className="password-strength-bar">
                                                <div
                                                    className="password-strength-fill"
                                                    style={{
                                                        width: `${(passwordStrength.score / 3) * 100}%`,
                                                        backgroundColor: passwordStrength.color,
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className="password-strength-label"
                                                style={{ color: passwordStrength.color }}
                                            >
                                                {passwordStrength.label}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Confirm Password Field (only on register) */}
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="auth-field"
                                >
                                    <label htmlFor="confirmPassword" className="auth-label">
                                        Confirmar Password
                                    </label>
                                    <div className="auth-input-wrapper">
                                        <div className="auth-input-icon">
                                            <KeyRound size={18} color="var(--color-text-secondary)" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input auth-input"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="auth-toggle-password"
                                            aria-label={showConfirmPassword ? 'Esconder password' : 'Mostrar password'}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} color="var(--color-text-secondary)" />
                                            ) : (
                                                <Eye size={18} color="var(--color-text-secondary)" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Match Indicator */}
                                    {confirmPassword.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="password-match"
                                        >
                                            {passwordsMatch ? (
                                                <>
                                                    <CheckCircle2 size={14} color="var(--color-success)" />
                                                    <span style={{ color: 'var(--color-success)' }}>
                                                        As passwords coincidem
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={14} color="var(--color-danger)" />
                                                    <span style={{ color: 'var(--color-danger)' }}>
                                                        As passwords não coincidem
                                                    </span>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* Forgot Password Link (only on login) */}
                            {mode === 'login' && (
                                <div className="auth-forgot-password">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('forgot-password')}
                                        className="auth-link"
                                    >
                                        Esqueceu a password?
                                    </button>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading || (mode === 'register' && (!passwordsMatch || passwordStrength.score < 2))}
                                className="btn btn-primary auth-submit"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {getButtonText()}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </AnimatePresence>

                <div className="auth-switch">
                    {mode === 'forgot-password' ? (
                        <>
                            <p className="auth-switch-text">
                                Lembrou-se da password?
                            </p>
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="auth-switch-btn"
                            >
                                Voltar ao login
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="auth-switch-text">
                                {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                            </p>
                            <button
                                type="button"
                                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                                className="auth-switch-btn"
                            >
                                {mode === 'login' ? 'Criar conta gratuitamente' : 'Fazer login'}
                            </button>
                        </>
                    )}
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
