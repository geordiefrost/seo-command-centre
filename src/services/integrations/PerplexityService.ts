import { Strategy, Recommendation } from '../../types';
import { 
  mockStrategyRecommendations, 
  mockStrategies, 
  mockContentAnalysis, 
  mockInsights 
} from '../../mock/integrations/perplexity';

interface StrategyContext {
  clientId: string;
  industry: string;
  currentMetrics: any;
  competitorData: any;
  goals: string[];
  timeframe: string;
}

class PerplexityService {
  private useMockData = import.meta.env.VITE_MOCK_MODE === 'true';
  private apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  private baseURL = 'https://api.perplexity.ai';
  
  async generateStrategy(context: StrategyContext): Promise<Strategy> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const strategy = mockStrategies.find(s => s.clientId === context.clientId) || mockStrategies[0];
      return {
        ...strategy,
        id: `strategy-${Date.now()}`,
        clientId: context.clientId,
        timeframe: context.timeframe as any,
        createdAt: new Date(),
      };
    }
    
    const prompt = this.buildStrategyPrompt(context);
    const response = await this.callAPI('/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO strategist. Analyze the provided data and generate comprehensive SEO strategy recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    return this.parseStrategyResponse(response, context);
  }
  
  async analyzeContent(content: string, keywords: string[]): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return {
        ...mockContentAnalysis,
        keywordDensity: keywords.reduce((acc, keyword) => {
          acc[keyword] = Math.random() * 3;
          return acc;
        }, {} as Record<string, number>),
      };
    }
    
    const prompt = `Analyze this content for SEO optimization. Focus on readability, keyword usage, and overall quality:\n\n${content}\n\nTarget keywords: ${keywords.join(', ')}`;
    
    const response = await this.callAPI('/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO content analyst. Provide detailed analysis of content quality, SEO optimization, and recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    return this.parseContentAnalysis(response);
  }
  
  async getRecommendations(data: any): Promise<Recommendation[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockStrategyRecommendations;
    }
    
    const prompt = this.buildRecommendationsPrompt(data);
    const response = await this.callAPI('/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO consultant. Analyze the data and provide specific, actionable recommendations prioritized by impact and effort.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    return this.parseRecommendations(response);
  }
  
  async generateInsights(context: any): Promise<any[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockInsights;
    }
    
    const prompt = `Based on current SEO trends and the following context, provide actionable insights and opportunities:\n${JSON.stringify(context, null, 2)}`;
    
    const response = await this.callAPI('/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO trend analyst. Provide current insights, opportunities, and warnings based on the latest SEO developments.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    return this.parseInsights(response);
  }
  
  async optimizeContent(content: string, targetKeywords: string[], intent: string): Promise<string> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1800));
      return content + '\n\n[Mock optimization applied: improved keyword density, enhanced readability, added semantic keywords]';
    }
    
    const prompt = `Optimize this content for SEO while maintaining readability and user value. Target keywords: ${targetKeywords.join(', ')}. Search intent: ${intent}\n\nContent:\n${content}`;
    
    const response = await this.callAPI('/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content optimizer. Improve content for search engines while maintaining quality and readability.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    return response.choices[0]?.message?.content || content;
  }
  
  private buildStrategyPrompt(context: StrategyContext): string {
    return `
Generate a comprehensive SEO strategy for a ${context.industry} business with the following context:

Client ID: ${context.clientId}
Industry: ${context.industry}
Timeframe: ${context.timeframe}
Goals: ${context.goals.join(', ')}

Current Metrics: ${JSON.stringify(context.currentMetrics)}
Competitor Data: ${JSON.stringify(context.competitorData)}

Please provide:
1. Priority recommendations with impact/effort scoring
2. KPIs and target metrics
3. Implementation timeline
4. Resource requirements

Focus on data-driven, actionable recommendations.
    `;
  }
  
  private buildRecommendationsPrompt(data: any): string {
    return `
Analyze the following SEO data and provide specific recommendations:

${JSON.stringify(data, null, 2)}

For each recommendation, include:
- Title and description
- Impact level (low/medium/high)
- Effort level (low/medium/high)
- Priority score (1-10)
- Estimated traffic impact
- Time to complete
- Prerequisites and resources needed
    `;
  }
  
  private async callAPI(endpoint: string, data: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private parseStrategyResponse(response: any, context: StrategyContext): Strategy {
    // Parse AI response and convert to Strategy object
    // This would include natural language processing of the response
    // For now, return mock data structure
    return mockStrategies[0];
  }
  
  private parseContentAnalysis(response: any): any {
    // Parse AI response for content analysis
    return mockContentAnalysis;
  }
  
  private parseRecommendations(response: any): Recommendation[] {
    // Parse AI response for recommendations
    return mockStrategyRecommendations;
  }
  
  private parseInsights(response: any): any[] {
    // Parse AI response for insights
    return mockInsights;
  }
}

export default new PerplexityService();