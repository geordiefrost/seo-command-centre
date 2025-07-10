import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Search,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Zap,
  FileText,
  Download
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card, Button, Select, Input } from '../components/common';

interface StrategyOpportunity {
  id: string;
  type: 'keyword' | 'content' | 'technical' | 'backlink';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  estimatedTraffic: number;
  difficulty: number;
}

interface StrategyRecommendation {
  id: string;
  category: 'on-page' | 'technical' | 'content' | 'off-page';
  title: string;
  description: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeframe: '1-2 weeks' | '1 month' | '2-3 months' | '3+ months';
  resources: string[];
}

const Strategy: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'assistant' | 'opportunities' | 'recommendations'>('assistant');
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [strategyGenerated, setStrategyGenerated] = useState(false);

  // Mock data
  const opportunities: StrategyOpportunity[] = [
    {
      id: '1',
      type: 'keyword',
      title: 'Target "best accounting software australia" cluster',
      description: 'High-volume keyword cluster with strong commercial intent and manageable competition.',
      impact: 'high',
      effort: 'medium',
      priority: 95,
      estimatedTraffic: 2800,
      difficulty: 45
    },
    {
      id: '2',
      type: 'content',
      title: 'Create comprehensive tax guide series',
      description: 'Multi-part content series targeting tax-related queries during peak season.',
      impact: 'high',
      effort: 'high',
      priority: 88,
      estimatedTraffic: 3200,
      difficulty: 35
    },
    {
      id: '3',
      type: 'technical',
      title: 'Improve Core Web Vitals scores',
      description: 'Optimize page loading speeds and user experience metrics for better rankings.',
      impact: 'medium',
      effort: 'medium',
      priority: 75,
      estimatedTraffic: 1500,
      difficulty: 25
    },
    {
      id: '4',
      type: 'backlink',
      title: 'Industry publication outreach campaign',
      description: 'Target high-authority accounting and business publications for quality backlinks.',
      impact: 'medium',
      effort: 'high',
      priority: 70,
      estimatedTraffic: 800,
      difficulty: 60
    }
  ];

  const recommendations: StrategyRecommendation[] = [
    {
      id: '1',
      category: 'technical',
      title: 'Fix critical crawlability issues',
      description: 'Address 15 pages with 404 errors and 8 pages with broken internal links affecting crawl budget.',
      action: 'Redirect broken URLs to relevant pages and fix internal link structure',
      priority: 'critical',
      timeframe: '1-2 weeks',
      resources: ['Developer', 'SEO Executive']
    },
    {
      id: '2',
      category: 'content',
      title: 'Optimize thin content pages',
      description: '23 pages have less than 300 words and provide minimal value to users.',
      action: 'Expand content with relevant information or consolidate similar pages',
      priority: 'high',
      timeframe: '1 month',
      resources: ['Content Writer', 'SEO Executive']
    },
    {
      id: '3',
      category: 'on-page',
      title: 'Improve title tag optimization',
      description: '12 pages have duplicate title tags and 8 pages exceed optimal length.',
      action: 'Create unique, keyword-optimized title tags under 60 characters',
      priority: 'high',
      timeframe: '1-2 weeks',
      resources: ['SEO Executive']
    },
    {
      id: '4',
      category: 'off-page',
      title: 'Diversify anchor text profile',
      description: '68% of backlinks use exact match anchor text, creating over-optimization risk.',
      action: 'Implement varied anchor text strategy in future link building',
      priority: 'medium',
      timeframe: '2-3 months',
      resources: ['SEO Executive', 'Outreach Specialist']
    }
  ];

  const handleGenerateStrategy = async () => {
    setGeneratingStrategy(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratingStrategy(false);
    setStrategyGenerated(true);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Zap className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'on-page': return <Search className="h-4 w-4" />;
      case 'off-page': return <TrendingUp className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Strategy Assistant</h1>
          <p className="text-gray-600 mt-1">
            AI-powered SEO strategy generation with data-driven insights and recommendations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            options={[
              { value: 'all', label: 'All Clients' },
              ...clients.map(client => ({ value: client.id, label: client.name }))
            ]}
            value={selectedClient}
            onValueChange={setSelectedClient}
            placeholder="Select client"
          />
          <Button
            onClick={handleGenerateStrategy}
            icon={Lightbulb}
            disabled={generatingStrategy}
          >
            {generatingStrategy ? 'Generating...' : 'Generate Strategy'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'assistant', label: 'Strategy Assistant', icon: Lightbulb },
            { id: 'opportunities', label: 'Opportunity Matrix', icon: Target },
            { id: 'recommendations', label: 'Recommendations', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${
                activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          {!strategyGenerated ? (
            <Card className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <Lightbulb className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI-Powered Strategy Generation
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate comprehensive SEO strategies based on competitor analysis, 
                  keyword research, and technical audits.
                </p>
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={generatingStrategy}
                  size="lg"
                  className="w-full"
                >
                  {generatingStrategy ? 'Analyzing...' : 'Start Strategy Generation'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Strategy Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Strategy Summary</h3>
                    <Button variant="outline" size="sm" icon={Download}>
                      Export
                    </Button>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      Based on comprehensive analysis of your website, competitors, and market opportunities, 
                      here's your tailored SEO strategy for the next 6 months:
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">Primary Focus Areas</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>Content cluster development around "accounting software" keywords</li>
                          <li>Technical SEO improvements for Core Web Vitals</li>
                          <li>Local SEO optimization for Australian market</li>
                          <li>E-A-T improvements through expert content and backlinks</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Expected Outcomes</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>25-40% increase in organic traffic within 6 months</li>
                          <li>Improved rankings for 15+ target keywords</li>
                          <li>Enhanced user experience and conversion rates</li>
                          <li>Stronger domain authority and topical relevance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Roadmap</h3>
                  <div className="space-y-4">
                    {[
                      { phase: 'Month 1-2', title: 'Foundation & Quick Wins', tasks: ['Fix technical issues', 'Optimize existing content', 'Improve page speed'] },
                      { phase: 'Month 3-4', title: 'Content & Authority Building', tasks: ['Create content clusters', 'Begin outreach campaigns', 'Local SEO optimization'] },
                      { phase: 'Month 5-6', title: 'Scale & Optimize', tasks: ['Expand keyword targeting', 'Advanced technical optimizations', 'Conversion rate optimization'] }
                    ].map((phase, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-20 text-sm font-semibold text-primary-600">
                          {phase.phase}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{phase.title}</h4>
                          <ul className="text-gray-600 text-sm mt-1">
                            {phase.tasks.map((task, taskIndex) => (
                              <li key={taskIndex}>• {task}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Key Metrics */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">SEO Score</span>
                        <span className="text-sm font-semibold">74/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '74%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Keyword Opportunities</span>
                        <span className="text-sm font-semibold">156</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Competition Level</span>
                        <span className="text-sm font-semibold text-yellow-600">Medium</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Market Size</span>
                        <span className="text-sm font-semibold text-green-600">Large</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Actions</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Fix crawl errors', priority: 'critical' },
                      { title: 'Optimize title tags', priority: 'high' },
                      { title: 'Create content cluster', priority: 'high' },
                      { title: 'Improve page speed', priority: 'medium' }
                    ].map((action, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{action.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Opportunity Matrix</h3>
              <p className="text-gray-600">SEO opportunities ranked by impact vs effort</p>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search opportunities..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'keyword', label: 'Keyword' },
                  { value: 'content', label: 'Content' },
                  { value: 'technical', label: 'Technical' },
                  { value: 'backlink', label: 'Backlink' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by type"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opportunity.impact)}`}>
                      {opportunity.type}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold ml-1">{opportunity.priority}</span>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{opportunity.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Est. Traffic</div>
                    <div className="text-lg font-semibold text-green-600">+{opportunity.estimatedTraffic.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Difficulty</div>
                    <div className="text-lg font-semibold text-orange-600">{opportunity.difficulty}/100</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opportunity.impact)}`}>
                      {opportunity.impact} impact
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opportunity.effort)}`}>
                      {opportunity.effort} effort
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SEO Recommendations</h3>
              <p className="text-gray-600">Actionable insights prioritized by impact</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by priority"
              />
              <Button variant="outline" icon={Download}>
                Export Report
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className={`p-6 border-l-4 ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-gray-500">{rec.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{rec.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Create Task
                  </Button>
                </div>
                
                <p className="text-gray-600 mb-3">{rec.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-sm font-medium text-gray-900 mb-1">Recommended Action:</div>
                  <div className="text-sm text-gray-700">{rec.action}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Resources needed:</span> {rec.resources.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      Learn More
                    </Button>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Strategy;