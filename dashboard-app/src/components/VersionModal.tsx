import React from 'react';
import { X, Sparkles, Bug, Zap, Palette, BarChart3 } from 'lucide-react';

interface VersionItem {
    version: string;
    date: string;
    type: 'major' | 'minor' | 'patch';
    changes: {
        category: 'feature' | 'improvement' | 'fix' | 'ui' | 'performance';
        description: string;
    }[];
}

interface VersionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const versionHistory: VersionItem[] = [
    {
        version: '2.2.4',
        date: '6 Dez 2025',
        type: 'patch',
        changes: [
            { category: 'feature', description: 'Modal de histórico de versões clicável no footer' },
            { category: 'fix', description: 'Corrigido comportamento de fullscreen em mobile' },
            { category: 'improvement', description: 'Otimização da exportação de gráficos individuais' },
        ]
    },
    {
        version: '2.2.3',
        date: '5 Dez 2025',
        type: 'patch',
        changes: [
            { category: 'feature', description: 'Insights automáticos redesenhados com visual rico' },
            { category: 'ui', description: 'Novos ícones e cores por categoria de insight' },
            { category: 'improvement', description: 'Animações de entrada escalonadas nos insights' },
            { category: 'ui', description: 'Sombras coloridas no hover dos cards de insight' },
        ]
    },
    {
        version: '2.2.2',
        date: '5 Dez 2025',
        type: 'patch',
        changes: [
            { category: 'fix', description: 'Correção das datas no header durante exportação' },
            { category: 'improvement', description: 'Datas posicionadas à direita nos exports' },
            { category: 'ui', description: 'Cor de fundo correta em dark mode nas exportações' },
        ]
    },
    {
        version: '2.2.1',
        date: '4 Dez 2025',
        type: 'patch',
        changes: [
            { category: 'ui', description: 'Títulos dos KPIs em cinza subtil no dark mode' },
            { category: 'improvement', description: 'Melhor hierarquia visual dos cards' },
        ]
    },
    {
        version: '2.2.0',
        date: '4 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'feature', description: 'Comparação de perfis com gráficos e cards visuais' },
            { category: 'feature', description: 'Banner de destaque do perfil vencedor' },
            { category: 'ui', description: 'Gráficos de barras para comparação mensal' },
            { category: 'improvement', description: 'Cards de métricas comparativas lado a lado' },
        ]
    },
    {
        version: '2.1.0',
        date: '4 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'feature', description: 'Sistema de login com Supabase Auth' },
            { category: 'feature', description: 'Toggle de visibilidade da password' },
            { category: 'feature', description: 'Confirmação de password no registo' },
            { category: 'feature', description: 'Indicador de força da password' },
            { category: 'feature', description: 'Funcionalidade "Esqueci a password"' },
            { category: 'ui', description: 'Mensagens de erro traduzidas para português' },
        ]
    },
    {
        version: '2.0.0',
        date: '3 Dez 2025',
        type: 'major',
        changes: [
            { category: 'feature', description: 'Sistema de múltiplos perfis com Supabase' },
            { category: 'feature', description: 'Perfil "Combinado" para agregar todos os dados' },
            { category: 'feature', description: 'Gestor de perfis com criar, editar e eliminar' },
            { category: 'feature', description: 'Ícones dinâmicos no seletor de perfil' },
            { category: 'performance', description: 'Code splitting com lazy loading' },
            { category: 'performance', description: 'Chunks separados para vendor libraries' },
        ]
    },
    {
        version: '1.5.0',
        date: '3 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'feature', description: 'Onboarding para novos utilizadores' },
            { category: 'feature', description: 'Upload inicial solicita nome do perfil' },
            { category: 'improvement', description: 'Limpeza de ficheiros não utilizados' },
            { category: 'improvement', description: 'README.md atualizado com documentação' },
        ]
    },
    {
        version: '1.4.0',
        date: '2 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'feature', description: '8 insights automáticos em grelha 2x4' },
            { category: 'ui', description: 'Layout refinado dos cards de insight' },
            { category: 'improvement', description: 'Ícone redundante removido do texto "Dica"' },
        ]
    },
    {
        version: '1.3.0',
        date: '2 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'ui', description: '3 KPIs principais lado a lado' },
            { category: 'ui', description: 'Cards secundários organizados em 2 linhas' },
            { category: 'improvement', description: 'Removido card "Média Global" redundante' },
        ]
    },
    {
        version: '1.2.0',
        date: '2 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'ui', description: 'Correção do hover no ecrã de upload' },
            { category: 'fix', description: 'Área de upload responsiva a cliques' },
            { category: 'ui', description: 'Estilo glass/frosted em toda a aplicação' },
        ]
    },
    {
        version: '1.1.0',
        date: '1 Dez 2025',
        type: 'minor',
        changes: [
            { category: 'ui', description: 'Branding Betano com azul escuro (#0E0F22)' },
            { category: 'ui', description: 'Header e tabelas com melhor contraste' },
            { category: 'improvement', description: 'Estética premium e profissional' },
        ]
    },
    {
        version: '1.0.0',
        date: '1 Dez 2025',
        type: 'major',
        changes: [
            { category: 'feature', description: 'Dashboard interativo completo' },
            { category: 'feature', description: 'Análise de transações Betano via CSV' },
            { category: 'feature', description: 'KPIs: depósitos, levantamentos, resultado líquido' },
            { category: 'feature', description: 'Gráfico cumulativo de evolução' },
            { category: 'feature', description: 'Gráfico de barras mensais' },
            { category: 'feature', description: 'Gráfico de distribuição por tipo' },
            { category: 'feature', description: 'Histograma de valores' },
            { category: 'feature', description: 'Variação mês-a-mês (MoM)' },
            { category: 'feature', description: 'Tabela de transações paginada e ordenável' },
            { category: 'feature', description: 'Exportação para PDF, PNG e CSV' },
            { category: 'feature', description: 'Filtros por data e tipo de transação' },
            { category: 'ui', description: 'Suporte a dark mode' },
            { category: 'ui', description: 'Design responsivo para mobile' },
        ]
    },
];

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'feature': return <Sparkles size={14} />;
        case 'improvement': return <Zap size={14} />;
        case 'fix': return <Bug size={14} />;
        case 'ui': return <Palette size={14} />;
        case 'performance': return <BarChart3 size={14} />;
        default: return <Sparkles size={14} />;
    }
};

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'feature': return 'var(--color-betano-orange)';
        case 'improvement': return '#22C55E';
        case 'fix': return '#EF4444';
        case 'ui': return '#8B5CF6';
        case 'performance': return '#3B82F6';
        default: return 'var(--color-text-secondary)';
    }
};

