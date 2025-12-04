import { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RawTransaction } from '@/types';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useAuth } from './context/AuthContext';
import { fetchTransactions } from './services/transactionService';
import './index.css';

// Lazy load components
const UploadScreen = lazy(() => import('./components/UploadScreen'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const ProfileManager = lazy(() => import('./components/ProfileManager').then(module => ({ default: module.ProfileManager })));
const ProfileComparison = lazy(() => import('./components/ProfileComparison').then(module => ({ default: module.ProfileComparison })));

function Home() {
    const [transactions, setTransactions] = useState<RawTransaction[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);
    const [showProfileManager, setShowProfileManager] = useState(false);
    const [showProfileComparison, setShowProfileComparison] = useState(false);
    const { signOut, user } = useAuth();

    // Load saved profile selection on mount - MUST complete before loading transactions
    useEffect(() => {
        if (user?.id) {
            const savedProfileId = localStorage.getItem(`activeProfileId_${user.id}`);
            if (savedProfileId) {
                setActiveProfileId(savedProfileId === 'null' ? null : savedProfileId);
            }
            setIsProfileLoaded(true);
        }
    }, [user?.id]);

    // Load transactions from Supabase based on active profile - ONLY after profile is loaded
    useEffect(() => {
        if (isProfileLoaded) {
            loadTransactions();
        }
    }, [activeProfileId, isProfileLoaded]);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            // If activeProfileId is null, fetch all transactions (combined view)
            const data = await fetchTransactions(activeProfileId || undefined);
            setTransactions(data.length > 0 ? data : null);
        } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDataLoaded = (data: RawTransaction[]) => {
        // Reload from database after upload
        loadTransactions();
    };

    const handleProfileChange = (profileId: string | null) => {
        setActiveProfileId(profileId);
        // Save to localStorage
        if (user?.id) {
            localStorage.setItem(`activeProfileId_${user.id}`, profileId === null ? 'null' : profileId);
        }
    };

    if (isLoading) {
        return (
            <div className="container h-screen flex-center">
                <LoadingSpinner message="A carregar os seus dados..." />
            </div>
        );
    }


    return (
        <div className="app-container">
            <a href="#main-content" className="skip-link">
                Saltar para o conteúdo principal
            </a>

            <div id="main-content">
                <Suspense fallback={<div className="flex-center p-8"><LoadingSpinner message="A carregar..." /></div>}>
                    {!transactions ? (
                        <UploadScreen onDataLoaded={handleDataLoaded} />
                    ) : (
                        <Dashboard
                            rawData={transactions}
                            onSignOut={signOut}
                            activeProfileId={activeProfileId}
                            onProfileChange={handleProfileChange}
                            onManageProfiles={() => setShowProfileManager(true)}
                            onCompareProfiles={() => setShowProfileComparison(true)}
                        />
                    )}
                </Suspense>
            </div>

            <Suspense fallback={null}>
                {showProfileManager && (
                    <ProfileManager
                        isOpen={showProfileManager}
                        onClose={() => setShowProfileManager(false)}
                        onProfilesChanged={loadTransactions}
                    />
                )}

                {showProfileComparison && (
                    <ProfileComparison
                        isOpen={showProfileComparison}
                        onClose={() => setShowProfileComparison(false)}
                    />
                )}
            </Suspense>
        </div>
    );
}

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="container h-screen flex-center">
                <LoadingSpinner message="A iniciar sessão..." />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'var(--color-white)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-md)',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--color-success)',
                            secondary: 'var(--color-white)',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--color-danger)',
                            secondary: 'var(--color-white)',
                        },
                    },
                }}
            />
            <Suspense fallback={<div className="container h-screen flex-center"><LoadingSpinner /></div>}>
                <Routes>
                    <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
                    <Route path="/" element={user ? <Home /> : <Navigate to="/auth" />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
