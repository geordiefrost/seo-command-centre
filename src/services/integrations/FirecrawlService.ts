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
  pagesAnalyzed?: number;
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
    console.log('Starting full crawl:', {
      baseUrl,
      options,
      hasApiKey: !!this.apiKey,
      useMockData: this.useMockData
    });

    // Validate and normalize URL format
    let normalizedUrl = baseUrl;
    try {
      new URL(baseUrl);
    } catch (error) {
      // Try adding https:// if no protocol is present
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        normalizedUrl = `https://${baseUrl}`;
        console.log('Adding https:// to URL:', normalizedUrl);
        try {
          new URL(normalizedUrl);
        } catch (secondError) {
          const errorMsg = `Invalid URL format: ${baseUrl}. Please enter a valid URL with protocol (e.g., https://example.com)`;
          console.error(errorMsg, secondError);
          throw new Error(errorMsg);
        }
      } else {
        const errorMsg = `Invalid URL format: ${baseUrl}`;
        console.error(errorMsg, error);
        throw new Error(errorMsg);
      }
    }

    // Check if API is configured
    if (!this.apiKey) {
      const error = 'Firecrawl API key not configured. Please set VITE_FIRECRAWL_API_KEY environment variable.';
      console.error(error);
      throw new Error(error);
    }

    if (this.useMockData) {
      console.log('Using mock data for development');
      return this.getMockFullCrawlResults(normalizedUrl, options.maxPages || 20);
    }

    try {
      console.log('Initiating crawl with Firecrawl API...');
      
      const crawlId = await this.initiateCrawl(normalizedUrl, {
        limit: options.maxPages || 50,
        excludePaths: options.excludePaths || [],
        includePaths: options.includePaths || []
      });

      console.log('Crawl initiated, waiting for completion:', {
        crawlId,
        normalizedUrl
      });
      
      const results = await this.waitForCrawlCompletion(crawlId);
      
      console.log('Crawl completed successfully:', {
        crawlId,
        pagesFound: results.length
      });
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error('Firecrawl API Error:', {
        error: errorMessage,
        baseUrl,
        options,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Don't fallback to mock data - throw the actual error
      throw new Error(`Firecrawl API failed: ${errorMessage}`);
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
    const requestPayload = {
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
    };

    console.log('Firecrawl API Request:', {
      url: `${this.baseURL}/crawl`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey?.substring(0, 10)}...`,
      },
      payload: requestPayload
    });

    const response = await fetch(`${this.baseURL}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    console.log('Firecrawl API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API Error Response:', errorText);
      throw new Error(`Firecrawl crawl initiation failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log('Firecrawl API Response Data:', data);
    
    if (!data.success) {
      const errorMsg = data.error || 'Unknown error';
      console.error('Firecrawl crawl failed:', data);
      throw new Error(`Firecrawl crawl failed: ${errorMsg}`);
    }

    if (!data.id) {
      console.error('Firecrawl response missing ID:', data);
      throw new Error('Firecrawl API response missing crawl ID');
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
  
  /**
   * Convert full crawl results to insights format for UI display
   */
  convertCrawlToInsights(results: FirecrawlResult[]): QuickCrawlInsights {
    if (!results || results.length === 0) {
      return {
        title: 'No data available',
        description: 'No pages were crawled successfully',
        wordCount: 0,
        h1: '',
        h2Count: 0,
        h3Count: 0,
        imageCount: 0,
        linkCount: 0,
        hasSchemaMarkup: false,
        techStack: [],
        seoScore: 0,
        issues: ['No pages crawled'],
        recommendations: ['Try crawling again'],
        pagesAnalyzed: 0
      };
    }

    // Use the first page as the primary page for title/description
    const primaryPage = results[0];
    
    // Aggregate data from all pages
    const totalWordCount = results.reduce((sum, page) => sum + page.wordCount, 0);
    const totalImages = results.reduce((sum, page) => sum + (page.images?.length || 0), 0);
    const totalLinks = results.reduce((sum, page) => sum + (page.links?.length || 0), 0);
    const totalH2 = results.reduce((sum, page) => sum + (page.h2?.length || 0), 0);
    const totalH3 = results.reduce((sum, page) => sum + (page.h3?.length || 0), 0);
    
    // Detect common tech stack across pages
    const techStackDetected = new Set<string>();
    results.forEach(page => {
      const tech = this.detectTechStack(page.content);
      tech.forEach(t => techStackDetected.add(t));
    });
    
    // Calculate overall SEO score
    const individualScores = results.map(page => this.calculateSEOScore(page));
    const avgSeoScore = individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length;
    
    // Collect issues from all pages
    const allIssues = new Set<string>();
    results.forEach(page => {
      const issues = this.getSEOIssues(page);
      issues.forEach(issue => allIssues.add(issue));
    });
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(results);
    
    return {
      title: primaryPage.title || 'Untitled Page',
      description: primaryPage.description || 'No description available',
      wordCount: totalWordCount,
      h1: primaryPage.h1 || '',
      h2Count: totalH2,
      h3Count: totalH3,
      imageCount: totalImages,
      linkCount: totalLinks,
      hasSchemaMarkup: results.some(page => this.detectSchemaMarkup(page.content)),
      techStack: Array.from(techStackDetected),
      seoScore: Math.round(avgSeoScore),
      issues: Array.from(allIssues),
      recommendations,
      pagesAnalyzed: results.length
    };
  }
  
  private calculateSEOScore(page: FirecrawlResult): number {
    let score = 100;
    
    if (!page.title) score -= 15;
    else if (page.title.length < 30 || page.title.length > 60) score -= 10;
    
    if (!page.description) score -= 10;
    else if (page.description.length < 120 || page.description.length > 160) score -= 5;
    
    if (!page.h1) score -= 15;
    if (page.wordCount < 300) score -= 10;
    
    return Math.max(0, score);
  }
  
  private getSEOIssues(page: FirecrawlResult): string[] {
    const issues: string[] = [];
    
    if (!page.title) issues.push('Missing page title');
    else if (page.title.length < 30) issues.push('Title too short');
    else if (page.title.length > 60) issues.push('Title too long');
    
    if (!page.description) issues.push('Missing meta description');
    else if (page.description.length < 120) issues.push('Meta description too short');
    else if (page.description.length > 160) issues.push('Meta description too long');
    
    if (!page.h1) issues.push('Missing H1 tag');
    if (page.wordCount < 300) issues.push('Low word count');
    
    return issues;
  }
  
  private generateRecommendations(results: FirecrawlResult[]): string[] {
    const recommendations: string[] = [];
    const pagesWithoutTitles = results.filter(p => !p.title).length;
    const pagesWithoutDescriptions = results.filter(p => !p.description).length;
    const pagesWithoutH1 = results.filter(p => !p.h1).length;
    
    if (pagesWithoutTitles > 0) {
      recommendations.push(`Add titles to ${pagesWithoutTitles} pages`);
    }
    if (pagesWithoutDescriptions > 0) {
      recommendations.push(`Add meta descriptions to ${pagesWithoutDescriptions} pages`);
    }
    if (pagesWithoutH1 > 0) {
      recommendations.push(`Add H1 tags to ${pagesWithoutH1} pages`);
    }
    
    recommendations.push('Review internal linking structure');
    recommendations.push('Optimize images with alt text');
    recommendations.push('Implement schema markup');
    
    return recommendations;
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

  /**
   * Generate mock full crawl results for testing (only used in development)
   */
  private getMockFullCrawlResults(baseUrl: string, maxPages: number): FirecrawlResult[] {
    const results: FirecrawlResult[] = [];
    
    // Validate URL before processing
    let domain: string;
    try {
      domain = new URL(baseUrl).hostname;
    } catch (error) {
      console.error('Invalid URL in mock data generator:', baseUrl);
      throw new Error(`Invalid URL format: ${baseUrl}`);
    }
    
    console.log('Generating mock crawl results:', {
      baseUrl,
      domain,
      maxPages
    });
    
    for (let i = 0; i < Math.min(maxPages, 20); i++) {
      const pageUrl = i === 0 ? baseUrl : `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}page-${i}`;
      
      results.push({
        url: pageUrl,
        title: i === 0 ? `${domain} - Homepage` : `${domain} - Page ${i}`,
        description: i === 0 ? 
          `Welcome to ${domain}. Your trusted source for quality products and services.` :
          `Page ${i} content on ${domain}. Discover more about our offerings and services.`,
        content: `# ${i === 0 ? 'Welcome to Our Website' : `Page ${i} Title`}

This is page ${i === 0 ? 'content for the homepage' : `${i} with relevant information`}. We provide excellent services and products for our customers.

## Our Services
- Service 1: High-quality solutions
- Service 2: Expert consultation
- Service 3: Ongoing support

## About Us
We are a leading company in our industry, committed to delivering exceptional value to our customers.

### Contact Information
Get in touch with us today to learn more about how we can help you achieve your goals.`,
        h1: i === 0 ? 'Welcome to Our Website' : `Page ${i} Title`,
        h2: ['Our Services', 'About Us'],
        h3: ['Contact Information'],
        wordCount: 150 + (i * 25),
        images: [`${baseUrl}/images/hero-${i}.jpg`, `${baseUrl}/images/service-${i}.jpg`],
        links: [
          `${baseUrl}/contact`,
          `${baseUrl}/about`,
          `${baseUrl}/services`,
          `${baseUrl}/page-${(i + 1) % maxPages}`
        ]
      });
    }
    
    console.log('Generated mock crawl results:', results.length, 'pages');
    return results;
  }
}

export default new FirecrawlService();