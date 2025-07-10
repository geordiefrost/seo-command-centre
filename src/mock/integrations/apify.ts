import { CompetitorProfile, CompetitorChange } from '../../types';

export const mockCompetitorProfiles: CompetitorProfile[] = [
  {
    id: 'comp-1',
    domain: 'competitor1.com.au',
    name: 'Digital Solutions Australia',
    industry: 'SaaS',
    traffic: 85000,
    keywords: 2340,
    backlinks: 15420,
    domainRating: 72,
    lastUpdated: new Date('2024-07-10T06:00:00'),
    changes: [
      {
        id: 'change-1',
        type: 'content',
        description: 'Published new blog post: "AI in Business Operations"',
        impact: 'positive',
        detected: new Date('2024-07-09T14:30:00'),
        url: 'https://competitor1.com.au/blog/ai-business-operations',
        keywords: ['ai automation', 'business intelligence', 'workflow optimization'],
      },
      {
        id: 'change-2',
        type: 'ranking',
        description: 'Moved from position 8 to 3 for "business automation tools"',
        impact: 'positive',
        detected: new Date('2024-07-08T09:15:00'),
        keywords: ['business automation tools'],
      },
    ],
  },
  {
    id: 'comp-2',
    domain: 'techsolutions.com.au',
    name: 'Tech Solutions Pty Ltd',
    industry: 'SaaS',
    traffic: 62000,
    keywords: 1890,
    backlinks: 8950,
    domainRating: 65,
    lastUpdated: new Date('2024-07-10T06:00:00'),
    changes: [
      {
        id: 'change-3',
        type: 'backlink',
        description: 'Gained high-quality backlink from industry publication',
        impact: 'positive',
        detected: new Date('2024-07-07T11:20:00'),
        url: 'https://techindustry.com.au/featured-companies',
      },
      {
        id: 'change-4',
        type: 'technical',
        description: 'Improved Core Web Vitals scores across 15 pages',
        impact: 'positive',
        detected: new Date('2024-07-06T16:45:00'),
      },
    ],
  },
  {
    id: 'comp-3',
    domain: 'innovativetech.com.au',
    name: 'Innovative Tech Solutions',
    industry: 'SaaS',
    traffic: 45000,
    keywords: 1250,
    backlinks: 5680,
    domainRating: 58,
    lastUpdated: new Date('2024-07-10T06:00:00'),
    changes: [
      {
        id: 'change-5',
        type: 'content',
        description: 'Removed 8 outdated product pages',
        impact: 'neutral',
        detected: new Date('2024-07-05T13:10:00'),
      },
      {
        id: 'change-6',
        type: 'ranking',
        description: 'Dropped from position 5 to 12 for "cloud solutions"',
        impact: 'negative',
        detected: new Date('2024-07-04T08:30:00'),
        keywords: ['cloud solutions'],
      },
    ],
  },
];

export const mockCompetitorChanges: CompetitorChange[] = [
  {
    id: 'change-7',
    type: 'content',
    description: 'Competitor1.com.au launched new pricing page with comparison table',
    impact: 'positive',
    detected: new Date('2024-07-10T10:15:00'),
    url: 'https://competitor1.com.au/pricing',
  },
  {
    id: 'change-8',
    type: 'ranking',
    description: 'TechSolutions.com.au now ranking #1 for "enterprise software solutions"',
    impact: 'positive',
    detected: new Date('2024-07-09T07:45:00'),
    keywords: ['enterprise software solutions'],
  },
  {
    id: 'change-9',
    type: 'backlink',
    description: 'InnovativeTech.com.au lost backlink from major industry site',
    impact: 'negative',
    detected: new Date('2024-07-08T15:20:00'),
  },
  {
    id: 'change-10',
    type: 'technical',
    description: 'Competitor1.com.au implemented structured data across product pages',
    impact: 'positive',
    detected: new Date('2024-07-07T12:30:00'),
  },
];

export const mockApifyData = {
  scraperResults: {
    googleSearch: [
      {
        keyword: 'business automation software',
        results: [
          {
            position: 1,
            title: 'Best Business Automation Software 2024',
            url: 'https://competitor1.com.au/automation-software',
            description: 'Discover the top business automation tools to streamline your operations and boost productivity.',
            domain: 'competitor1.com.au',
          },
          {
            position: 2,
            title: 'Enterprise Automation Solutions',
            url: 'https://techsolutions.com.au/enterprise-automation',
            description: 'Comprehensive automation solutions for large enterprises and growing businesses.',
            domain: 'techsolutions.com.au',
          },
        ],
      },
    ],
    socialMediaMentions: [
      {
        platform: 'linkedin',
        mentions: 45,
        sentiment: 'positive',
        reach: 12500,
        engagement: 340,
      },
      {
        platform: 'twitter',
        mentions: 23,
        sentiment: 'mixed',
        reach: 8900,
        engagement: 156,
      },
    ],
    priceMonitoring: [
      {
        competitor: 'competitor1.com.au',
        product: 'Basic Plan',
        currentPrice: 49,
        previousPrice: 45,
        change: '+8.9%',
        lastUpdated: new Date('2024-07-09'),
      },
      {
        competitor: 'techsolutions.com.au',
        product: 'Professional Plan',
        currentPrice: 99,
        previousPrice: 99,
        change: '0%',
        lastUpdated: new Date('2024-07-09'),
      },
    ],
  },
  monitoring: {
    totalActors: 15,
    activeRuns: 8,
    successfulRuns: 142,
    failedRuns: 3,
    avgRunDuration: 245, // seconds
    lastRunTime: new Date('2024-07-10T06:00:00'),
    nextScheduledRun: new Date('2024-07-10T18:00:00'),
  },
};