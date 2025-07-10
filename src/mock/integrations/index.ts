export * from './dataforseo';
export * from './firecrawl';
export * from './perplexity';
export * from './openai';
export * from './apify';
export * from './google';

export const mockIntegrationData = {
  // DataForSEO mock data
  keywordData: [],
  serpAnalysis: [],
  competitorRankings: [],
  
  // Firecrawl mock data
  crawlResults: [],
  technicalIssues: [],
  
  // Perplexity MCP mock responses
  strategyRecommendations: [],
  insights: [],
  
  // OpenAI/Anthropic mock content
  generatedContent: [],
  contentAnalysis: {},
  
  // Apify monitoring data
  competitorProfiles: [],
  competitorChanges: [],
  
  // Google Services data
  analyticsData: {},
  searchConsoleData: {},
  googleDocsTemplates: {},
  
  // Migration analysis mock
  migrationAnalysis: {
    totalPages: 245,
    recommendations: {
      keep: 180,
      consolidate: 45,
      remove: 20,
    },
    topPages: [
      {
        url: '/products/seo-tools',
        traffic: 5420,
        conversions: 82,
        recommendation: 'keep',
        keywords: ['seo tools', 'seo software'],
        reasons: ['High traffic', 'Strong conversion rate', 'Key landing page'],
      },
      {
        url: '/blog/old-seo-tips',
        traffic: 120,
        conversions: 1,
        recommendation: 'consolidate',
        keywords: ['seo tips'],
        reasons: ['Low traffic', 'Outdated content', 'Similar content exists'],
      },
      {
        url: '/deprecated-feature',
        traffic: 15,
        conversions: 0,
        recommendation: 'remove',
        keywords: [],
        reasons: ['No traffic', 'No conversions', 'Feature discontinued'],
      },
    ],
    redirectMapping: [
      {
        source: '/old-services',
        target: '/services',
        type: 301,
        reason: 'URL structure update',
        priority: 'high',
      },
      {
        source: '/blog/category/old',
        target: '/blog/category/new',
        type: 301,
        reason: 'Category reorganization',
        priority: 'medium',
      },
    ],
  },
  
  // Integration status data
  integrationStatuses: {
    'DataForSEO': {
      connected: true,
      lastSync: new Date('2024-07-10T08:00:00'),
      usage: {
        requests: 1250,
        limit: 5000,
        resetDate: new Date('2024-08-01'),
      },
    },
    'Firecrawl MCP': {
      connected: true,
      lastSync: new Date('2024-07-10T06:30:00'),
      usage: {
        requests: 89,
        limit: 1000,
        resetDate: new Date('2024-08-01'),
      },
    },
    'Perplexity MCP': {
      connected: true,
      lastSync: new Date('2024-07-10T07:45:00'),
      usage: {
        requests: 234,
        limit: 2000,
        resetDate: new Date('2024-08-01'),
      },
    },
    'OpenAI': {
      connected: true,
      lastSync: new Date('2024-07-10T09:15:00'),
      usage: {
        requests: 456,
        limit: 10000,
        resetDate: new Date('2024-08-01'),
      },
    },
    'Apify': {
      connected: false,
      error: 'API key expired',
      lastSync: new Date('2024-07-08T12:00:00'),
    },
    'Google Analytics': {
      connected: true,
      lastSync: new Date('2024-07-10T08:30:00'),
    },
    'Google Search Console': {
      connected: true,
      lastSync: new Date('2024-07-10T08:30:00'),
    },
    'Slack': {
      connected: true,
      lastSync: new Date('2024-07-10T09:00:00'),
    },
  },
};