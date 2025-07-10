import { KeywordData, SERPAnalysis, CompetitorRanking } from '../../types';

export const mockKeywordData: KeywordData[] = [
  {
    keyword: 'seo automation',
    searchVolume: 1200,
    difficulty: 45,
    cpc: 3.50,
    trend: [100, 95, 110, 120, 115, 130, 125, 140, 135, 150, 145, 160],
    competition: 'medium',
    intent: 'commercial',
  },
  {
    keyword: 'seo tools',
    searchVolume: 8900,
    difficulty: 65,
    cpc: 4.25,
    trend: [100, 105, 115, 110, 120, 125, 130, 135, 140, 145, 150, 155],
    competition: 'high',
    intent: 'commercial',
  },
  {
    keyword: 'technical seo audit',
    searchVolume: 2400,
    difficulty: 55,
    cpc: 5.80,
    trend: [100, 90, 85, 95, 100, 105, 110, 115, 120, 125, 130, 135],
    competition: 'medium',
    intent: 'commercial',
  },
  {
    keyword: 'content optimization',
    searchVolume: 3200,
    difficulty: 42,
    cpc: 3.20,
    trend: [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122],
    competition: 'medium',
    intent: 'informational',
  },
  {
    keyword: 'website migration seo',
    searchVolume: 850,
    difficulty: 38,
    cpc: 6.50,
    trend: [100, 98, 96, 94, 92, 90, 95, 100, 105, 110, 115, 120],
    competition: 'low',
    intent: 'commercial',
  },
  {
    keyword: 'competitor analysis seo',
    searchVolume: 1850,
    difficulty: 48,
    cpc: 4.10,
    trend: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
    competition: 'medium',
    intent: 'commercial',
  },
];

export const mockSERPAnalysis: SERPAnalysis[] = [
  {
    keyword: 'seo tools',
    position: 12,
    url: 'https://techcorp.com.au/seo-tools',
    title: 'Best SEO Tools for Australian Businesses | TechCorp',
    description: 'Discover the most effective SEO tools used by Australian businesses to improve their search rankings and drive more organic traffic.',
    features: ['featured_snippet', 'people_also_ask', 'related_searches'],
    competitors: [
      {
        domain: 'ahrefs.com',
        position: 1,
        url: 'https://ahrefs.com/seo-tools',
        title: 'Free SEO Tools | Ahrefs',
        description: 'Use Ahrefs\' SEO tools to optimize your website for search engines and get more traffic from Google.',
      },
      {
        domain: 'semrush.com',
        position: 2,
        url: 'https://semrush.com/tools/',
        title: 'SEO Tools | Semrush',
        description: 'Semrush\'s SEO tools help you research keywords, track rankings, and analyze your competition.',
      },
    ],
  },
];

export const mockCompetitorData = {
  rankings: [
    {
      domain: 'competitor1.com',
      keyword: 'seo tools',
      position: 3,
      previousPosition: 5,
      change: 2,
      url: 'https://competitor1.com/seo-tools',
      traffic: 2500,
    },
    {
      domain: 'competitor2.com',
      keyword: 'seo automation',
      position: 7,
      previousPosition: 8,
      change: 1,
      url: 'https://competitor2.com/automation',
      traffic: 1200,
    },
  ],
  backlinks: [
    {
      domain: 'competitor1.com',
      totalBacklinks: 15420,
      referringDomains: 1240,
      domainRating: 78,
      newBacklinks: 45,
      lostBacklinks: 12,
    },
  ],
  content: [
    {
      domain: 'competitor1.com',
      newPages: 8,
      updatedPages: 23,
      deletedPages: 3,
      totalPages: 1250,
      avgWordCount: 1850,
    },
  ],
};