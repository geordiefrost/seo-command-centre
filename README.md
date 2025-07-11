# SEO Command Centre

A comprehensive SEO automation platform built for Bang Digital's internal SEO team. This React-based dashboard provides a unified interface for managing SEO tasks, tools, and client workflows with real-time data integration.

## 🚀 Features

### Core Modules
- **Dashboard** - Real-time metrics, task management, and tool overview
- **Client Management** - Complete client onboarding, profiles, and crawl insights
- **Strategy Assistant** - AI-powered SEO strategy generation
- **Content Generator** - Automated content creation with SEO optimization
- **Migration Suite** - Complete website migration planning and execution
- **Technical Monitor** - Real-time technical SEO monitoring
- **Competitive Intelligence** - Competitor tracking and analysis
- **Automation Tools** - Task scheduling and workflow automation

### Client Management System ✅
- **Client Onboarding Wizard** - Guided setup with real-time website analysis
- **Firecrawl Integration** - Live website crawling and technical insights
- **Client Profiles** - Comprehensive client dashboards with SEO recommendations
- **Business Intelligence** - Client categorization (B2B, B2C, Local, E-commerce)
- **Location & Market Targeting** - Geographic and demographic insights
- **Status Management** - Active, paused, and archived client tracking

### Key Integrations
- **Supabase** - PostgreSQL database with real-time subscriptions
- **DataForSEO** - Keyword research and ranking data
- **Firecrawl** - Site crawling and technical audits
- **Perplexity MCP** - AI insights and recommendations
- **OpenAI/Anthropic** - Content generation
- **Google Services** - Analytics, Search Console, Docs, Sheets
- **Apify** - Web scraping and competitor monitoring
- **Slack** - Team notifications and alerts

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
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
- Supabase account (for database)

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
   cp .env.example .env.local
   ```

4. **Configure your .env.local file**
   ```env
   # Database
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # API Keys
   VITE_DATAFORSEO_API_KEY=your_dataforseo_key
   VITE_FIRECRAWL_API_KEY=your_firecrawl_key
   VITE_OPENAI_API_KEY=your_openai_key
   
   # App Settings
   VITE_APP_NAME=SEO Command Centre
   VITE_MOCK_MODE=false
   ```

5. **Set up the database**
   ```bash
   # Run the SQL schema in your Supabase dashboard
   # File: src/lib/database.sql
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Login
- **Email**: `admin@bangdigital.com.au`
- **Password**: `password123`

## 📁 Project Structure

```
seo-command-centre/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Card, Modal)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── clients/        # Client management components
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Clients.tsx     # Client management page
│   │   └── ...            # Other pages
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts       # Core types
│   │   └── database.ts    # Database types
│   ├── mock/               # Mock data for development
│   ├── services/           # API service layer
│   │   ├── database/      # Database services
│   │   └── integrations/  # External API integrations
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

## 🗄️ Database Schema

### Enhanced Client Management Tables

```sql
-- Clients table with enhanced fields
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('retainer', 'project')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'paused', 'archived')),
  website_url VARCHAR(500) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('B2B', 'B2C', 'Local', 'E-commerce')),
  primary_location VARCHAR(255) NOT NULL,
  target_markets TEXT[] DEFAULT '{}',
  accelo_company_id VARCHAR(50),
  search_console_property_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawl data tables for storing website analysis
CREATE TABLE crawl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  firecrawl_job_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Additional tables for comprehensive SEO data management
-- See src/lib/database.sql for complete schema
```

## 🎯 Current Status & Progress

### ✅ Completed Features (85% Complete)

#### Phase 1: Core Infrastructure
- ✅ Complete UI framework and design system
- ✅ Dashboard with metrics, tools, and task management
- ✅ Authentication system with role-based access
- ✅ Responsive design and navigation
- ✅ TypeScript coverage across entire codebase
- ✅ Supabase database integration with real-time subscriptions

#### Phase 2: Client Management System
- ✅ **Client Onboarding Wizard** - Multi-step guided setup
- ✅ **Firecrawl Integration** - Real-time website analysis and crawling
- ✅ **Client Profiles** - Comprehensive dashboards with SEO insights
- ✅ **Client List Management** - Search, filter, and bulk operations
- ✅ **Database Schema** - Enhanced client data model with business intelligence
- ✅ **CRUD Operations** - Full create, read, update, delete functionality
- ✅ **Modal Workflows** - Streamlined user interactions
- ✅ **Statistics Dashboard** - Client metrics and performance tracking

### 🔄 Next Phase: Keyword Research & SEO Tools

#### Phase 3: SEO Automation (Next Up)
- 🚧 **Keyword Research Wizard** - DataForSEO integration following SOP workflow
- 🚧 **Keyword Database Tables** - Comprehensive keyword data management
- 🚧 **AI-Powered Categorization** - Automated keyword grouping and analysis
- 🚧 **Competitive Analysis** - Competitor keyword tracking and insights
- 🚧 **Content Strategy Generator** - AI-driven content recommendations

#### Phase 4: Advanced Features (Planned)
- 📋 **Technical SEO Audits** - Automated site health monitoring
- 📋 **Content Calendar** - Editorial planning and scheduling
- 📋 **Rank Tracking** - Position monitoring and reporting
- 📋 **Link Building Tools** - Outreach and relationship management
- 📋 **Reporting Suite** - Automated client reports and dashboards

### 🛠️ Technical Improvements
- 📋 **Performance Optimization** - Code splitting and lazy loading
- 📋 **Error Handling** - Comprehensive error boundaries and logging
- 📋 **Testing Suite** - Unit and integration tests
- 📋 **Documentation** - API documentation and user guides

## 📋 Todo List

### High Priority
1. **Create keyword research database tables and workflow**
2. **Build KeywordResearchWizard following SOP workflow**
3. **Integrate DataForSEO API for keyword data**
4. **Add competitor analysis functionality**

### Medium Priority
1. **Implement technical SEO audit tools**
2. **Add content calendar and planning tools**
3. **Create automated reporting system**
4. **Enhance error handling and logging**

### Low Priority
1. **Provide Google Cloud Console setup guide**
2. **Add advanced filtering and search capabilities**
3. **Implement bulk operations for clients**
4. **Add export functionality for reports**

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
```env
# Database
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
VITE_DATAFORSEO_API_KEY=your_dataforseo_key
VITE_FIRECRAWL_API_KEY=your_firecrawl_key
VITE_OPENAI_API_KEY=your_openai_key

# App Settings
VITE_APP_NAME=SEO Command Centre
VITE_MOCK_MODE=false
```

## 🔐 Security & Access

- **Authentication**: Secure user management with Supabase Auth
- **Row Level Security**: Database-level access control
- **API Key Management**: Secure storage of sensitive credentials
- **Data Encryption**: All data encrypted in transit and at rest

## 🧪 Testing the Client Management System

### Test Drive Instructions

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Navigate to Clients**
   - Go to `http://localhost:5173/`
   - Click "Clients" in the sidebar

3. **Test Client Onboarding**
   - Click "Add New Client"
   - Fill out the multi-step wizard
   - Watch real-time website analysis with Firecrawl
   - Review SEO insights and recommendations

4. **Test Client Management**
   - View client profiles with crawl data
   - Edit client information
   - Search and filter clients
   - Test status updates and categorization

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

*Last Updated: January 2025*