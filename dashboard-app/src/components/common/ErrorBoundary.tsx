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
                    <div className="card error-card">
                        <div className="error-emoji">⚠️</div>
                        <h1 className="error-title">
                            Algo correu mal
                        </h1>
                        <p className="error-description">
                            Ocorreu um erro inesperado. Por favor, tente recarregar a aplicação.
                        </p>
                        {this.state.error && (
                            <div className="error-details">
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
