export const mockContentBriefs = [
  {
    id: '1',
    clientId: '1',
    title: 'Complete Guide to Small Business Accounting Software',
    contentType: 'guide',
    targetAudience: 'Small business owners, entrepreneurs, accounting professionals',
    primaryKeyword: 'small business accounting software',
    secondaryKeywords: ['accounting software for small business', 'best accounting software', 'cloud accounting'],
    contentGoal: 'awareness',
    wordCount: 3500,
    tone: 'professional',
    outline: [
      'Introduction to accounting software benefits',
      'Key features to look for',
      'Top 5 accounting software solutions',
      'Implementation and setup guide',
      'Common mistakes to avoid',
      'Conclusion and next steps'
    ],
    requirements: [
      'Include comparison table',
      'Add screenshots of software interfaces',
      'Include pricing information',
      'Add FAQ section'
    ],
    deadline: new Date('2024-07-20'),
    priority: 'high',
    notes: 'Focus on Australian market, include local compliance requirements',
    status: 'draft',
    createdAt: new Date('2024-07-10'),
    createdBy: 'Sarah Johnson'
  },
  {
    id: '2',
    clientId: '2',
    title: 'E-commerce SEO: Boosting Your Online Store Rankings',
    contentType: 'blog-post',
    targetAudience: 'E-commerce business owners, digital marketers',
    primaryKeyword: 'ecommerce SEO',
    secondaryKeywords: ['online store SEO', 'product page optimization', 'ecommerce marketing'],
    contentGoal: 'consideration',
    wordCount: 2000,
    tone: 'conversational',
    outline: [
      'Why e-commerce SEO matters',
      'Product page optimization techniques',
      'Category page best practices',
      'Technical SEO for online stores',
      'Link building strategies for e-commerce',
      'Measuring SEO success'
    ],
    requirements: [
      'Include case studies',
      'Add actionable tips',
      'Include tools and resources section'
    ],
    deadline: new Date('2024-07-25'),
    priority: 'medium',
    notes: 'Target international audience, include global best practices',
    status: 'in-progress',
    createdAt: new Date('2024-07-08'),
    createdBy: 'Mike Chen'
  },
  {
    id: '3',
    clientId: '3',
    title: 'Transform Your Business with Digital Marketing',
    contentType: 'landing-page',
    targetAudience: 'Small to medium business owners',
    primaryKeyword: 'digital marketing services',
    secondaryKeywords: ['online marketing', 'digital marketing agency', 'marketing solutions'],
    contentGoal: 'conversion',
    wordCount: 800,
    tone: 'professional',
    outline: [
      'Hero section with value proposition',
      'Service offerings overview',
      'Client testimonials',
      'Case studies and results',
      'Call-to-action and contact form'
    ],
    requirements: [
      'Include trust signals',
      'Add customer testimonials',
      'Include pricing or package information',
      'Strong call-to-action'
    ],
    deadline: new Date('2024-07-15'),
    priority: 'high',
    notes: 'Focus on conversion optimization, include social proof',
    status: 'completed',
    createdAt: new Date('2024-07-05'),
    createdBy: 'Emma Davis'
  }
];

