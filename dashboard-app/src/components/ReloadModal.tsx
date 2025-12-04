import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { X, Upload, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { RawTransaction } from '@/types';
import { Profile, getProfiles } from '@/services/profileService';
import { addNewTransactions, saveTransactions } from '@/services/transactionService';
import { toast } from 'react-hot-toast';

interface ReloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface UploadResult {
    added: number;
    total: number;
    conflicts?: Array<{ date: string; type: string; oldValue: string; newValue: string }>;
    hasConflicts?: boolean;
}

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

export const ReloadModal: React.FC<ReloadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [pendingTransactions, setPendingTransactions] = useState<RawTransaction[] | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadProfiles();
            setUploadResult(null);
            setError(null);
            setPendingTransactions(null);
        }
    }, [isOpen]);

    const loadProfiles = async () => {
        try {
            const data = await getProfiles();
            setProfiles(data);
            if (data.length > 0) {
                setSelectedProfileId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
            toast.error('Erro ao carregar perfis');
        } finally {
            setLoadingProfiles(false);
        }
    };

    const handleReplaceData = async () => {
        if (!pendingTransactions) return;

        setIsLoading(true);
        try {
            await saveTransactions(pendingTransactions, selectedProfileId);
            toast.success('Dados substituídos com sucesso!');

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error replacing transactions:', err);
            setError('Erro ao substituir dados: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setUploadResult(null);
        setPendingTransactions(null);

        Papa.parse<RawTransaction>(file, {
            header: true,
            delimiter: ";",
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.data && results.data.length > 0) {
                    const { invalidRows, cleanedRows } = validateRows(results.data);

                    if (invalidRows.length > 0) {
                        setError(`Encontrámos linhas inválidas no CSV. Primeira: ${invalidRows[0]}`);
                        setIsLoading(false);
                        return;
                    }

                    if (cleanedRows.length === 0) {
                        setError('O ficheiro não contém transações válidas.');
                        setIsLoading(false);
                        return;
                    }

                    try {
                        const result = await addNewTransactions(cleanedRows, selectedProfileId);
                        setUploadResult(result);

                        if (result.hasConflicts) {
                            // Store transactions for potential replace
                            setPendingTransactions(cleanedRows);
                            toast.error('Conflitos encontrados nos dados!');
                        } else if (result.added === 0) {
                            toast('Nenhuma transação nova encontrada', { icon: 'ℹ️' });
                            setTimeout(() => {
                                onClose();
                            }, 1500);
                        } else {
                            toast.success(`${result.added} transações novas adicionadas!`);
                            setTimeout(() => {
                                onSuccess();
                                onClose();
                            }, 1500);
                        }
                    } catch (err: any) {
                        console.error('Error adding transactions:', err);
                        setError('Erro ao adicionar transações: ' + (err.message || 'Erro desconhecido'));
                    }
                } else {
                    setError('O ficheiro está vazio ou não contém dados válidos.');
                }
                setIsLoading(false);
            },
            error: (err) => {
                setIsLoading(false);
                setError(`Erro ao ler o ficheiro: ${err.message}`);
                console.error("Error parsing CSV:", err);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>Carregar Novo Ficheiro</h3>
                    <button className="modal-close" onClick={onClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {!loadingProfiles && profiles.length > 1 && !uploadResult && (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                marginBottom: '8px'
                            }}>
                                Selecione o Perfil
                            </label>
                            <select
                                value={selectedProfileId}
                                onChange={(e) => setSelectedProfileId(e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                                disabled={isLoading}
                            >
                                {profiles.map(profile => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {uploadResult?.hasConflicts ? (
                        <div>
                            <div style={{
                                padding: '24px',
                                background: 'var(--color-warning-bg, #fff3cd)',
                                border: '2px solid var(--color-warning, #ffb300)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <AlertTriangle size={32} color="var(--color-warning, #ffb300)" />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.125rem' }}>Conflitos Detectados</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                            Encontrámos {uploadResult.conflicts?.length} transações com valores diferentes
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    background: 'white',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.875rem'
                                }}>
                                    {uploadResult.conflicts?.slice(0, 5).map((conflict, idx) => (
                                        <div key={idx} style={{
                                            padding: '8px 0',
                                            borderBottom: idx < Math.min(4, (uploadResult.conflicts?.length || 1) - 1) ? '1px solid var(--color-border)' : 'none'
                                        }}>
                                            <div><strong>{conflict.date}</strong> - {conflict.type}</div>
                                            <div style={{ color: 'var(--color-text-secondary)' }}>
                                                Antigo: {conflict.oldValue} → Novo: {conflict.newValue}
                                            </div>
                                        </div>
                                    ))}
                                    {(uploadResult.conflicts?.length || 0) > 5 && (
                                        <div style={{ paddingTop: '8px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                            ... e mais {(uploadResult.conflicts?.length || 0) - 5} conflitos
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{
                                padding: '16px',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '16px'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                                    <strong>O que deseja fazer?</strong>
                                </p>
                                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                    <li><strong>Cancelar</strong>: Manter os dados atuais</li>
                                    <li><strong>Substituir Tudo</strong>: Apagar dados antigos e usar apenas o novo ficheiro</li>
                                </ul>
                            </div>
                        </div>
                    ) : uploadResult && !uploadResult.hasConflicts ? (
                        <div style={{
                            padding: '24px',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                        }}>
                            <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: '16px' }} />
                            <h4 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>Upload Concluído!</h4>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                                {uploadResult.added} de {uploadResult.total} transações adicionadas
                            </p>
                            {uploadResult.added < uploadResult.total && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                    {uploadResult.total - uploadResult.added} transações já existiam
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: '16px'
                                }}>
                                    Apenas as transações novas serão adicionadas. Transações duplicadas serão ignoradas.
                                </p>
                            </div>

                            <label
                                htmlFor="reload-file-upload"
                                className="upload-area"
                                style={{
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                <input
                                    id="reload-file-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    disabled={isLoading}
                                />
                                <Upload size={48} color="var(--color-betano-orange)" />
                                <h3 className="upload-area-title">
                                    {isLoading ? 'A processar...' : 'Clique para carregar CSV'}
                                </h3>
                                <p className="upload-area-subtitle">
                                    Formato: Date;Tipe;Vaule
                                </p>
                            </label>

                            {error && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'var(--color-danger-bg)',
                                    border: '1px solid var(--color-danger)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'flex-start'
                                }}>
                                    <AlertCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)', margin: 0 }}>
                                        {error}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    {uploadResult?.hasConflicts ? (
                        <>
                            <button
                                className="btn btn-outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReplaceData}
                                disabled={isLoading}
                                style={{ background: 'var(--color-warning, #ffb300)' }}
                            >
                                Substituir Tudo
                            </button>
                        </>
                    ) : !uploadResult && (
                        <button
                            className="btn btn-outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
