import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { UploadCloud, AlertCircle, Download } from 'lucide-react';
import { UploadScreenProps, RawTransaction } from '@/types';
import { LoadingSpinner } from './common/LoadingSpinner';
import { saveTransactions } from '@/services/transactionService';
import { Profile, getProfiles, createProfile } from '@/services/profileService';
import { toast } from 'react-hot-toast';
import { downloadExampleCSV } from '@/utils/exampleData';

const FORMAT_HELP = 'Esperado: CSV separado por ";" com cabeçalho Date;Tipe;Vaule, datas YYYY-MM-DD, valores numéricos (10.50 ou 10,50) e Tipe apenas Deposit ou Withdrawal.';

const sanitizeValue = (value?: string) => {
    if (!value) return null;
    const normalized = value
        .replace(/€/g, '')
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeRow = (row: RawTransaction): RawTransaction => ({
    Date: row.Date?.trim() ?? '',
    Tipe: row.Tipe?.trim() as RawTransaction['Tipe'],
    Vaule: row.Vaule?.trim() ?? ''
});

const validateRows = (rows: RawTransaction[]) => {
    const invalidRows: string[] = [];
    const cleanedRows = rows
        .map(normalizeRow)
        .filter(row => row.Date || row.Tipe || row.Vaule);

    cleanedRows.forEach((row, index) => {
        const issues: string[] = [];

        const hasValidDate = row.Date && !Number.isNaN(new Date(row.Date).getTime());
        if (!hasValidDate) issues.push('data inválida');

        if (row.Tipe !== 'Deposit' && row.Tipe !== 'Withdrawal') {
            issues.push('Tipe deve ser Deposit ou Withdrawal');
        }

        if (sanitizeValue(row.Vaule) === null) {
            issues.push('Vaule precisa de ser numérico');
        }

        if (issues.length > 0) {
            invalidRows.push(`Linha ${index + 2}: ${issues.join(', ')}`);
        }
    });

    return { invalidRows, cleanedRows };
};

const UploadScreen: React.FC<UploadScreenProps> = ({ onDataLoaded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [newProfileName, setNewProfileName] = useState('');
    const [creatingProfile, setCreatingProfile] = useState(false);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const data = await getProfiles();
            setProfiles(data);
            if (data.length > 0) {
                setSelectedProfileId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setLoadingProfiles(false);
        }
    };

    const handleCreateProfile = async () => {
        if (!newProfileName.trim()) {
            setError('Por favor, insira um nome para o perfil');
            return;
        }

        setCreatingProfile(true);
        setError(null);
        try {
            const newProfile = await createProfile(newProfileName.trim());
            setProfiles([newProfile]);
            setSelectedProfileId(newProfile.id);
            setNewProfileName('');
            toast.success(`Perfil "${newProfile.name}" criado!`);
        } catch (error: any) {
            console.error('Error creating profile:', error);
            setError('Erro ao criar perfil: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setCreatingProfile(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('O ficheiro é demasiado grande. Tamanho máximo: 5MB');
            return;
        }

        setIsLoading(true);
        setError(null);

        Papa.parse<RawTransaction>(file, {
            header: true,
            delimiter: ";",
            skipEmptyLines: true,
            complete: (results) => {
                setIsLoading(false);

                if (results.data && results.data.length > 0) {
                    const { invalidRows, cleanedRows } = validateRows(results.data);

                    if (invalidRows.length > 0) {
                        const sample = invalidRows.slice(0, 3).join(' • ');
                        const remaining = invalidRows.length > 3
                            ? ` ...e mais ${invalidRows.length - 3} linhas com problemas.`
                            : '';
                        setError(`Encontrámos linhas inválidas no CSV (${sample}${remaining}) ${FORMAT_HELP}`);
                        return;
                    }

                    if (cleanedRows.length === 0) {
                        setError('O ficheiro não contém transações válidas. ' + FORMAT_HELP);
                        return;
                    }

                    saveTransactions(cleanedRows, selectedProfileId)
                        .then(() => {
                            onDataLoaded(cleanedRows);
                        })
                        .catch((err) => {
                            console.error('Error saving transactions:', err);
                            setError('Erro ao guardar dados na nuvem: ' + (err.message || 'Erro desconhecido'));
                        });

                } else {
                    setError('O ficheiro está vazio ou não contém dados válidos. ' + FORMAT_HELP);
                }
            },
            error: (err) => {
                setIsLoading(false);
                setError(`Erro ao ler o ficheiro: ${err.message}`);
                console.error("Error parsing CSV:", err);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="container h-screen flex-center">
                <LoadingSpinner size="large" message="A processar e guardar dados..." />
            </div>
        );
    }

    return (
        <div className="container h-screen flex-center">
            <div className="card upload-card">
                <div className="upload-header">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Betano-logo-5.png"
                        alt="Betano"
                        className="upload-logo"
                    />
                </div>

                <h1 className="upload-title">Análise de Transações</h1>
                <p className="upload-subtitle">
                    Carregue o seu ficheiro CSV de transações da Betano para gerar um dashboard detalhado.
                </p>

                {/* Profile Creation or Selection */}
                {!loadingProfiles && profiles.length === 0 ? (
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                            textAlign: 'left'
                        }}>
                            Nome do Perfil / Conta
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
                                className="input"
                                placeholder="Ex: Tomas, Silvia, etc."
                                style={{ flex: 1 }}
                                disabled={creatingProfile}
                            />
                            <button
                                onClick={handleCreateProfile}
                                className="btn btn-primary"
                                disabled={creatingProfile || !newProfileName.trim()}
                            >
                                {creatingProfile ? 'A criar...' : 'Criar'}
                            </button>
                        </div>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            marginTop: '6px',
                            textAlign: 'left'
                        }}>
                            Dê um nome ao seu perfil. Pode criar mais perfis depois para gerir várias contas.
                        </p>
                    </div>
                ) : !loadingProfiles && profiles.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px',
                            textAlign: 'left'
                        }}>
                            Perfil / Conta Betano
                        </label>
                        <select
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="input"
                            style={{ width: '100%' }}
                        >
                            {profiles.map(profile => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name}
                                </option>
                            ))}
                        </select>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            marginTop: '6px',
                            textAlign: 'left'
                        }}>
                            Escolha o perfil para associar estas transações.
                        </p>
                    </div>
                )}

                {/* File Upload Area - only show if profile is selected/created */}
                {selectedProfileId && (
                    <label className="upload-area" htmlFor="file-upload">
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            aria-label="Carregar ficheiro CSV"
                        />
                        <UploadCloud size={48} color="var(--color-betano-orange)" />
                        <h3 className="upload-area-title">Clique para carregar o CSV</h3>
                        <p className="upload-area-subtitle">
                            Suporta ficheiros .csv exportados da Betano
                        </p>
                    </label>
                )}

                {/* Download Example CSV Button */}
                {selectedProfileId && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <button
                            onClick={downloadExampleCSV}
                            className="btn btn-outline"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Download size={16} />
                            Transferir CSV de Exemplo
                        </button>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            marginTop: '8px'
                        }}>
                            Não tem certeza do formato? Transfere um ficheiro de exemplo.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="privacy-notice">
                    <AlertCircle size={20} color="var(--color-betano-blue)" />
                    <div>
                        <h4>Dados Seguros</h4>
                        <p>
                            Os seus dados são guardados de forma segura na sua conta pessoal. Apenas você tem acesso.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadScreen;
