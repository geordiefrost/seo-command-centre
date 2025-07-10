import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Filter,
  Download,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  Settings,
  RefreshCw,
  Save,
  Send
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card, Button, Select, Input, Modal } from '../components/common';

interface ContentPiece {
  id: string;
  title: string;
  type: 'blog-post' | 'product-page' | 'landing-page' | 'meta-description' | 'social-post';
  status: 'draft' | 'in-review' | 'approved' | 'published' | 'generating';
  clientId: string;
  targetKeywords: string[];
  wordCount: number;
  seoScore: number;
  readabilityScore: number;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  contentBrief?: string;
  generatedContent?: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  targetLength: string;
  seoFocus: string[];
}

const Content: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'content' | 'generator' | 'templates' | 'analytics'>('content');
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [contentBrief, setContentBrief] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');

  // Mock data
  const contentPieces: ContentPiece[] = [
    {
      id: '1',
      title: 'Complete Guide to Cloud Accounting Software in Australia',
      type: 'blog-post',
      status: 'published',
      clientId: '1',
      targetKeywords: ['cloud accounting software australia', 'best accounting software', 'accounting software comparison'],
      wordCount: 2850,
      seoScore: 92,
      readabilityScore: 78,
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-05'),
      assignedTo: 'sarah.johnson@bangdigital.com.au'
    },
    {
      id: '2',
      title: 'Tax Planning Strategies for Small Business Owners',
      type: 'blog-post',
      status: 'in-review',
      clientId: '1',
      targetKeywords: ['tax planning strategies', 'small business tax', 'tax deductions australia'],
      wordCount: 1980,
      seoScore: 85,
      readabilityScore: 82,
      createdAt: new Date('2024-07-08'),
      updatedAt: new Date('2024-07-09'),
      assignedTo: 'mike.chen@bangdigital.com.au'
    },
    {
      id: '3',
      title: 'Manufacturing ERP Software Solutions',
      type: 'landing-page',
      status: 'generating',
      clientId: '2',
      targetKeywords: ['manufacturing erp software', 'erp solutions australia', 'manufacturing software'],
      wordCount: 0,
      seoScore: 0,
      readabilityScore: 0,
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-07-10'),
      assignedTo: 'emma.davis@bangdigital.com.au'
    },
    {
      id: '4',
      title: 'Best Accounting Software for Restaurants | CrunchTime Review',
      type: 'meta-description',
      status: 'approved',
      clientId: '1',
      targetKeywords: ['restaurant accounting software', 'crunchtime accounting'],
      wordCount: 155,
      seoScore: 88,
      readabilityScore: 85,
      createdAt: new Date('2024-07-07'),
      updatedAt: new Date('2024-07-08'),
      assignedTo: 'sarah.johnson@bangdigital.com.au'
    }
  ];

  const templates: ContentTemplate[] = [
    {
      id: '1',
      name: 'Product Comparison Guide',
      type: 'blog-post',
      description: 'Comprehensive comparison of products/services in a specific category',
      targetLength: '2000-3000 words',
      seoFocus: ['Comparison keywords', 'Product features', 'Buyer intent']
    },
    {
      id: '2',
      name: 'How-to Guide',
      type: 'blog-post', 
      description: 'Step-by-step instructional content targeting process-based queries',
      targetLength: '1500-2500 words',
      seoFocus: ['How-to keywords', 'Process steps', 'Problem solving']
    },
    {
      id: '3',
      name: 'Service Landing Page',
      type: 'landing-page',
      description: 'Converting landing page for specific service offerings',
      targetLength: '800-1200 words',
      seoFocus: ['Service keywords', 'Benefits', 'Local SEO']
    },
    {
      id: '4',
      name: 'Industry News Article',
      type: 'blog-post',
      description: 'Timely content covering industry trends and news',
      targetLength: '1000-1500 words',
      seoFocus: ['Trending keywords', 'Industry terms', 'Thought leadership']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100 border-green-200';
      case 'approved': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'in-review': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'draft': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'generating': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog-post': return <FileText className="h-4 w-4" />;
      case 'landing-page': return <Target className="h-4 w-4" />;
      case 'product-page': return <BarChart3 className="h-4 w-4" />;
      case 'meta-description': return <Edit3 className="h-4 w-4" />;
      case 'social-post': return <Send className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleGenerateContent = async () => {
    setGeneratingContent(true);
    // Simulate AI content generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    setGeneratingContent(false);
    setShowGenerator(false);
    // Reset form
    setContentBrief('');
    setTargetKeywords('');
    setSelectedTemplate('');
  };

  const filteredContent = contentPieces.filter(content => {
    if (selectedClient === 'all') return true;
    return content.clientId === selectedClient;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
          <p className="text-gray-600 mt-1">
            Create SEO-optimized content at scale with AI assistance
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
            onClick={() => setShowGenerator(true)}
            icon={PlusCircle}
          >
            Generate Content
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'content', label: 'Content Library', icon: FileText },
            { id: 'generator', label: 'AI Generator', icon: Zap },
            { id: 'templates', label: 'Templates', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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

      {/* Content Library Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search content..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'blog-post', label: 'Blog Posts' },
                  { value: 'landing-page', label: 'Landing Pages' },
                  { value: 'product-page', label: 'Product Pages' },
                  { value: 'meta-description', label: 'Meta Descriptions' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by type"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'in-review', label: 'In Review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'published', label: 'Published' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by status"
              />
            </div>
            <Button variant="outline" icon={Download}>
              Export List
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <Card key={content.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(content.type)}
                    <span className="text-sm text-gray-500 capitalize">
                      {content.type.replace('-', ' ')}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(content.status)}`}>
                    {content.status === 'generating' && <RefreshCw className="h-3 w-3 inline mr-1 animate-spin" />}
                    {content.status.replace('-', ' ')}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {content.title}
                </h3>

                <div className="flex flex-wrap gap-1 mb-3">
                  {content.targetKeywords.slice(0, 2).map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      {keyword}
                    </span>
                  ))}
                  {content.targetKeywords.length > 2 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                      +{content.targetKeywords.length - 2} more
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Words</div>
                    <div className="font-semibold">{content.wordCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">SEO Score</div>
                    <div className={`font-semibold ${content.seoScore >= 80 ? 'text-green-600' : content.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {content.seoScore}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Readability</div>
                    <div className={`font-semibold ${content.readabilityScore >= 80 ? 'text-green-600' : content.readabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {content.readabilityScore}/100
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Updated {content.updatedAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" icon={Eye}>
                      View
                    </Button>
                    <Button size="sm" variant="outline" icon={Edit3}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Generator Tab */}
      {activeTab === 'generator' && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <Zap className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Content Generator</h3>
              <p className="text-gray-600">
                Generate high-quality, SEO-optimized content using advanced AI models
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Template
                </label>
                <Select
                  options={[
                    { value: '', label: 'Choose a template...' },
                    ...templates.map(template => ({ value: template.id, label: template.name }))
                  ]}
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                  placeholder="Select template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Keywords
                </label>
                <Input
                  placeholder="Enter target keywords separated by commas..."
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  e.g., accounting software, cloud accounting, financial management
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Brief
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={6}
                  placeholder="Describe what you want the content to cover, target audience, key points to include, tone of voice, etc..."
                  value={contentBrief}
                  onChange={(e) => setContentBrief(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Length
                  </label>
                  <Select
                    options={[
                      { value: 'short', label: 'Short (500-800 words)' },
                      { value: 'medium', label: 'Medium (800-1500 words)' },
                      { value: 'long', label: 'Long (1500-3000 words)' },
                      { value: 'custom', label: 'Custom length' }
                    ]}
                    value="medium"
                    onValueChange={() => {}}
                    placeholder="Select length"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone of Voice
                  </label>
                  <Select
                    options={[
                      { value: 'professional', label: 'Professional' },
                      { value: 'friendly', label: 'Friendly' },
                      { value: 'authoritative', label: 'Authoritative' },
                      { value: 'conversational', label: 'Conversational' },
                      { value: 'technical', label: 'Technical' }
                    ]}
                    value="professional"
                    onValueChange={() => {}}
                    placeholder="Select tone"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center pt-6">
                <Button
                  onClick={handleGenerateContent}
                  disabled={!selectedTemplate || !targetKeywords || !contentBrief || generatingContent}
                  size="lg"
                  className="px-8"
                >
                  {generatingContent ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Templates</h3>
              <p className="text-gray-600">Pre-built templates optimized for different content types</p>
            </div>
            <Button icon={PlusCircle}>
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(template.type)}
                    <span className="text-sm text-gray-500 capitalize">{template.type.replace('-', ' ')}</span>
                  </div>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Target Length</span>
                    <div className="text-sm text-gray-900">{template.targetLength}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">SEO Focus</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.seoFocus.map((focus, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded">
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">248</div>
                  <div className="text-sm text-gray-600">Total Content</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">189</div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">34</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">87</div>
                  <div className="text-sm text-gray-600">Avg SEO Score</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blog Posts</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">78%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Landing Pages</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Product Pages</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">72%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
              <div className="space-y-3">
                {contentPieces.filter(c => c.status === 'published').slice(0, 3).map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {content.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        SEO Score: {content.seoScore}/100
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      +{Math.floor(Math.random() * 200 + 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Content Generator Modal */}
      <Modal open={showGenerator} onOpenChange={setShowGenerator} title="AI Content Generator">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Template
            </label>
            <Select
              options={[
                { value: '', label: 'Choose a template...' },
                ...templates.map(template => ({ value: template.id, label: template.name }))
              ]}
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              placeholder="Select template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Keywords
            </label>
            <Input
              placeholder="Enter target keywords separated by commas..."
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Brief
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Describe what you want the content to cover..."
              value={contentBrief}
              onChange={(e) => setContentBrief(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowGenerator(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateContent}
              disabled={!selectedTemplate || !targetKeywords || !contentBrief || generatingContent}
            >
              {generatingContent ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Content;