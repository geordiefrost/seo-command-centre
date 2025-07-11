import { KeywordData, SERPAnalysis } from '../../types';

export const mockKeywordData: KeywordData[] = [
  {
    keyword: 'seo automation',
    searchVolume: 1200,
    difficulty: 45,
    cpc: 3.50,
    trend: [100, 95, 110, 120, 115, 130, 125, 140, 135, 150, 145, 160],
    competition: 0.5,
    intent: 'commercial',
    relatedKeywords: ['seo tools', 'search engine optimization', 'seo software'],
  },
  {
    keyword: 'seo tools',
    searchVolume: 8900,
    difficulty: 65,
    cpc: 4.25,
    trend: [100, 105, 115, 110, 120, 125, 130, 135, 140, 145, 150, 155],
    competition: 0.8,
    intent: 'commercial',
    relatedKeywords: ['seo software', 'seo platforms', 'search optimization'],
  },
  {
    keyword: 'technical seo audit',
    searchVolume: 2400,
    difficulty: 55,
    cpc: 5.80,
    trend: [100, 90, 85, 95, 100, 105, 110, 115, 120, 125, 130, 135],
    competition: 0.6,
    intent: 'commercial',
    relatedKeywords: ['technical seo', 'seo audit tools', 'website audit'],
  },
  {
    keyword: 'content optimization',
    searchVolume: 3200,
    difficulty: 42,
    cpc: 3.20,
    trend: [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122],
    competition: 0.4,
    intent: 'informational',
    relatedKeywords: ['content seo', 'seo content', 'content marketing'],
  },
  {
    keyword: 'website migration seo',
    searchVolume: 850,
    difficulty: 38,
    cpc: 6.50,
    trend: [100, 98, 96, 94, 92, 90, 95, 100, 105, 110, 115, 120],
    competition: 0.3,
    intent: 'commercial',
    relatedKeywords: ['website migration', 'seo migration', 'site migration'],
  },
  {
    keyword: 'competitor analysis seo',
    searchVolume: 1850,
    difficulty: 48,
    cpc: 4.10,
    trend: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155],
    competition: 0.5,
    intent: 'commercial',
    relatedKeywords: ['competitor research', 'seo competitors', 'market analysis'],
  },
];

export const mockSERPAnalysis: SERPAnalysis[] = [
  {
    keyword: 'seo tools',
    totalResults: 125000000,
    organicResults: [
      {
        position: 1,
        title: 'Free SEO Tools | Ahrefs',
        url: 'https://ahrefs.com/seo-tools',
        description: 'Use Ahrefs\' SEO tools to optimize your website for search engines and get more traffic from Google.',
        domain: 'ahrefs.com',
      },
      {
        position: 2,
        title: 'SEO Tools | Semrush',
        url: 'https://semrush.com/tools/',
        description: 'Semrush\'s SEO tools help you research keywords, track rankings, and analyze your competition.',
        domain: 'semrush.com',
      },
      {
        position: 3,
        title: 'Best SEO Tools for Australian Businesses | TechCorp',
        url: 'https://techcorp.com.au/seo-tools',
        description: 'Discover the most effective SEO tools used by Australian businesses to improve their search rankings and drive more organic traffic.',
        domain: 'techcorp.com.au',
      },
    ],
    featuredSnippets: [
      {
        type: 'paragraph',
        title: 'What are the best SEO tools?',
        content: 'The best SEO tools include Ahrefs, SEMrush, Moz, and Google Search Console. These tools help with keyword research, competitor analysis, and technical SEO audits.',
        url: 'https://example.com/best-seo-tools',
      },
    ],
    relatedQuestions: [
      {
        question: 'What are the best free SEO tools?',
        answer: 'Google Search Console, Google Analytics, and Bing Webmaster Tools are excellent free SEO tools.',
      },
      {
        question: 'How do SEO tools work?',
        answer: 'SEO tools analyze websites, track rankings, research keywords, and provide insights to improve search engine visibility.',
      },
    ],
    searchVolume: 8900,
    difficulty: 65,
  },
];

export const mockCompetitorData = {
  rankings: [
    {
      keyword: 'seo tools',
      position: 3,
      url: 'https://competitor1.com/seo-tools',
      title: 'Complete SEO Tools Guide | Competitor1',
      traffic: 2500,
      volume: 8900,
    },
    {
      keyword: 'seo automation',
      position: 7,
      url: 'https://competitor2.com/automation',
      title: 'SEO Automation Solutions | Competitor2',
      traffic: 1200,
      volume: 1200,
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