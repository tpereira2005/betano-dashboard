<div align="center">

# 📊 Betano Dashboard

![Version](https://img.shields.io/badge/version-2.2.4-orange)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green?logo=supabase)

**Aplicação web moderna para análise detalhada do histórico de transações da Betano.**

Importe o seu ficheiro CSV e obtenha insights instantâneos sobre os seus ganhos, perdas e performance ao longo do tempo.

[🌐 Demo Live](https://betano-dashboard.vercel.app) • [📖 Documentação](#-como-começar) • [📋 Changelog](CHANGELOG.md) • [🐛 Reportar Bug](https://github.com/tpereira2005/betano-dashboard/issues)

</div>

---

## 🖼️ Screenshots

<div align="center">

| Light Mode | Dark Mode |
|------------|-----------|
| ![Dashboard Light](https://via.placeholder.com/400x250/ffffff/0E0F22?text=Dashboard+Light) | ![Dashboard Dark](https://via.placeholder.com/400x250/0D0E1A/FF3D00?text=Dashboard+Dark) |

</div>

---

## ✨ Funcionalidades

### 📈 Análise Visual Completa
- **Gráfico Cumulativo** - Evolução do saldo ao longo do tempo
- **Gráfico Mensal** - Resultados organizados por mês
- **Gráfico de Distribuição** - Depósitos vs Levantamentos
- **Histograma** - Distribuição de valores por faixas
- **Variação MoM** - Mudança percentual mês-a-mês

### 💡 Insights Automáticos
8 insights inteligentes gerados automaticamente:
- 🏆 Melhor e pior mês
- 📊 ROI e taxa de sucesso
- 🔥 Sequências de meses lucrativos
- 💰 Médias de depósito e levantamento
- 📈 Tendências e volatilidade
- 💡 Dicas personalizadas de gestão

### 👥 Sistema de Perfis
- **Múltiplos Perfis** - Gira várias contas separadamente
- **Vista Combinada** - Agrega dados de todos os perfis
- **Comparação Visual** - Compara 2 perfis lado a lado com gráficos
- **Banner de Vencedor** - Destaca o perfil com melhor performance

### 🔐 Autenticação Segura
- Login e Registo com Supabase Auth
- Recuperação de password por email
- Indicador de força da password
- Sessões persistentes e seguras

### 📤 Exportação Profissional
- **PDF** - Dashboard completo em alta qualidade
- **PNG** - Imagem do dashboard ou gráficos individuais
- **CSV** - Dados tabelares para Excel/Sheets

### 🎨 Design Premium
- 🌙 **Dark Mode** com cores vibrantes (neon verde/vermelho)
- ✨ **Glassmorphism** - Efeitos de vidro fosco
- 📱 **Responsivo** - Otimizado para mobile
- 🎯 **Scrollbar Personalizada** - Cores Betano

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+ (recomendado: 20 LTS)
- npm ou yarn
- Conta Supabase (gratuita)

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/tpereira2005/betano-dashboard.git

# 2. Entre na pasta do projeto
cd betano-dashboard/dashboard-app

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com as suas credenciais Supabase

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do `dashboard-app`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## 🛠️ Stack Tecnológica

<div align="center">

| Frontend | Backend | Styling | Ferramentas |
|----------|---------|---------|-------------|
| React 18 | Supabase | CSS Moderno | Vite 7 |
| TypeScript 5 | PostgreSQL | Glassmorphism | ESLint |
| Recharts | Row Level Security | Animações CSS | html2canvas |
| React Router | Supabase Auth | Dark Mode | jsPDF |

</div>

### Dependências Principais

```json
{
  "react": "^18.3.1",
  "typescript": "~5.8.3",
  "vite": "^7.2.6",
  "@supabase/supabase-js": "^2.49.5",
  "recharts": "^2.15.2",
  "lucide-react": "^0.507.0",
  "papaparse": "^5.5.3",
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.1"
}
```

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + E` | Exportar transações para CSV |
| `Ctrl + K` | Abrir comparador de perfis |
| `Tab` | Navegação acessível entre elementos |

---

## 📁 Estrutura do Projeto

```
dashboard-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Componente principal
│   │   ├── UploadScreen.tsx    # Ecrã de upload CSV
│   │   ├── ProfileManager.tsx  # Gestão de perfis
│   │   ├── ProfileComparison.tsx # Comparação de perfis
│   │   ├── VersionModal.tsx    # Modal de versões
│   │   ├── dashboard/          # Sub-componentes
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── KPISection.tsx
│   │   │   ├── CumulativeChart.tsx
│   │   │   ├── MonthlyChart.tsx
│   │   │   ├── DistributionChart.tsx
│   │   │   ├── HistogramChart.tsx
│   │   │   ├── MoMChart.tsx
│   │   │   ├── InsightsCard.tsx
│   │   │   └── TransactionTable.tsx
│   │   └── common/
│   │       ├── ChartWrapper.tsx
│   │       └── ExportOverlay.tsx
│   ├── utils/
│   │   ├── calculations.ts     # Lógica de cálculos
│   │   ├── export.ts           # Exportação PDF/PNG
│   │   └── insights.ts         # Geração de insights
│   ├── lib/
│   │   └── supabase.ts         # Cliente Supabase
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── index.css               # Estilos globais
│   └── App.tsx                 # Entrada da app
├── public/
│   └── betano-logo.svg
├── CHANGELOG.md                # Histórico de versões
└── package.json
```

---

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificação ESLint
```

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Fork este repositório
2. Importa no [Vercel](https://vercel.com)
3. Adiciona as variáveis de ambiente
4. Deploy automático em cada push

### Netlify

```bash
npm run build
# Upload da pasta dist/
```

---

## 📊 Como Obter o CSV da Betano

1. Acede à tua conta Betano
2. Vai a **Conta > Histórico de Transações**
3. Seleciona o período desejado
4. Clica em **Exportar para CSV**
5. Faz upload do ficheiro na aplicação

---

## 🤝 Contribuir

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Cria uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit as alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abre um Pull Request

---

## 👤 Autor

<div align="center">

**Tomás Pereira**

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/tomas._14)
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/tomasp8705)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tpereira2005)

</div>

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o ficheiro [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

### ⚠️ Aviso Legal

Esta aplicação é uma ferramenta de análise pessoal e **não promove o jogo**.
Joga com responsabilidade. Se tens problemas com jogo, procura ajuda em [jogoresponsavel.pt](https://www.jogoresponsavel.pt).

---

Desenvolvido com ❤️ para ajudar jogadores a gerir a sua banca de forma inteligente.

⭐ **Se este projeto te ajudou, deixa uma estrela!** ⭐

</div>