export const mockContentGenerationTasks = [
  {
    id: '1',
    briefId: '1',
    title: 'Complete Guide to Small Business Accounting Software',
    type: 'guide',
    status: 'completed',
    progress: 100,
    startTime: new Date('2024-07-10T09:00:00'),
    endTime: new Date('2024-07-10T09:45:00'),
    duration: 2700,
    result: {
      content: 'Comprehensive guide content...',
      wordCount: 3485,
      readabilityScore: 8.7,
      seoScore: 94,
      keywordDensity: 2.3
    },
    steps: [
      { id: 'research', name: 'Keyword Research', status: 'completed', duration: 480 },
      { id: 'outline', name: 'Content Outline', status: 'completed', duration: 360 },
      { id: 'content', name: 'Content Generation', status: 'completed', duration: 1200 },
      { id: 'optimization', name: 'SEO Optimization', status: 'completed', duration: 300 },
      { id: 'quality', name: 'Quality Check', status: 'completed', duration: 240 },
      { id: 'finalize', name: 'Finalization', status: 'completed', duration: 120 }
    ]
  },
  {
    id: '2',
    briefId: '2',
    title: 'E-commerce SEO: Boosting Your Online Store Rankings',
    type: 'blog-post',
    status: 'in-progress',
    progress: 60,
    startTime: new Date('2024-07-11T10:00:00'),
    currentStep: 'content',
    steps: [
      { id: 'research', name: 'Keyword Research', status: 'completed', duration: 420 },
      { id: 'outline', name: 'Content Outline', status: 'completed', duration: 300 },
      { id: 'content', name: 'Content Generation', status: 'in-progress' },
      { id: 'optimization', name: 'SEO Optimization', status: 'pending' },
      { id: 'quality', name: 'Quality Check', status: 'pending' },
      { id: 'finalize', name: 'Finalization', status: 'pending' }
    ]
  }
];

export const mockContentLibrary = [
  {
    id: '1',
    title: 'Complete Guide to Small Business Accounting Software',
    type: 'guide',
    status: 'published',
    wordCount: 3485,
    readabilityScore: 8.7,
    seoScore: 94,
    performance: {
      views: 12500,
      avgTimeOnPage: 285,
      bounceRate: 0.32,
      conversions: 45
    },
    keywords: ['small business accounting software', 'accounting software for small business'],
    publishedAt: new Date('2024-07-12'),
    lastUpdated: new Date('2024-07-12'),
    author: 'Sarah Johnson',
    clientId: '1'
  },
  {
    id: '2',
    title: 'E-commerce SEO: Boosting Your Online Store Rankings',
    type: 'blog-post',
    status: 'draft',
    wordCount: 1850,
    readabilityScore: 8.2,
    seoScore: 89,
    keywords: ['ecommerce SEO', 'online store SEO', 'product page optimization'],
    createdAt: new Date('2024-07-11'),
    lastUpdated: new Date('2024-07-11'),
    author: 'Mike Chen',
    clientId: '2'
  },
  {
    id: '3',
    title: 'Transform Your Business with Digital Marketing',
    type: 'landing-page',
    status: 'published',
    wordCount: 850,
    readabilityScore: 9.1,
    seoScore: 96,
    performance: {
      views: 8200,
      avgTimeOnPage: 95,
      bounceRate: 0.28,
      conversions: 78
    },
    keywords: ['digital marketing services', 'online marketing', 'digital marketing agency'],
    publishedAt: new Date('2024-07-08'),
    lastUpdated: new Date('2024-07-08'),
    author: 'Emma Davis',
    clientId: '3'
  }
];

export const mockContentTemplates = [
  {
    id: '1',
    name: 'Blog Post Template',
    type: 'blog-post',
    description: 'Standard blog post template with SEO optimization',
    sections: ['Introduction', 'Main Content', 'Key Takeaways', 'Conclusion', 'Call to Action'],
    wordCount: 1500,
    tone: 'conversational',
    usageCount: 45
  },
  {
    id: '2',
    name: 'Product Landing Page',
    type: 'landing-page',
    description: 'High-converting product landing page template',
    sections: ['Hero Section', 'Features & Benefits', 'Social Proof', 'Pricing', 'CTA'],
    wordCount: 800,
    tone: 'professional',
    usageCount: 23
  },
  {
    id: '3',
    name: 'Comprehensive Guide',
    type: 'guide',
    description: 'In-depth guide template for complex topics',
    sections: ['Overview', 'Step-by-Step Instructions', 'Tips & Tricks', 'Common Mistakes', 'Resources'],
    wordCount: 3000,
    tone: 'authoritative',
    usageCount: 12
  }
];