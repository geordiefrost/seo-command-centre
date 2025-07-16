# Claude Memory - SEO Command Centre Project

## Project Overview
**SEO Command Centre** - Enterprise SEO automation platform for Bang Digital
- **Repository**: https://github.com/geordiefrost/seo-command-centre
- **Tech Stack**: React 19.1.0, TypeScript, Tailwind CSS, Supabase, Vite
- **Current Status**: Keyword Research System Complete (90% overall completion)

## GitHub Access Token
- **Personal Access Token**: [Stored in user's global CLAUDE.md - not in project repo]
- **Owner**: geordiefrost
- **Created**: 2025-07-04
- **Usage**: For GitHub operations like cloning repositories, creating PRs, etc.

## Project Structure & Key Files

### **Core Components**
- `/src/components/features/keyword-research/KeywordResearchWizard.tsx` - Main keyword research workflow
- `/src/components/features/keyword-research/KeywordResultsTable.tsx` - Keyword display and selection
- `/src/components/clients/` - Client management system
- `/src/services/integrations/DataForSEOService.ts` - DataForSEO API integration
- `/src/services/integrations/GoogleOAuthService.ts` - Google Search Console integration

### **Database & Configuration**
- `/src/lib/database.sql` - Complete database schema
- `/src/lib/supabase.ts` - Supabase client configuration
- `/.env.local` - Environment variables (includes API keys)
- `/vercel.json` - Deployment configuration

### **Key Directories**
- `/src/pages/` - Route components (Dashboard, Clients, KeywordResearch, etc.)
- `/src/store/` - Zustand state management
- `/src/types/` - TypeScript definitions
- `/src/mock/` - Development mock data

## Current Development Status

### ✅ **Recently Completed (January 2025)**
**Keyword Research System Refactoring**
- **Advanced Workflow**: Raw keyword collection → Batch DataForSEO enrichment → GSC cross-reference → Priority scoring
- **Performance Optimization**: Reduced API calls by 70% with batch processing
- **Improved UX**: Removal-based interface (all keywords selected by default)
- **Multi-Source Integration**: Manual seeds, competitor analysis, Google Search Console
- **Priority Algorithms**: Quick Wins, Position Boosts, New Opportunities, Long-term

**Key Changes Made**:
1. Refactored `handleKeywordDiscovery` to collect raw keywords first
2. Added batch DataForSEO enrichment for all keywords
3. Fixed selection logic to default ALL keywords selected
4. Updated UI to reflect removal rather than selection workflow
5. Preserved GSC data during enrichment process

### ✅ **Previously Completed**
- **Client Management System**: Onboarding wizard, Firecrawl integration, profiles
- **Core Infrastructure**: Dashboard, authentication, responsive design
- **Database Schema**: Complete PostgreSQL schema with migrations

### 🚧 **Next Priorities**
- **Content Strategy Generator**: AI-driven content recommendations
- **Technical SEO Audits**: Automated site health monitoring
- **Rank Tracking**: Position monitoring and reporting
- **Advanced Analytics**: Custom reporting and insights

## Environment Configuration

### **Database (Supabase)**
```env
VITE_SUPABASE_URL=https://gkhpzrfnrjrhhqaykxnf.supabase.co
VITE_SUPABASE_ANON_KEY=[Stored in .env.local - not in repo]
```

### **API Integrations**
- **DataForSEO**: API URL: https://api.dataforseo.com/v3 (credentials in .env.local)
- **Firecrawl**: API Key configured for website analysis
- **Google Services**: OAuth configured for Search Console access
- **AI Services**: OpenAI, Anthropic, Perplexity APIs configured

### **Development Settings**
- **Mock Mode**: `VITE_MOCK_MODE=true` (currently enabled for development)
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev` (runs on http://localhost:5173)

## Database Schema Overview

### **Core Tables**
```sql
-- Primary tables
├── clients                    # Client information and settings
├── keyword_research_projects  # Research project metadata  
├── keywords                  # Keyword data with priority scoring
├── client_competitors        # Competitor tracking
├── crawl_jobs               # Website crawl data
└── users                    # User authentication

-- Supporting tables
├── crawl_data               # Firecrawl analysis results
├── crawl_metrics           # Website performance metrics
└── tasks                   # Task management
```

### **Key Schema Features**
- **Row Level Security**: Database-level access control
- **Real-time Subscriptions**: Live data updates
- **JSON Storage**: Additional data in notes fields for flexibility
- **Priority Scoring**: Decimal priority scores with categorization

## API Integration Details

### **DataForSEO Service**
- **Location**: `src/services/integrations/DataForSEOService.ts`
- **Key Methods**:
  - `getKeywordData()` - Batch keyword enrichment
  - `getKeywordSuggestions()` - Seed keyword expansion
  - `getCompetitorRankings()` - Competitor analysis
- **Recent Improvements**: Batch processing, dual endpoint support, better error handling

### **Google Search Console**
- **Location**: `src/services/integrations/GoogleOAuthService.ts`
- **Features**: Property detection, keyword performance data, OAuth authentication
- **Integration**: Cross-reference all keywords with client GSC data

### **Firecrawl Integration**
- **Purpose**: Website crawling and technical analysis
- **Usage**: Client onboarding, site analysis, SEO insights

## Development Workflow

### **Starting Development**
```bash
cd /mnt/c/Users/Geordie/SEO/seo-command-centre
npm run dev
# Application runs on http://localhost:5173
```

### **Testing Workflow**
1. **Keyword Research**: Navigate to Keyword Research → Create new project
2. **Client Management**: Test client onboarding wizard and profiles
3. **Build Testing**: `npm run build` to verify production build

### **Deployment**
- **Platform**: Vercel (configured with vercel.json)
- **Auto-deploy**: Pushes to main branch trigger deployment
- **Environment**: Production variables configured in Vercel dashboard

## Recent Bug Fixes & Improvements

### **Performance Enhancements**
- **Batch API Processing**: Single DataForSEO call for all keywords
- **Deduplication**: Efficient keyword deduplication before enrichment
- **Data Preservation**: Maintained GSC data during batch processing

### **UX Improvements**
- **Selection Interface**: Changed from selection to removal-based workflow
- **Default State**: All keywords selected by default
- **Clear Messaging**: Updated UI language to reflect removal process

### **Error Handling**
- **API Fallbacks**: Graceful degradation when APIs fail
- **Data Validation**: Better handling of malformed API responses
- **User Feedback**: Clear processing status updates

## Build & Deployment Information

### **Build Process**
- **TypeScript**: Full compilation with `tsc -b`
- **Vite Build**: Production optimization
- **Build Time**: ~1 minute
- **Bundle Size**: ~837KB (with code splitting recommendations)

### **Deployment Status**
- **Last Deploy**: Latest commit pushed to main branch
- **Status**: Production ready
- **Monitoring**: Console logging for API interactions

## Important Notes for Future Sessions

### **Development Priorities**
1. **Content Strategy Generator** - Next major feature
2. **Technical SEO Audits** - Automated site monitoring
3. **Performance Optimization** - Code splitting implementation
4. **Testing Suite** - Unit and integration tests

### **Code Standards**
- **TypeScript**: 100% coverage required
- **Components**: Functional components with hooks only
- **Error Handling**: Comprehensive try-catch blocks
- **API Calls**: Batch processing preferred over individual calls

### **Database Considerations**
- **Schema Evolution**: Use migration files for changes
- **JSON Storage**: Additional data stored in notes fields for flexibility
- **Performance**: Indexed queries for large datasets

### **Security Notes**
- **API Keys**: Stored in environment variables only
- **Authentication**: Supabase Auth with row-level security
- **Data Access**: Client-scoped data access enforced

## Troubleshooting Common Issues

### **Build Errors**
- **TypeScript**: Run `npm run build` to check for type errors
- **Dependencies**: Ensure all packages are up to date
- **Environment**: Verify all required environment variables are set

### **API Issues**
- **DataForSEO**: Check credentials and quota limits
- **Google Services**: Verify OAuth configuration and permissions
- **Mock Mode**: Set `VITE_MOCK_MODE=true` for development without APIs

### **Database Issues**
- **Supabase**: Check connection and row-level security policies
- **Migrations**: Run migration files in correct order
- **Types**: Regenerate TypeScript types if schema changes

---

*Last Updated: January 16, 2025*  
*Version: 2.0.0 - Keyword Research System Complete*