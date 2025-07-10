export const mockGoogleAnalyticsData = {
  overview: {
    sessions: 12543,
    users: 9876,
    pageviews: 23456,
    bounceRate: 45.2,
    avgSessionDuration: 185, // seconds
    conversions: 234,
    conversionRate: 1.87,
    revenue: 15678.90,
  },
  traffic: {
    organic: {
      sessions: 7854,
      percentage: 62.6,
      change: '+12.3%',
    },
    direct: {
      sessions: 2345,
      percentage: 18.7,
      change: '+5.2%',
    },
    referral: {
      sessions: 1567,
      percentage: 12.5,
      change: '-2.1%',
    },
    social: {
      sessions: 777,
      percentage: 6.2,
      change: '+8.9%',
    },
  },
  topPages: [
    {
      page: '/',
      pageviews: 5678,
      uniquePageviews: 4321,
      avgTimeOnPage: 245,
      bounceRate: 35.2,
    },
    {
      page: '/services',
      pageviews: 3456,
      uniquePageviews: 2890,
      avgTimeOnPage: 198,
      bounceRate: 42.1,
    },
    {
      page: '/about',
      pageviews: 2345,
      uniquePageviews: 2100,
      avgTimeOnPage: 156,
      bounceRate: 52.3,
    },
  ],
  demographics: {
    age: {
      '18-24': 15.2,
      '25-34': 28.7,
      '35-44': 24.6,
      '45-54': 18.9,
      '55-64': 9.8,
      '65+': 2.8,
    },
    gender: {
      male: 58.4,
      female: 41.6,
    },
    location: {
      'Australia': 78.5,
      'United States': 12.3,
      'United Kingdom': 4.2,
      'Canada': 2.8,
      'Other': 2.2,
    },
  },
};

export const mockSearchConsoleData = {
  overview: {
    totalClicks: 8765,
    totalImpressions: 145678,
    avgCTR: 6.02,
    avgPosition: 12.5,
    change: {
      clicks: '+15.3%',
      impressions: '+8.7%',
      ctr: '+2.1%',
      position: '-1.2',
    },
  },
  topQueries: [
    {
      query: 'business automation software',
      clicks: 543,
      impressions: 12456,
      ctr: 4.36,
      position: 8.2,
    },
    {
      query: 'seo automation tools',
      clicks: 432,
      impressions: 9876,
      ctr: 4.37,
      position: 6.5,
    },
    {
      query: 'digital marketing automation',
      clicks: 321,
      impressions: 8765,
      ctr: 3.66,
      position: 11.3,
    },
    {
      query: 'workflow automation solutions',
      clicks: 298,
      impressions: 7654,
      ctr: 3.89,
      position: 9.8,
    },
  ],
  topPages: [
    {
      page: 'https://techcorp.com.au/',
      clicks: 1234,
      impressions: 23456,
      ctr: 5.26,
      position: 7.8,
    },
    {
      page: 'https://techcorp.com.au/services',
      clicks: 987,
      impressions: 18765,
      ctr: 5.26,
      position: 9.2,
    },
    {
      page: 'https://techcorp.com.au/automation-tools',
      clicks: 765,
      impressions: 15432,
      ctr: 4.96,
      position: 8.5,
    },
  ],
  countries: [
    {
      country: 'Australia',
      clicks: 7654,
      impressions: 125678,
      ctr: 6.09,
      position: 11.8,
    },
    {
      country: 'United States',
      clicks: 543,
      impressions: 12456,
      ctr: 4.36,
      position: 15.2,
    },
    {
      country: 'United Kingdom',
      clicks: 321,
      impressions: 5678,
      ctr: 5.65,
      position: 13.7,
    },
  ],
  devices: [
    {
      device: 'mobile',
      clicks: 5234,
      impressions: 87654,
      ctr: 5.97,
      position: 12.1,
    },
    {
      device: 'desktop',
      clicks: 2876,
      impressions: 45678,
      ctr: 6.29,
      position: 11.8,
    },
    {
      device: 'tablet',
      clicks: 655,
      impressions: 12346,
      ctr: 5.31,
      position: 14.2,
    },
  ],
};

export const mockGoogleDocsTemplates = {
  strategyReport: {
    id: 'template-strategy-001',
    name: 'SEO Strategy Report Template',
    sections: [
      'Executive Summary',
      'Current Performance Analysis',
      'Competitive Landscape',
      'Keyword Opportunities',
      'Technical Recommendations',
      'Content Strategy',
      'Link Building Plan',
      'Implementation Timeline',
      'KPIs and Measurement',
    ],
    lastUpdated: new Date('2024-06-15'),
  },
  auditReport: {
    id: 'template-audit-001',
    name: 'Technical SEO Audit Report Template',
    sections: [
      'Audit Overview',
      'Technical Issues Summary',
      'Page Speed Analysis',
      'Mobile Optimization',
      'Crawlability Assessment',
      'Content Analysis',
      'Backlink Profile Review',
      'Priority Action Items',
      'Appendix - Detailed Findings',
    ],
    lastUpdated: new Date('2024-06-20'),
  },
  contentPlan: {
    id: 'template-content-001',
    name: 'Content Marketing Plan Template',
    sections: [
      'Content Audit Results',
      'Target Audience Analysis',
      'Keyword Strategy',
      'Content Calendar',
      'Content Types and Formats',
      'Distribution Strategy',
      'Performance Metrics',
      'Resource Requirements',
    ],
    lastUpdated: new Date('2024-07-01'),
  },
};

export const mockGoogleSheetsData = {
  keywordTracking: {
    id: 'sheet-keywords-001',
    name: 'Keyword Rankings Tracker',
    lastUpdated: new Date('2024-07-10T08:00:00'),
    metrics: {
      totalKeywords: 125,
      top10Rankings: 45,
      top3Rankings: 18,
      avgPosition: 15.2,
      positionChanges: '+2.3',
    },
  },
  backlinksMonitor: {
    id: 'sheet-backlinks-001',
    name: 'Backlinks Monitoring',
    lastUpdated: new Date('2024-07-10T06:00:00'),
    metrics: {
      totalBacklinks: 2456,
      newBacklinks: 23,
      lostBacklinks: 8,
      domainRating: 67,
      referringDomains: 456,
    },
  },
  competitorAnalysis: {
    id: 'sheet-competitors-001',
    name: 'Competitor Analysis Dashboard',
    lastUpdated: new Date('2024-07-09T18:00:00'),
    competitors: 8,
    metricsTracked: ['rankings', 'backlinks', 'content', 'social'],
  },
};