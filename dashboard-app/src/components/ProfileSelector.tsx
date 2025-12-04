import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { Profile, getProfiles } from '@/services/profileService';

interface ProfileSelectorProps {
    activeProfileId: string | null;
    onProfileChange: (profileId: string | null) => void;
    onManageProfiles: () => void;
    onCompareProfiles?: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
    activeProfileId,
    onProfileChange,
    onManageProfiles,
    onCompareProfiles
}) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const data = await getProfiles();
            setProfiles(data);
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const displayName = activeProfileId === null ? 'Combinado' : (activeProfile?.name || 'Carregando...');

    if (loading) return null;

    // Get button position for dropdown placement
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    return (
        <div style={{ position: 'relative' }}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-outline"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '180px',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} />
                    <span>{displayName}</span>
                </div>
                <ChevronDown size={16} style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </button>

            {isOpen && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: buttonRect ? `${buttonRect.bottom + 8}px` : '100%',
                            left: buttonRect ? `${buttonRect.left}px` : '0',
                            minWidth: '220px',
                            background: 'white',
                            border: '2px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        <div style={{ padding: '8px 0' }}>
                            {/* Combined view */}
                            <button
                                onClick={() => {
                                    onProfileChange(null);
                                    setIsOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    textAlign: 'left',
                                    background: activeProfileId === null ? 'var(--color-bg)' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: activeProfileId === null ? 600 : 400,
                                    color: 'var(--color-text)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = activeProfileId === null ? 'var(--color-bg)' : 'transparent'}
                            >
                                📊 Combinado
                            </button>

                            <div style={{
                                height: '1px',
                                background: 'var(--color-border)',
                                margin: '8px 0'
                            }} />

                            {/* Individual profiles */}
                            {profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => {
                                        onProfileChange(profile.id);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        textAlign: 'left',
                                        background: activeProfileId === profile.id ? 'var(--color-bg)' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeProfileId === profile.id ? 600 : 400,
                                        color: 'var(--color-text)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = activeProfileId === profile.id ? 'var(--color-bg)' : 'transparent'}
                                >
                                    {profile.name}
                                </button>
                            ))}

                            <div style={{
                                height: '1px',
                                background: 'var(--color-border)',
                                margin: '8px 0'
                            }} />

                            {/* Manage profiles */}
                            {onCompareProfiles && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onCompareProfiles();
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        textAlign: 'left',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text)',
                                        fontWeight: 400,
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Users size={14} />
                                    Comparar Perfis
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onManageProfiles();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    textAlign: 'left',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-betano-orange)',
                                    fontWeight: 600,
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                + Gerir Perfis
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
