# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste ficheiro.

## [2.2.4] - 2025-12-06

### Adicionado
- 📋 Modal de histórico de versões clicável no footer
- 🔲 Modo tela cheia para gráficos no mobile (botão aparece apenas em dispositivos móveis)
- 📱 Layout mobile completamente redesenhado para o header
- 🎨 Scrollbar personalizada com cores Betano (laranja no thumb)

### Corrigido
- 🔧 Dropdown de perfis agora aparece corretamente por cima de todos os elementos (Portal React)
- 🌙 Múltiplas correções de contraste no dark mode
- 📍 Z-index do seletor de perfis no mobile

---

## [2.2.3] - 2025-12-05

### Adicionado
- 💡 Insights automáticos redesenhados com visual rico
- 🎨 Novos ícones e cores por categoria de insight
- ✨ Animações de entrada escalonadas nos insights
- 🌈 Sombras coloridas no hover dos cards de insight

### Corrigido
- 🖼️ Footer com background transparente em ambos os modos
- 📊 Cards de comparação de perfis com cores corretas no dark mode

---

## [2.2.2] - 2025-12-05

### Adicionado
- 📊 Correção das datas no header durante exportação
- 📈 Datas posicionadas à direita nos exports

### Melhorado
- 🎨 Cor de fundo correta em dark mode nas exportações
- 📱 Responsividade do header nos exports

---

## [2.2.1] - 2025-12-04

### Adicionado
- 🎨 Títulos dos KPIs em cinza subtil no dark mode
- ✨ Melhor hierarquia visual dos cards

---

## [2.2.0] - 2025-12-04

### Adicionado
- 📊 Modal de Comparação de Perfis completamente redesenhado
- 🏆 Banner de vencedor destacando o perfil com melhor performance
- 📈 Gráficos de barras para comparação de evolução mensal
- 🎯 Cards visuais para métricas chave (ROI, Total Ganho, Média Mensal)

### Melhorado
- 🎨 Estatísticas rápidas com layout em grid
- 📱 Responsividade do modal de comparação

---

## [2.1.0] - 2025-12-04

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

## [2.0.0] - 2025-12-03

### 🎉 Major Release - Sistema de Perfis

### Adicionado
- 👥 Sistema completo de gestão de múltiplos perfis
- 📊 Vista combinada de todos os perfis
- 🔄 Modal para carregar novo ficheiro CSV para perfil existente
- 📝 Renomear e eliminar perfis

### Melhorado
- 💾 Sincronização automática com Supabase
- 🚀 Performance com lazy loading de componentes

---

## [1.5.0] - 2025-12-03

### Adicionado
- 🎓 Onboarding para novos utilizadores
- 📁 Upload inicial solicita nome do perfil

### Melhorado
- 🧹 Limpeza de ficheiros não utilizados
- 📖 README.md atualizado com documentação

---

## [1.4.0] - 2025-12-02

### Adicionado
- 💡 8 Insights automáticos baseados no histórico de transações
- 📊 Análise de padrões (melhor/pior mês, streaks, volatilidade)
- 🎯 Dicas personalizadas para gestão de banca

### Melhorado
- 📱 Layout dos insights em grid 2x4

---

## [1.3.0] - 2025-12-02

### Adicionado
- 📊 3 KPIs principais lado a lado
- 🎨 Cards secundários organizados em 2 linhas

### Melhorado
- ✂️ Removido card "Média Global" redundante

---

## [1.2.0] - 2025-12-02

### Adicionado
- 📈 Gráfico de Saldo Acumulado ao longo do tempo
- 💰 Cards de estatísticas principais (Depositado, Levantado, Resultado)
- 📊 Cards secundários (Média Global, Total Transações, etc.)

### Melhorado
- 🎨 Design com gradientes e sombras premium
- ✨ Animações suaves em hover
- 🔮 Estilo glass/frosted em toda a aplicação

---

## [1.1.0] - 2025-12-01

### Adicionado
- 📁 Upload de ficheiros CSV com drag & drop
- 🔍 Parsing automático de transações Betano
- ✅ Validação de formato de ficheiro
- 🔒 Aviso de privacidade (processamento local)

### Melhorado
- 🎨 Branding Betano com azul escuro (#0E0F22)
- 📊 Header e tabelas com melhor contraste

---

## [1.0.0] - 2025-12-01

### 🎉 Lançamento Inicial

- 📊 Dashboard básico para visualização de transações
- 💰 Cálculo de lucro/prejuízo total
- 🎨 Interface com branding Betano (cores laranja e azul escuro)
- 📱 Design responsivo básico
- ⚡ Build com Vite + React + TypeScript
- 📈 Gráficos: cumulativo, mensal, distribuição, histograma, MoM
- 📋 Tabela de transações paginada e ordenável
- 📤 Exportação para PDF, PNG e CSV
- 🌙 Suporte a dark mode

---

## Legenda

- 🎉 Nova funcionalidade major
- ✨ Melhoria
- 🐛 Correção de bug
- 🔒 Segurança
- 📱 Mobile/Responsivo
- 🎨 Design/UI
- ⚡ Performance
