# SEO Command Centre

A comprehensive SEO automation platform built for Bang Digital's internal SEO team. This React-based dashboard provides a unified interface for managing SEO tasks, tools, and client workflows.

## 🚀 Features

### Core Modules
- **Dashboard** - Real-time metrics, task management, and tool overview
- **Strategy Assistant** - AI-powered SEO strategy generation
- **Content Generator** - Automated content creation with SEO optimization
- **Migration Suite** - Complete website migration planning and execution
- **Technical Monitor** - Real-time technical SEO monitoring
- **Competitive Intelligence** - Competitor tracking and analysis
- **Automation Tools** - Task scheduling and workflow automation

### Key Integrations
- **DataForSEO** - Keyword research and ranking data
- **Firecrawl MCP** - Site crawling and technical audits
- **Perplexity MCP** - AI insights and recommendations
- **OpenAI/Anthropic** - Content generation
- **Google Services** - Analytics, Search Console, Docs, Sheets
- **Apify** - Web scraping and competitor monitoring
- **Slack** - Team notifications and alerts

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Data Fetching**: React Query
- **Forms**: React Hook Form
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Build Tool**: Vite
- **Deployment**: Vercel (ready)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/geordiefrost/seo-command-centre.git
   cd seo-command-centre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Login
- **Email**: `admin@bangdigital.com.au`
- **Password**: `password123`

## 📁 Project Structure

```
seo-command-centre/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Card, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── mock/               # Mock data for development
│   ├── services/           # API service layer
│   ├── lib/                # Utility functions
│   └── utils/              # Helper functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
```env
VITE_APP_NAME=SEO Command Centre
VITE_MOCK_MODE=true
VITE_API_URL=your_api_url
VITE_DATAFORSEO_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
# ... see .env.example for full list
```

## 🎯 Current Status

### ✅ Completed (Phase 1)
- Complete UI framework and design system
- Dashboard with metrics, tools, and task management
- Mock data pipeline for all integrations
- Authentication system
- Responsive design and navigation
- TypeScript coverage

### 🔄 Next Phase
- Real API integrations
- Advanced filtering and search
- Bulk operations
- Export functionality
- Additional tool modules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. © 2024 Bang Digital. All rights reserved.

## 🆘 Support

For support, email dev@bangdigital.com.au or create an issue in this repository.

---

**Built with ❤️ by the Bang Digital team**