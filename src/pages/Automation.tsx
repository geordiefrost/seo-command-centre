import React, { useState } from 'react';
import { 
  Play,
  Pause,
  Square,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  Download,
  Upload,
  Plus,
  Edit3,
  Eye,
  ArrowRight,
  BarChart3,
  Target,
  FileText,
  Globe,
  Link,
  Users,
  Code
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card, Button, Select, Input } from '../components/common';

interface AutomationTask {
  id: string;
  name: string;
  description: string;
  type: 'content-generation' | 'technical-audit' | 'keyword-tracking' | 'link-building' | 'reporting';
  status: 'running' | 'paused' | 'completed' | 'failed' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    nextRun?: Date;
    lastRun?: Date;
  };
  clientId: string;
  progress: number;
  estimatedDuration: string;
  actualDuration?: string;
  results?: {
    success: number;
    failed: number;
    total: number;
  };
  createdBy: string;
  createdAt: Date;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'seo-audit' | 'content-workflow' | 'monitoring' | 'reporting';
  steps: WorkflowStep[];
  estimatedTime: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  usageCount: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  icon: string;
  description: string;
  settings: Record<string, any>;
  connections: string[];
}

interface ExecutionLog {
  id: string;
  taskId: string;
  status: 'success' | 'failed' | 'warning';
  message: string;
  details?: string;
  timestamp: Date;
  executionTime: number;
  resourcesUsed?: {
    apiCalls?: number;
    credits?: number;
  };
}