const getVersionTypeLabel = (type: string) => {
    switch (type) {
        case 'major': return 'Major';
        case 'minor': return 'Minor';
        case 'patch': return 'Patch';
        default: return '';
    }
};

const getVersionTypeColor = (type: string) => {
    switch (type) {
        case 'major': return 'var(--color-betano-orange)';
        case 'minor': return '#22C55E';
        case 'patch': return '#6B7280';
        default: return 'var(--color-text-secondary)';
    }
};

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content version-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '600px', maxHeight: '80vh' }}
            >
                <div className="modal-header">
                    <h3>📋 Histórico de Versões</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Fechar">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '0', overflowY: 'auto', maxHeight: 'calc(80vh - 60px)' }}>
                    <div className="version-list">
                        {versionHistory.map((item, index) => (
                            <div
                                key={item.version}
                                className={`version-item ${index === 0 ? 'version-current' : ''}`}
                            >
                                <div className="version-header">
                                    <div className="version-info">
                                        <span className="version-number">v{item.version}</span>
                                        <span
                                            className="version-type"
                                            style={{
                                                backgroundColor: `${getVersionTypeColor(item.type)}20`,
                                                color: getVersionTypeColor(item.type)
                                            }}
                                        >
                                            {getVersionTypeLabel(item.type)}
                                        </span>
                                        {index === 0 && (
                                            <span className="version-current-badge">Atual</span>
                                        )}
                                    </div>
                                    <span className="version-date">{item.date}</span>
                                </div>
                                <ul className="version-changes">
                                    {item.changes.map((change, i) => (
                                        <li key={i} className="version-change">
                                            <span
                                                className="change-icon"
                                                style={{ color: getCategoryColor(change.category) }}
                                            >
                                                {getCategoryIcon(change.category)}
                                            </span>
                                            <span className="change-text">{change.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
