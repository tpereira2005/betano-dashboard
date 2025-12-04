import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="container h-screen flex-center">
                    <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                        <h1 style={{ marginBottom: '16px', color: 'var(--color-danger)' }}>
                            Algo correu mal
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                            Ocorreu um erro inesperado. Por favor, tente recarregar a aplicação.
                        </p>
                        {this.state.error && (
                            <div
                                style={{
                                    background: '#FEF2F2',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '24px',
                                    textAlign: 'left',
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace'
                                }}
                            >
                                <strong>Erro:</strong> {this.state.error.message}
                            </div>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={this.handleReset}
                        >
                            Recarregar Aplicação
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
