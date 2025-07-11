export const mockStrategies = [
  {
    id: '1',
    title: 'Q3 2024 Growth Strategy',
    clientId: '1',
    status: 'active',
    goals: 'Increase organic traffic by 150% and improve conversion rates',
    timeline: '6-months',
    budget: '10k-25k',
    targetAudience: {
      demographics: 'Small business owners, 25-55 years old, Australia',
      interests: 'Business growth, technology adoption, cost efficiency',
      painPoints: 'Complex accounting processes, time management, compliance'
    },
    competitiveAnalysis: {
      mainCompetitors: 'Xero, QuickBooks, MYOB',
      advantage: 'Local market expertise, personalized support',
      position: 'challenger'
    },
    contentStrategy: {
      types: 'Blog posts, guides, case studies, webinars',
      frequency: 'weekly',
      goals: 'Establish thought leadership, generate leads'
    },
    recommendations: [
      {
        category: 'Technical SEO',
        priority: 'high',
        actions: [
          'Improve Core Web Vitals scores',
          'Fix crawl errors and broken links',
          'Optimize site structure and internal linking'
        ],
        estimatedImpact: 'High',
        timeline: '4-6 weeks'
      },
      {
        category: 'Content Strategy',
        priority: 'high',
        actions: [
          'Create topic clusters around main keywords',
          'Develop comprehensive content calendar',
          'Optimize existing content for target keywords'
        ],
        estimatedImpact: 'High',
        timeline: '6-8 weeks'
      },
      {
        category: 'Link Building',
        priority: 'medium',
        actions: [
          'Build partnerships with industry publications',
          'Create linkable assets and resources',
          'Implement guest posting strategy'
        ],
        estimatedImpact: 'Medium',
        timeline: '8-12 weeks'
      }
    ],
    performance: {
      trafficIncrease: 45,
      rankingImprovement: 12,
      conversionsIncrease: 28,
      tasksCompleted: 18,
      tasksTotal: 25
    },
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-07-10'),
    createdBy: 'Sarah Johnson',
    lastReviewed: new Date('2024-07-05')
  },
  {
    id: '2',
    title: 'Local SEO Domination Plan',
    clientId: '2',
    status: 'completed',
    goals: 'Dominate local search results for key service areas',
    timeline: '3-months',
    budget: '5k-10k',
    targetAudience: {
      demographics: 'Local business owners, 30-60 years old, Sydney metro',
      interests: 'Local market growth, customer acquisition',
      painPoints: 'Low visibility in local searches, competition from large brands'
    },
    competitiveAnalysis: {
      mainCompetitors: 'Local established players, national chains',
      advantage: 'Deep local knowledge, community relationships',
      position: 'niche-player'
    },
    contentStrategy: {
      types: 'Local landing pages, case studies, local guides',
      frequency: 'bi-weekly',
      goals: 'Increase local visibility, build trust'
    },
    recommendations: [
      {
        category: 'Local SEO',
        priority: 'high',
        actions: [
          'Optimize Google My Business profile',
          'Build local citations and directories',
          'Create location-specific landing pages'
        ],
        estimatedImpact: 'High',
        timeline: '2-4 weeks'
      },
      {
        category: 'Content Marketing',
        priority: 'medium',
        actions: [
          'Create local area guides',
          'Develop customer success stories',
          'Build local resource pages'
        ],
        estimatedImpact: 'Medium',
        timeline: '4-6 weeks'
      },
      {
        category: 'Reputation Management',
        priority: 'high',
        actions: [
          'Implement review generation system',
          'Monitor and respond to reviews',
          'Create reputation monitoring dashboard'
        ],
        estimatedImpact: 'High',
        timeline: '3-4 weeks'
      }
    ],
    performance: {
      trafficIncrease: 78,
      rankingImprovement: 35,
      conversionsIncrease: 42,
      tasksCompleted: 22,
      tasksTotal: 22
    },
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-06-20'),
    createdBy: 'Mike Chen',
    lastReviewed: new Date('2024-06-18')
  },
  {
    id: '3',
    title: 'Content Authority Strategy',
    clientId: '1',
    status: 'paused',
    goals: 'Establish thought leadership in accounting software space',
    timeline: '12-months',
    budget: '25k-50k',
    targetAudience: {
      demographics: 'Business decision makers, CFOs, accounting professionals',
      interests: 'Industry trends, best practices, innovation',
      painPoints: 'Keeping up with regulations, efficiency improvements'
    },
    competitiveAnalysis: {
      mainCompetitors: 'Industry thought leaders, major publications',
      advantage: 'Practical experience, real-world case studies',
      position: 'challenger'
    },
    contentStrategy: {
      types: 'In-depth guides, research reports, webinars, podcasts',
      frequency: 'monthly',
      goals: 'Build authority, generate high-quality leads'
    },
    recommendations: [
      {
        category: 'Content Marketing',
        priority: 'high',
        actions: [
          'Create comprehensive industry reports',
          'Develop expert interview series',
          'Build resource libraries'
        ],
        estimatedImpact: 'High',
        timeline: '8-12 weeks'
      },
      {
        category: 'Public Relations',
        priority: 'medium',
        actions: [
          'Secure speaking opportunities',
          'Pitch to industry publications',
          'Build media relationships'
        ],
        estimatedImpact: 'Medium',
        timeline: '6-8 weeks'
      },
      {
        category: 'Community Building',
        priority: 'medium',
        actions: [
          'Create LinkedIn thought leadership content',
          'Engage in industry forums',
          'Host virtual events'
        ],
        estimatedImpact: 'Medium',
        timeline: '4-6 weeks'
      }
    ],
    performance: {
      trafficIncrease: 22,
      rankingImprovement: 8,
      conversionsIncrease: 15,
      tasksCompleted: 8,
      tasksTotal: 30
    },
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-06-15'),
    createdBy: 'Emma Davis',
    lastReviewed: new Date('2024-06-10')
  }
];

export const mockOpportunities = [
  {
    id: '1',
    title: 'Target "accounting software for startups" keyword',
    type: 'keyword',
    impact: 'high',
    effort: 'medium',
    description: 'High-volume keyword with moderate competition',
    estimatedTraffic: '+2,500 monthly visits',
    priority: 'high',
    timeline: '4-6 weeks',
    requirements: ['Content creation', 'On-page optimization', 'Link building']
  },
  {
    id: '2',
    title: 'Create industry comparison guides',
    type: 'content',
    impact: 'high',
    effort: 'high',
    description: 'Comprehensive comparison content for decision-makers',
    estimatedTraffic: '+5,000 monthly visits',
    priority: 'high',
    timeline: '8-10 weeks',
    requirements: ['Research', 'Content creation', 'Visual assets']
  },
  {
    id: '3',
    title: 'Fix technical SEO issues',
    type: 'technical',
    impact: 'medium',
    effort: 'low',
    description: 'Address crawl errors and page speed issues',
    estimatedTraffic: '+10% overall improvement',
    priority: 'high',
    timeline: '2-3 weeks',
    requirements: ['Technical audit', 'Development work']
  },
  {
    id: '4',
    title: 'Build partnerships with accounting firms',
    type: 'link-building',
    impact: 'medium',
    effort: 'medium',
    description: 'Establish referral partnerships for backlinks',
    estimatedTraffic: '+1,200 monthly visits',
    priority: 'medium',
    timeline: '6-8 weeks',
    requirements: ['Outreach', 'Relationship building', 'Content creation']
  }
];