const Automation: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'builder' | 'templates' | 'logs'>('tasks');
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'paused' | 'completed' | 'failed'>('all');

  // Mock data
  const automationTasks: AutomationTask[] = [
    {
      id: '1',
      name: 'Daily Technical SEO Audit',
      description: 'Automated crawl and analysis of technical SEO issues including broken links, duplicate content, and Core Web Vitals',
      type: 'technical-audit',
      status: 'running',
      priority: 'high',
      schedule: {
        frequency: 'daily',
        nextRun: new Date('2024-07-11T09:00:00'),
        lastRun: new Date('2024-07-10T09:00:00')
      },
      clientId: '1',
      progress: 75,
      estimatedDuration: '45 minutes',
      actualDuration: '38 minutes',
      results: {
        success: 125,
        failed: 3,
        total: 128
      },
      createdBy: 'sarah.johnson@bangdigital.com.au',
      createdAt: new Date('2024-06-15')
    },
    {
      id: '2',
      name: 'Weekly Content Generation',
      description: 'Generate SEO-optimized blog posts based on keyword opportunities and competitor analysis',
      type: 'content-generation',
      status: 'scheduled',
      priority: 'medium',
      schedule: {
        frequency: 'weekly',
        nextRun: new Date('2024-07-15T10:00:00'),
        lastRun: new Date('2024-07-08T10:00:00')
      },
      clientId: '1',
      progress: 0,
      estimatedDuration: '2 hours',
      results: {
        success: 12,
        failed: 1,
        total: 13
      },
      createdBy: 'mike.chen@bangdigital.com.au',
      createdAt: new Date('2024-06-20')
    },
    {
      id: '3',
      name: 'Keyword Ranking Monitor',
      description: 'Track keyword positions across search engines and alert on significant changes',
      type: 'keyword-tracking',
      status: 'running',
      priority: 'high',
      schedule: {
        frequency: 'daily',
        nextRun: new Date('2024-07-11T06:00:00'),
        lastRun: new Date('2024-07-10T06:00:00')
      },
      clientId: '2',
      progress: 45,
      estimatedDuration: '30 minutes',
      results: {
        success: 450,
        failed: 5,
        total: 455
      },
      createdBy: 'emma.davis@bangdigital.com.au',
      createdAt: new Date('2024-06-10')
    },
    {
      id: '4',
      name: 'Monthly SEO Report Generation',
      description: 'Compile comprehensive SEO performance reports with insights and recommendations',
      type: 'reporting',
      status: 'completed',
      priority: 'medium',
      schedule: {
        frequency: 'monthly',
        nextRun: new Date('2024-08-01T08:00:00'),
        lastRun: new Date('2024-07-01T08:00:00')
      },
      clientId: '1',
      progress: 100,
      estimatedDuration: '1.5 hours',
      actualDuration: '1.2 hours',
      results: {
        success: 1,
        failed: 0,
        total: 1
      },
      createdBy: 'david.wilson@bangdigital.com.au',
      createdAt: new Date('2024-05-25')
    }
  ];

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Complete Technical SEO Audit',
      description: 'Comprehensive technical audit including crawl analysis, Core Web Vitals, and security checks',
      category: 'seo-audit',
      steps: [
        { id: '1', name: 'Site Crawl', type: 'action', icon: 'Globe', description: 'Crawl website for technical issues', settings: {}, connections: ['2'] },
        { id: '2', name: 'Performance Analysis', type: 'action', icon: 'Zap', description: 'Analyze Core Web Vitals', settings: {}, connections: ['3'] },
        { id: '3', name: 'Generate Report', type: 'action', icon: 'FileText', description: 'Compile audit results', settings: {}, connections: [] }
      ],
      estimatedTime: '45 minutes',
      complexity: 'intermediate',
      usageCount: 23
    },
    {
      id: '2',
      name: 'Content Optimization Workflow',
      description: 'Analyze existing content and generate optimization recommendations',
      category: 'content-workflow',
      steps: [
        { id: '1', name: 'Content Analysis', type: 'action', icon: 'FileText', description: 'Analyze existing content', settings: {}, connections: ['2'] },
        { id: '2', name: 'Keyword Research', type: 'action', icon: 'Search', description: 'Find keyword opportunities', settings: {}, connections: ['3'] },
        { id: '3', name: 'Optimization Suggestions', type: 'action', icon: 'Target', description: 'Generate recommendations', settings: {}, connections: [] }
      ],
      estimatedTime: '30 minutes',
      complexity: 'simple',
      usageCount: 18
    },
    {
      id: '3',
      name: 'Competitor Monitoring Setup',
      description: 'Set up automated competitor tracking and change detection',
      category: 'monitoring',
      steps: [
        { id: '1', name: 'Competitor Discovery', type: 'action', icon: 'Users', description: 'Identify competitors', settings: {}, connections: ['2'] },
        { id: '2', name: 'Baseline Analysis', type: 'action', icon: 'BarChart3', description: 'Establish baseline metrics', settings: {}, connections: ['3'] },
        { id: '3', name: 'Schedule Monitoring', type: 'action', icon: 'Clock', description: 'Set up regular checks', settings: {}, connections: [] }
      ],
      estimatedTime: '1 hour',
      complexity: 'advanced',
      usageCount: 12
    }
  ];

  const executionLogs: ExecutionLog[] = [
    {
      id: '1',
      taskId: '1',
      status: 'success',
      message: 'Technical audit completed successfully',
      details: 'Analyzed 485 pages, found 12 issues, generated comprehensive report',
      timestamp: new Date('2024-07-10T09:38:00'),
      executionTime: 2280,
      resourcesUsed: {
        apiCalls: 485,
        credits: 15
      }
    },
    {
      id: '2',
      taskId: '3',
      status: 'warning',
      message: 'Keyword tracking completed with warnings',
      details: '5 keywords could not be tracked due to API rate limits',
      timestamp: new Date('2024-07-10T06:25:00'),
      executionTime: 1800,
      resourcesUsed: {
        apiCalls: 450,
        credits: 12
      }
    },
    {
      id: '3',
      taskId: '2',
      status: 'failed',
      message: 'Content generation failed',
      details: 'OpenAI API quota exceeded. Retrying in 1 hour.',
      timestamp: new Date('2024-07-08T10:15:00'),
      executionTime: 300,
      resourcesUsed: {
        apiCalls: 10,
        credits: 0
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      case 'paused': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'scheduled': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content-generation': return <FileText className="h-4 w-4" />;
      case 'technical-audit': return <Zap className="h-4 w-4" />;
      case 'keyword-tracking': return <Target className="h-4 w-4" />;
      case 'link-building': return <Link className="h-4 w-4" />;
      case 'reporting': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredTasks = automationTasks.filter(task => {
    if (selectedClient !== 'all' && task.clientId !== selectedClient) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Automation</h1>
          <p className="text-gray-600 mt-1">
            Automate repetitive SEO tasks and workflows
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
          <Button icon={Plus}>
            Create Automation
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tasks', label: 'Active Tasks', icon: Play },
            { id: 'builder', label: 'Workflow Builder', icon: Settings },
            { id: 'templates', label: 'Templates', icon: Code },
            { id: 'logs', label: 'Execution Logs', icon: FileText }
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
              {tab.id === 'tasks' && filteredTasks.filter(t => t.status === 'running').length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {filteredTasks.filter(t => t.status === 'running').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search tasks..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'running', label: 'Running' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'scheduled', label: 'Scheduled' }
                ]}
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
                placeholder="Filter by status"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'content-generation', label: 'Content Generation' },
                  { value: 'technical-audit', label: 'Technical Audit' },
                  { value: 'keyword-tracking', label: 'Keyword Tracking' },
                  { value: 'reporting', label: 'Reporting' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by type"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" icon={RefreshCw}>
                Refresh
              </Button>
              <Button variant="outline" icon={Download}>
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                      {getTypeIcon(task.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-600">{clients.find(c => c.id === task.clientId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status === 'running' && <RefreshCw className="h-3 w-3 inline mr-1 animate-spin" />}
                      {task.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{task.description}</p>

                {task.status === 'running' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Schedule</div>
                    <div className="font-semibold capitalize">{task.schedule.frequency}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold">{task.actualDuration || task.estimatedDuration}</div>
                  </div>
                </div>

                {task.results && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Success</div>
                      <div className="font-semibold text-green-600">{task.results.success}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Failed</div>
                      <div className="font-semibold text-red-600">{task.results.failed}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-semibold">{task.results.total}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {task.schedule.nextRun && (
                      <>Next run: {task.schedule.nextRun.toLocaleDateString()}</>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status === 'running' ? (
                      <Button size="sm" variant="outline" icon={Pause}>
                        Pause
                      </Button>
                    ) : task.status === 'paused' ? (
                      <Button size="sm" variant="primary" icon={Play}>
                        Resume
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" icon={Play}>
                        Run Now
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" icon={Settings}>
                      Configure
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Builder Tab */}
      {activeTab === 'builder' && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <Settings className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Workflow Builder</h3>
              <p className="text-gray-600">
                Create custom automation workflows by connecting different SEO actions
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Start Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Globe className="h-6 w-6 mb-2" />
                  <span className="text-sm">Technical Audit</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Content Generation</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Performance Report</span>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Available Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Site Crawl', icon: Globe, description: 'Crawl website for issues' },
                    { name: 'Keyword Research', icon: Search, description: 'Find keyword opportunities' },
                    { name: 'Content Analysis', icon: FileText, description: 'Analyze content quality' },
                    { name: 'Performance Check', icon: Zap, description: 'Check Core Web Vitals' },
                    { name: 'Competitor Analysis', icon: Users, description: 'Monitor competitors' },
                    { name: 'Generate Report', icon: BarChart3, description: 'Create performance report' },
                    { name: 'Send Alert', icon: AlertTriangle, description: 'Send notifications' },
                    { name: 'Update Database', icon: RefreshCw, description: 'Store results' }
                  ].map((action, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <action.icon className="h-6 w-6 text-primary-500 mb-2" />
                      <h5 className="font-medium text-gray-900 text-sm">{action.name}</h5>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" icon={Plus}>
                  Start Building Workflow
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
              <h3 className="text-lg font-semibold text-gray-900">Workflow Templates</h3>
              <p className="text-gray-600">Pre-built automation workflows for common SEO tasks</p>
            </div>
            <Button icon={Upload}>
              Import Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.complexity === 'simple' ? 'bg-green-100 text-green-600' :
                    template.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {template.complexity}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Workflow Steps
                  </div>
                  <div className="flex items-center space-x-2">
                    {template.steps.map((step, index) => (
                      <React.Fragment key={step.id}>
                        <div className="flex items-center space-x-1">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            {step.type === 'action' && <Zap className="h-4 w-4 text-primary-600" />}
                            {step.type === 'trigger' && <Play className="h-4 w-4 text-primary-600" />}
                            {step.type === 'condition' && <Filter className="h-4 w-4 text-primary-600" />}
                            {step.type === 'delay' && <Clock className="h-4 w-4 text-primary-600" />}
                          </div>
                        </div>
                        {index < template.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Estimated Time</div>
                    <div className="font-semibold">{template.estimatedTime}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Usage Count</div>
                    <div className="font-semibold">{template.usageCount} times</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 capitalize">
                    Category: {template.category.replace('-', ' ')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" icon={Eye}>
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Execution Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search logs..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'success', label: 'Success' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'warning', label: 'Warning' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by status"
              />
              <Select
                options={[
                  { value: '24h', label: 'Last 24 hours' },
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' }
                ]}
                value="7d"
                onValueChange={() => {}}
                placeholder="Timeframe"
              />
            </div>
            <Button variant="outline" icon={Download}>
              Export Logs
            </Button>
          </div>

          <div className="space-y-4">
            {executionLogs.map((log) => {
              const task = automationTasks.find(t => t.id === log.taskId);
              return (
                <Card key={log.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getLogStatusIcon(log.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{log.message}</h4>
                        <p className="text-sm text-gray-600">{task?.name}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </div>
                  </div>

                  {log.details && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{log.details}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Execution time: {Math.floor(log.executionTime / 60)}m {log.executionTime % 60}s</span>
                      {log.resourcesUsed?.apiCalls && (
                        <span>API calls: {log.resourcesUsed.apiCalls}</span>
                      )}
                      {log.resourcesUsed?.credits && (
                        <span>Credits used: {log.resourcesUsed.credits}</span>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" icon={Eye}>
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Automation;