import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Profile, getProfiles, createProfile, deleteProfile, renameProfile } from '@/services/profileService';
import { toast } from 'react-hot-toast';

interface ProfileManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onProfilesChanged: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ isOpen, onClose, onProfilesChanged }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newProfileName, setNewProfileName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadProfiles();
        }
    }, [isOpen]);

    const loadProfiles = async () => {
        try {
            const data = await getProfiles();
            setProfiles(data);
        } catch (error) {
            console.error('Error loading profiles:', error);
            toast.error('Erro ao carregar perfis');
        }
    };

    const handleCreate = async () => {
        if (!newProfileName.trim()) {
            toast.error('Por favor, insira um nome');
            return;
        }

        setIsCreating(true);
        try {
            await createProfile(newProfileName.trim());
            setNewProfileName('');
            await loadProfiles();
            onProfilesChanged();
            toast.success('Perfil criado!');
        } catch (error: any) {
            console.error('Error creating profile:', error);
            toast.error(error.message || 'Erro ao criar perfil');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (profileId: string, profileName: string) => {
        if (profiles.length === 1) {
            toast.error('Não pode apagar o último perfil');
            return;
        }

        if (!confirm(`Tem a certeza que quer apagar o perfil "${profileName}"? Todas as transações associadas serão eliminadas.`)) {
            return;
        }

        try {
            await deleteProfile(profileId);
            await loadProfiles();
            onProfilesChanged();
            toast.success('Perfil eliminado');
        } catch (error) {
            console.error('Error deleting profile:', error);
            toast.error('Erro ao eliminar perfil');
        }
    };

    const handleRename = async (profileId: string) => {
        if (!editingName.trim()) {
            toast.error('Por favor, insira um nome');
            return;
        }

        try {
            await renameProfile(profileId, editingName.trim());
            setEditingId(null);
            setEditingName('');
            await loadProfiles();
            onProfilesChanged();
            toast.success('Perfil renomeado!');
        } catch (error) {
            console.error('Error renaming profile:', error);
            toast.error('Erro ao renomear perfil');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Gerir Perfis</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Create new profile */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px'
                        }}>
                            Criar Novo Perfil
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Nome do perfil (ex: Silvia)"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                                style={{ flex: 1 }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={isCreating || !newProfileName.trim()}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List of profiles */}
                    <div>
                        <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '12px'
                        }}>
                            Perfis Existentes
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {profiles.map(profile => (
                                <div
                                    key={profile.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        background: 'var(--color-bg)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)'
                                    }}
                                >
                                    {editingId === profile.id ? (
                                        <>
                                            <input
                                                type="text"
                                                className="input"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleRename(profile.id)}
                                                style={{ flex: 1, padding: '8px' }}
                                                autoFocus
                                            />
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => handleRename(profile.id)}
                                                title="Confirmar"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingName('');
                                                }}
                                                title="Cancelar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ flex: 1, fontWeight: 600 }}>
                                                {profile.name}
                                            </span>
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => {
                                                    setEditingId(profile.id);
                                                    setEditingName(profile.name);
                                                }}
                                                title="Renomear"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-outline btn-icon"
                                                onClick={() => handleDelete(profile.id, profile.name)}
                                                title="Eliminar"
                                                disabled={profiles.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
