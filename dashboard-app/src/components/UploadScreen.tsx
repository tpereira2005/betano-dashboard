import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle, Shield, FileSpreadsheet } from 'lucide-react';
import { RawTransaction, UploadScreenProps } from '@/types';
import { saveTransactions } from '@/services/transactionService';
import { getProfiles, createProfile, Profile } from '@/services/profileService';
import { toast } from 'react-hot-toast';

const validateRows = (data: any[]): { invalidRows: string[]; cleanedRows: RawTransaction[] } => {
    const invalidRows: string[] = [];
    const cleanedRows: RawTransaction[] = [];

    data.forEach((row, index) => {
        if (row.Date && row.Tipe && row.Vaule) {
            if (row.Tipe === 'Deposit' || row.Tipe === 'Withdrawal') {
                cleanedRows.push(row as RawTransaction);
            } else {
                invalidRows.push(`Linha ${index + 2}: Tipo inválido "${row.Tipe}"`);
            }
        } else if (row.Date || row.Tipe || row.Vaule) {
            invalidRows.push(`Linha ${index + 2}: Dados incompletos`);
        }
    });

    return { invalidRows, cleanedRows };
};

export default function UploadScreen({ onDataLoaded }: UploadScreenProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

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
                        // Get or create default profile
                        let profiles: Profile[] = await getProfiles();
                        let profileId: string;

                        if (profiles.length === 0) {
                            const newProfile = await createProfile('Principal');
                            profileId = newProfile.id;
                        } else {
                            profileId = profiles[0].id;
                        }

                        await saveTransactions(cleanedRows, profileId);
                        toast.success(`${cleanedRows.length} transações importadas com sucesso!`);
                        onDataLoaded(cleanedRows);
                    } catch (err: any) {
                        console.error('Error saving transactions:', err);
                        setError('Erro ao guardar transações: ' + (err.message || 'Erro desconhecido'));
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

    return (
        <div className="container h-screen flex-center">
            <div className="card upload-card">
                <div className="upload-header">
                    <img src="/betano-logo.png" alt="Betano Logo" className="upload-logo" />
                    <h1 className="upload-title">Dashboard de Transações</h1>
                    <p className="upload-subtitle">
                        Analisa o teu histórico de transações com gráficos e estatísticas detalhadas
                    </p>
                </div>

                <label className="upload-area">
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <>
                            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }}></div>
                            <div className="upload-area-title">A processar...</div>
                            <div className="upload-area-subtitle">Isto pode demorar alguns segundos</div>
                        </>
                    ) : (
                        <>
                            <Upload size={56} color="var(--color-betano-orange)" strokeWidth={1.5} />
                            <div className="upload-area-title">Carrega o teu ficheiro CSV</div>
                            <div className="upload-area-subtitle">
                                Arrasta aqui ou clica para selecionar
                            </div>
                        </>
                    )}
                </label>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="privacy-notice">
                    <Shield size={24} color="var(--color-success)" />
                    <div>
                        <h4>Os teus dados estão seguros</h4>
                        <p>Os dados são armazenados de forma segura e ligados à tua conta.</p>
                    </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                        <FileSpreadsheet size={16} />
                        <span>Formato suportado: CSV com colunas Date, Tipe, Vaule</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
