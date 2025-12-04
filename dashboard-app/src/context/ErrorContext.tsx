import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ErrorContextType {
    error: string | null;
    setError: (error: string | null) => void;
    clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
    children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
    const [error, setErrorState] = useState<string | null>(null);

    const setError = useCallback((error: string | null) => {
        setErrorState(error);
    }, []);

    const clearError = useCallback(() => {
        setErrorState(null);
    }, []);

    return (
        <ErrorContext.Provider value={{ error, setError, clearError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = (): ErrorContextType => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};
