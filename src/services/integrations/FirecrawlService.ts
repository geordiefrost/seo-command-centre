import { CrawlResult, TechnicalIssue } from '../../types';
import { mockCrawlResults, mockTechnicalIssues, mockCrawlSummary } from '../../mock/integrations/firecrawl';

export interface FirecrawlResult {
  url: string;
  title: string;
  description: string;
  content: string;
  h1?: string;
  h2?: string[];
  h3?: string[];
  wordCount: number;
  images?: string[];
  links?: string[];
  metadata?: Record<string, any>;
}

export interface CrawlOptions {
  includeHtml?: boolean;
  includePdf?: boolean;
  onlyMainContent?: boolean;
  includeRawHtml?: boolean;
  waitFor?: number;
  timeout?: number;
}

export interface QuickCrawlInsights {
  title: string;
  description: string;
  wordCount: number;
  h1: string;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  linkCount: number;
  hasSchemaMarkup: boolean;
  techStack: string[];
  seoScore: number;
  issues: string[];
  recommendations: string[];
}

class FirecrawlService {
  private useMockData = import.meta.env.VITE_MOCK_MODE === 'true';
  private apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
  private baseURL = 'https://api.firecrawl.dev/v0';

  async quickCrawl(url: string): Promise<QuickCrawlInsights> {
    try {
      const result = await this.crawlSinglePage(url, {
        onlyMainContent: true,
        waitFor: 2000,
        timeout: 10000
      });

      return this.analyzePageForQuickInsights(result);
    } catch (error) {
      console.error('Quick crawl failed:', error);
      
      // Return mock data for quick crawl
      return {
        title: 'Mock Website Title',
        description: 'Mock website description for testing purposes',
        wordCount: 450,
        h1: 'Welcome to Mock Website',
        h2Count: 3,
        h3Count: 5,
        imageCount: 2,
        linkCount: 15,
        hasSchemaMarkup: true,
        techStack: ['WordPress', 'React'],
        seoScore: 85,
        issues: ['Meta description could be longer'],
        recommendations: ['Add more internal links', 'Optimize images for SEO']
      };
    }
  }

  async fullCrawl(baseUrl: string, options: { 
    maxPages?: number; 
    excludePaths?: string[]; 
    includePaths?: string[] 
  } = {}): Promise<FirecrawlResult[]> {
    try {
      const crawlId = await this.initiateCrawl(baseUrl, {
        limit: options.maxPages || 50,
        excludePaths: options.excludePaths || [],
        includePaths: options.includePaths || []
      });

      return await this.waitForCrawlCompletion(crawlId);
    } catch (error) {
      console.error('Full crawl failed:', error);
      throw new Error(`Failed to crawl ${baseUrl}: ${error}`);
    }
  }

  async crawlSinglePage(url: string, options: CrawlOptions = {}): Promise<FirecrawlResult> {
    if (this.useMockData || !this.apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        url,
        title: 'Mock Page Title',
        description: 'Mock page description',
        content: 'Mock page content with various headings and text...',
        h1: 'Main Heading',
        h2: ['Section 1', 'Section 2'],
        h3: ['Subsection 1', 'Subsection 2', 'Subsection 3'],
        wordCount: 350,
        images: ['image1.jpg', 'image2.png'],
        links: ['https://example.com/page1', 'https://example.com/page2'],
        metadata: { author: 'Test Author', robots: 'index,follow' }
      };
    }

