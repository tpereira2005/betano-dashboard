import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, PieChart, User, ArrowLeftRight } from 'lucide-react';
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

    // Show skeleton while loading
    if (loading) {
        return (
            <div className="profile-selector-skeleton">
                <div className="skeleton skeleton-icon" />
                <div className="skeleton skeleton-text" />
            </div>
        );
    }

    const buttonRect = buttonRef.current?.getBoundingClientRect();

    // Render dropdown menu in portal to escape header z-index stacking context
    const dropdownContent = isOpen ? createPortal(
        <>
            <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
            <div
                className="dropdown-menu"
                style={{
                    top: buttonRect ? `${buttonRect.bottom + 8}px` : undefined,
                    left: buttonRect ? `${buttonRect.left}px` : undefined
                }}
            >
                {/* Combined view - only show if multiple profiles */}
                {profiles.length > 1 && (
                    <>
                        <button
                            onClick={() => {
                                onProfileChange(null);
                                setIsOpen(false);
                            }}
                            className={`dropdown-item ${activeProfileId === null ? 'active' : ''}`}
                        >
                            <PieChart size={16} />
                            Combinado
                        </button>

                        <div className="dropdown-divider" />
                    </>
                )}

                {/* Individual profiles */}
                {profiles.map(profile => (
                    <button
                        key={profile.id}
                        onClick={() => {
                            onProfileChange(profile.id);
                            setIsOpen(false);
                        }}
                        className={`dropdown-item ${activeProfileId === profile.id ? 'active' : ''}`}
                    >
                        <User size={16} />
                        {profile.name}
                    </button>
                ))}

                <div className="dropdown-divider" />

                {/* Compare profiles - only show if multiple profiles */}
                {onCompareProfiles && profiles.length > 1 && (
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onCompareProfiles();
                        }}
                        className="dropdown-item"
                    >
                        <ArrowLeftRight size={14} />
                        Comparar Perfis
                    </button>
                )}

                {/* Manage profiles */}
                <button
                    onClick={() => {
                        setIsOpen(false);
                        onManageProfiles();
                    }}
                    className="dropdown-item accent"
                >
                    + Gerir Perfis
                </button>
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="dropdown-wrapper">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-glass profile-selector-btn"
            >
                <div className="btn-content">
                    {activeProfileId === null ? <PieChart size={16} /> : <User size={16} />}
                    <span>{displayName}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {dropdownContent}
        </div>
    );
};
