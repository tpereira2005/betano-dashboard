<div align="center">

# 📊 Betano Dashboard

![Version](https://img.shields.io/badge/version-2.2.4-orange)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green?logo=supabase)

**A modern web application for detailed analysis of Betano transaction history.**

Import your CSV file and get instant insights about your wins, losses, and performance over time.

[🌐 Live Demo](https://betano-dashboard.vercel.app) • [📋 Changelog](CHANGELOG.md) • [🐛 Report Bug](https://github.com/tpereira2005/betano-dashboard/issues)

</div>

---

## ✨ Features

### 📈 Complete Visual Analysis
- **Cumulative Chart** - Balance evolution over time
- **Monthly Chart** - Results organized by month
- **Distribution Chart** - Deposits vs Withdrawals
- **Histogram** - Value distribution by ranges
- **MoM Variation** - Month-over-month percentage change

### 💡 Automatic Insights
8 smart insights generated automatically:
- 🏆 Best and worst month
- 📊 ROI and success rate
- 🔥 Profitable month streaks
- 💰 Deposit and withdrawal averages
- 📈 Trends and volatility analysis
- 💡 Personalized bankroll tips

### 👥 Profile System
- **Multiple Profiles** - Manage several accounts separately
- **Combined View** - Aggregate data from all profiles
- **Visual Comparison** - Compare 2 profiles side by side with charts
- **Winner Banner** - Highlights the best performing profile

### 🔐 Secure Authentication
- Login and Registration with Supabase Auth
- Password recovery via email
- Password strength indicator
- Persistent and secure sessions

### 📤 Professional Export
- **PDF** - Complete dashboard in high quality
- **PNG** - Dashboard image or individual charts
- **CSV** - Tabular data for Excel/Sheets

### 🎨 Premium Design
- 🌙 **Dark Mode** with vibrant colors (neon green/red)
- ✨ **Glassmorphism** - Frosted glass effects
- 📱 **Responsive** - Mobile optimized
- 🎯 **Custom Scrollbar** - Betano branding colors

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- npm or yarn
- Supabase account (free tier)

### Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/tpereira2005/betano-dashboard.git

# 2. Navigate to project folder
cd betano-dashboard/dashboard-app

# 3. Install dependencies
npm install

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `dashboard-app` root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Styling | Tools |
|----------|---------|---------|-------|
| React 18 | Supabase | Modern CSS | Vite 7 |
| TypeScript 5 | PostgreSQL | Glassmorphism | ESLint |
| Recharts | Row Level Security | CSS Animations | html2canvas |
| React Router | Supabase Auth | Dark Mode | jsPDF |

</div>

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + E` | Export transactions to CSV |
| `Ctrl + K` | Open profile comparison |
| `Tab` | Accessible navigation |

---

## 📁 Project Structure

```
dashboard-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── UploadScreen.tsx      # CSV upload screen
│   │   ├── ProfileManager.tsx    # Profile management
│   │   ├── ProfileComparison.tsx # Profile comparison
│   │   ├── VersionModal.tsx      # Version history modal
│   │   ├── dashboard/            # Dashboard components
│   │   └── common/               # Reusable components
│   ├── utils/                    # Utility functions
│   ├── lib/                      # Supabase config
│   ├── types/                    # TypeScript types
│   └── index.css                 # Global styles
├── CHANGELOG.md                  # Version history
└── package.json
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Automatic deploy on each push

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 👤 Author

<div align="center">

**Tomás Pereira**

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/tomas._14)
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/tomasp8705)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tpereira2005)

</div>

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

### ⚠️ Disclaimer

This application is a personal analysis tool and **does not promote gambling**.
Please gamble responsibly. If you have gambling problems, seek help.

---

Built with ❤️ to help manage your bankroll intelligently.

⭐ **If this project helped you, leave a star!** ⭐

</div>