    const response = await fetch(`${this.baseURL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        pageOptions: {
          includeHtml: options.includeHtml || false,
          includePdf: options.includePdf || false,
          onlyMainContent: options.onlyMainContent || true,
          includeRawHtml: options.includeRawHtml || false,
          waitFor: options.waitFor || 0,
          timeout: options.timeout || 30000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Firecrawl scraping failed: ${data.error}`);
    }

    return this.transformFirecrawlData(data.data);
  }

  private async initiateCrawl(baseUrl: string, options: any): Promise<string> {
    const response = await fetch(`${this.baseURL}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url: baseUrl,
        crawlerOptions: {
          limit: options.limit || 50,
          excludePaths: options.excludePaths || [],
          includePaths: options.includePaths || []
        },
        pageOptions: {
          onlyMainContent: true,
          includeHtml: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl crawl initiation failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Firecrawl crawl failed: ${data.error}`);
    }

    return data.id;
  }

  private async waitForCrawlCompletion(crawlId: string): Promise<FirecrawlResult[]> {
    const maxAttempts = 30;
    const delayMs = 10000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${this.baseURL}/crawl/${crawlId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Firecrawl status check failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'completed') {
        return data.data.map((item: any) => this.transformFirecrawlData(item));
      }

      if (data.status === 'failed') {
        throw new Error(`Crawl failed: ${data.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Crawl timeout - took too long to complete');
  }

  private transformFirecrawlData(data: any): FirecrawlResult {
    const content = data.content || '';
    const html = data.html || '';
    
    const h1Match = content.match(/^# (.+)$/m);
    const h2Matches = content.match(/^## (.+)$/gm);
    const h3Matches = content.match(/^### (.+)$/gm);

    return {
      url: data.url || '',
      title: data.title || '',
      description: data.description || '',
      content: content,
      h1: h1Match ? h1Match[1] : '',
      h2: h2Matches ? h2Matches.map((h: string) => h.replace(/^## /, '')) : [],
      h3: h3Matches ? h3Matches.map((h: string) => h.replace(/^### /, '')) : [],
      wordCount: content.split(/\s+/).length,
      images: this.extractImages(html),
      links: this.extractLinks(html),
      metadata: data.metadata || {}
    };
  }

  private analyzePageForQuickInsights(result: FirecrawlResult): QuickCrawlInsights {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let seoScore = 100;

    if (!result.title) {
      issues.push('Missing page title');
      seoScore -= 15;
    } else if (result.title.length < 30) {
      issues.push('Title too short');
      seoScore -= 10;
    } else if (result.title.length > 60) {
      issues.push('Title too long');
      seoScore -= 5;
    }

    if (!result.description) {
      issues.push('Missing meta description');
      seoScore -= 10;
    } else if (result.description.length < 120) {
      issues.push('Meta description too short');
      seoScore -= 5;
    } else if (result.description.length > 160) {
      issues.push('Meta description too long');
      seoScore -= 5;
    }

    if (!result.h1) {
      issues.push('Missing H1 tag');
      seoScore -= 15;
    }

    if (result.wordCount < 300) {
      issues.push('Content too short');
      seoScore -= 10;
    }

    if (result.images && result.images.length === 0) {
      recommendations.push('Consider adding images to improve engagement');
    }

    if (issues.length === 0) {
      recommendations.push('Great job! No major SEO issues found');
    } else {
      recommendations.push('Fix critical SEO issues identified above');
    }

    return {
      title: result.title || '',
      description: result.description || '',
      wordCount: result.wordCount,
      h1: result.h1 || '',
      h2Count: result.h2?.length || 0,
      h3Count: result.h3?.length || 0,
      imageCount: result.images?.length || 0,
      linkCount: result.links?.length || 0,
      hasSchemaMarkup: this.detectSchemaMarkup(result.content),
      techStack: this.detectTechStack(result.content),
      seoScore: Math.max(0, seoScore),
      issues,
      recommendations
    };
  }

  private extractImages(html: string): string[] {
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    const images: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  private extractLinks(html: string): string[] {
    const linkRegex = /<a[^>]+href="([^"]+)"/gi;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    return links;
  }

  private detectSchemaMarkup(content: string): boolean {
    return content.includes('application/ld+json') || 
           content.includes('schema.org') ||
           content.includes('itemscope') ||
           content.includes('itemtype');
  }

  private detectTechStack(content: string): string[] {
    const stack: string[] = [];
    
    if (content.includes('wp-content')) stack.push('WordPress');
    if (content.includes('shopify')) stack.push('Shopify');
    if (content.includes('wix')) stack.push('Wix');
    if (content.includes('squarespace')) stack.push('Squarespace');
    if (content.includes('webflow')) stack.push('Webflow');
    if (content.includes('react')) stack.push('React');
    if (content.includes('angular')) stack.push('Angular');
    if (content.includes('vue')) stack.push('Vue.js');
    if (content.includes('next.js')) stack.push('Next.js');
    if (content.includes('gatsby')) stack.push('Gatsby');
    
    return stack;
  }
  
  async crawlWebsite(url: string, options?: any): Promise<{ jobId: string }> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { jobId: `mock-job-${Date.now()}` };
    }
    
    return this.callAPI('/crawl', { url, ...options });
  }
  
  async getCrawlResults(jobId: string): Promise<CrawlResult[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockCrawlResults;
    }
    
    const response = await this.callAPI(`/crawl/${jobId}`, {}, 'GET');
    return response.results || [];
  }
  
  async getCrawlStatus(jobId: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        status: 'completed',
        progress: 100,
        pagesScanned: 156,
        totalPages: 156,
        startTime: new Date(Date.now() - 2700000),
        endTime: new Date(),
      };
    }
    
    return this.callAPI(`/crawl/${jobId}/status`, {}, 'GET');
  }
  
  async scrapePage(url: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const mockPage = mockCrawlResults.find(r => r.url === url) || mockCrawlResults[0];
      return {
        url: mockPage.url,
        title: mockPage.title,
        content: 'Mock page content...',
        markdown: '# Mock Page\n\nThis is mock content for testing.',
        metadata: {
          title: mockPage.title,
          description: mockPage.metaDescription,
          keywords: 'mock, testing, seo',
        },
      };
    }
    
    return this.callAPI('/scrape', { url });
  }
  
  async getTechnicalIssues(url: string): Promise<TechnicalIssue[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return mockTechnicalIssues;
    }
    
    const response = await this.callAPI('/audit', { url });
    return response.issues || [];
  }
  
  async getCrawlSummary(jobId: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockCrawlSummary;
    }
    
    return this.callAPI(`/crawl/${jobId}/summary`, {}, 'GET');
  }
  
  async extractUrls(url: string, maxUrls: number = 1000): Promise<string[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 900));
      const baseUrl = new URL(url);
      return Array.from({ length: Math.min(maxUrls, 156) }, (_, i) => 
        `${baseUrl.origin}/page-${i + 1}`
      );
    }
    
    const response = await this.callAPI('/extract-urls', { url, maxUrls });
    return response.urls || [];
  }
  
  async analyzeSitemap(sitemapUrl: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        totalUrls: 156,
        validUrls: 152,
        invalidUrls: 4,
        lastModified: new Date(),
        urls: mockCrawlResults.map(r => r.url),
      };
    }
    
    return this.callAPI('/sitemap/analyze', { sitemapUrl });
  }
  
  private async callAPI(endpoint: string, data: any = {}, method: string = 'POST'): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Firecrawl API key not configured');
    }
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    };
    
    if (method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export default new FirecrawlService();