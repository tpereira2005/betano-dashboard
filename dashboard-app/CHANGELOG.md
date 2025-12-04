# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste ficheiro.

## [2.2.4] - 2024-12-04

### Adicionado
- 🔲 Modo tela cheia para gráficos no mobile (botão aparece apenas em dispositivos móveis)
- 📱 Layout mobile completamente redesenhado para o header
- 🎨 Scrollbar personalizada com cores Betano (laranja no thumb)

### Corrigido
- 🔧 Dropdown de perfis agora aparece corretamente por cima de todos os elementos (Portal React)
- 🌙 Múltiplas correções de contraste no dark mode
- 📍 Z-index do seletor de perfis no mobile

---

## [2.2.3] - 2024-12-03

### Adicionado
- 🌙 Dark mode completo com cores vibrantes (verde neon para ganhos, vermelho para perdas)
- 🎛️ Toggle de tema no header com persistência em localStorage
- ✨ Toasts estilizados para dark mode

### Corrigido
- 🖼️ Footer com background transparente em ambos os modos
- 📊 Cards de comparação de perfis com cores corretas no dark mode

---

## [2.2.2] - 2024-12-02

### Adicionado
- 📊 Modal de Comparação de Perfis completamente redesenhado
- 🏆 Banner de vencedor destacando o perfil com melhor performance
- 📈 Gráficos de barras para comparação de evolução mensal
- 🎯 Cards visuais para métricas chave (ROI, Total Ganho, Média Mensal)

### Melhorado
- 🎨 Estatísticas rápidas com layout em grid
- 📱 Responsividade do modal de comparação

---

## [2.2.1] - 2024-12-01

### Adicionado
- 👤 Ícones diferenciados no seletor de perfis (User, PieChart, ArrowLeftRight)
- 🔀 Lógica condicional para esconder opções "Combinado" e "Comparar" quando há apenas 1 perfil

### Melhorado
- 🎨 Botão "Exportar" redesenhado para estilo glass
- ✨ Footer com gradiente e links para redes sociais (Instagram, X)
- 👤 Animação hover no nome do autor

---

## [2.2.0] - 2024-11-30

### Adicionado
- 👥 Sistema completo de gestão de múltiplos perfis
- 📊 Vista combinada de todos os perfis
- 🔄 Modal para carregar novo ficheiro CSV para perfil existente
- 📝 Renomear e eliminar perfis

### Melhorado
- 💾 Sincronização automática com Supabase
- 🚀 Performance com lazy loading de componentes

---

## [2.1.2] - 2024-11-28

### Adicionado
- 💡 8 Insights automáticos baseados no histórico de transações
- 📊 Análise de padrões (melhor/pior mês, streaks, volatilidade)
- 🎯 Dicas personalizadas para gestão de banca

### Corrigido
- 📱 Layout dos insights em grid 2x4

---

## [2.1.1] - 2024-11-26

### Adicionado
- ⌨️ Atalhos de teclado (Ctrl+E para CSV, Ctrl+K para comparar)
- 📸 Exportação de gráficos individuais como PNG
- 📄 Exportação completa do dashboard como PDF

### Melhorado
- 🎨 Botões com estilo glassmorphism no header

---

## [2.1.0] - 2024-11-24

### Adicionado
- 📊 Gráfico de Histograma de distribuição de valores
- 📈 Gráfico de evolução Mês-a-Mês
- 🎯 Tooltips personalizados com formatação portuguesa

### Melhorado
- 📱 Gráficos responsivos com Recharts
- 🎨 Paleta de cores consistente com branding Betano

---

## [2.0.0] - 2024-11-20

### 🎉 Major Release - Sistema de Autenticação

### Adicionado
- 🔐 **Login e Registo com Supabase Auth**
- 📧 Autenticação por email/password
- 🔑 Recuperação de password por email
- 👁️ Toggle de visibilidade da password
- 💪 Indicador de força da password
- ✅ Confirmação de password no registo
- 🌍 Mensagens de erro em Português

### Segurança
- 🔒 Proteção de rotas autenticadas
- 🍪 Sessão persistente com tokens seguros
- 🚪 Logout seguro

---

## [1.3.0] - 2024-11-15

### Adicionado
- 📊 Tabela de transações com ordenação por coluna
- 🔍 Filtro por tipo de transação (Depósito/Levantamento)
- 📄 Paginação com 10 items por página

### Melhorado
- 🎨 Visual da tabela com hover effects
- 📱 Scroll horizontal em dispositivos móveis

---

## [1.2.0] - 2024-11-10

### Adicionado
- 📈 Gráfico de Saldo Acumulado ao longo do tempo
- 💰 Cards de estatísticas principais (Depositado, Levantado, Resultado)
- 📊 Cards secundários (Média Global, Total Transações, etc.)

### Melhorado
- 🎨 Design com gradientes e sombras premium
- ✨ Animações suaves em hover

---

## [1.1.0] - 2024-11-05

### Adicionado
- 📁 Upload de ficheiros CSV com drag & drop
- 🔍 Parsing automático de transações Betano
- ✅ Validação de formato de ficheiro
- 🔒 Aviso de privacidade (processamento local)

### Corrigido
- 🐛 Tratamento de ficheiros com encoding diferente

---

## [1.0.0] - 2024-11-01

### 🎉 Lançamento Inicial

- 📊 Dashboard básico para visualização de transações
- 💰 Cálculo de lucro/prejuízo total
- 🎨 Interface com branding Betano (cores laranja e azul escuro)
- 📱 Design responsivo básico
- ⚡ Build com Vite + React + TypeScript

---

## Legenda

- 🎉 Nova funcionalidade major
- ✨ Melhoria
- 🐛 Correção de bug
- 🔒 Segurança
- 📱 Mobile/Responsivo
- 🎨 Design/UI
- ⚡ Performance
