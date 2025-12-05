import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ErrorProvider } from './context/ErrorContext.tsx'
import App from './App.tsx'
import './index.css'
import './theme-transition.css'
import './dark-mode-icons.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ErrorProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ErrorProvider>
        </BrowserRouter>
    </StrictMode>,
)

