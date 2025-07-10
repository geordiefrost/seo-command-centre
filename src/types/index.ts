export interface Client {
  id: string;
  name: string;
  industry: string;
  type: 'retainer' | 'project';
  status: 'active' | 'paused' | 'archived';
  websiteUrl: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  clientId: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  color: string;
  applicableTo: ('retainer' | 'project')[];
  route: string;
  permissions?: string[];
}

export interface Integration {
  id: string;
  name: string;
  type: 'data' | 'automation' | 'reporting';
  status: 'connected' | 'error' | 'disconnected';
  lastSync?: Date;
  config?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    slack: boolean;
    browser: boolean;
  };
  defaultClientId?: string;
}

export enum TaskType {
  CONTENT_GENERATION = 'content_generation',
  MIGRATION_ANALYSIS = 'migration_analysis',
  TECHNICAL_AUDIT = 'technical_audit',
  COMPETITOR_ANALYSIS = 'competitor_analysis',
  STRATEGY_GENERATION = 'strategy_generation',
  MONITORING = 'monitoring',
  INTERNAL_LINKING = 'internal_linking',
  SCHEMA_GENERATION = 'schema_generation',
  REPORTING = 'reporting',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ToolCategory {
  STRATEGY = 'strategy',
  CONTENT = 'content',
  MIGRATION = 'migration',
  MONITORING = 'monitoring',
  COMPETITIVE = 'competitive',
  AUDIT = 'audit',
  AUTOMATION = 'automation',
}

export enum UserRole {
  COORDINATOR = 'coordinator',
  EXECUTIVE = 'executive',
  SENIOR_EXECUTIVE = 'senior_executive',
  HEAD_OF_SEARCH = 'head_of_search',
  ADMIN = 'admin',
}

export interface TaskFilters {
  status?: TaskStatus[];
  type?: TaskType[];
  priority?: string[];
  clientId?: string;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: number[];
  competition: 'low' | 'medium' | 'high';
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
}

export interface SERPAnalysis {
  keyword: string;
  position: number;
  url: string;
  title: string;
  description: string;
  features: string[];
  competitors: CompetitorRanking[];
}

export interface CompetitorRanking {
  domain: string;
  position: number;
  url: string;
  title: string;
  description: string;
}

export interface CrawlResult {
  url: string;
  status: number;
  title?: string;
  metaDescription?: string;
  h1?: string;
  wordCount?: number;
  issues: TechnicalIssue[];
  loadTime: number;
  timestamp: Date;
}

export interface TechnicalIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  impact: string;
  recommendation: string;
  priority: number;
}

export interface ContentBrief {
  title: string;
  keywords: string[];
  contentType: 'blog' | 'page' | 'product' | 'service' | 'guide';
  wordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
  audience: string;
  purpose: string;
  outline?: string[];
  references?: string[];
}

export interface GeneratedContent {
  id: string;
  brief: ContentBrief;
  title: string;
  content: string;
  excerpt: string;
  seoScore: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  status: 'draft' | 'review' | 'approved' | 'published';
  generatedAt: Date;
  updatedAt: Date;
}

export interface MigrationAnalysis {
  currentUrl: string;
  newUrl: string;
  recommendation: 'keep' | 'consolidate' | 'remove';
  traffic: number;
  conversions: number;
  keywords: string[];
  backlinks: number;
  pageValue: number;
  reasons: string[];
}

export interface SitemapNode {
  id: string;
  url: string;
  title: string;
  parentId?: string;
  children: SitemapNode[];
  level: number;
  priority: number;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export interface Redirect {
  source: string;
  target: string;
  type: 301 | 302 | 410;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Strategy {
  id: string;
  clientId: string;
  title: string;
  description: string;
  timeframe: '3months' | '6months' | '12months';
  recommendations: Recommendation[];
  kpis: KPI[];
  timeline: TimelineItem[];
  createdAt: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  category: string;
  estimatedTraffic: string;
  estimatedRevenue?: string;
  timeToComplete: string;
  prerequisites: string[];
  resources: string[];
}

export interface KPI {
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  timeframe: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  assignee?: string;
  dependencies: string[];
}

export interface CompetitorProfile {
  id: string;
  domain: string;
  name: string;
  industry: string;
  traffic: number;
  keywords: number;
  backlinks: number;
  domainRating: number;
  lastUpdated: Date;
  changes: CompetitorChange[];
}

export interface CompetitorChange {
  id: string;
  type: 'content' | 'ranking' | 'technical' | 'backlink';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  detected: Date;
  url?: string;
  keywords?: string[];
}

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  config: Record<string, any>;
  status: 'active' | 'paused' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  results: TaskResult[];
}

export interface TaskResult {
  id: string;
  taskId: string;
  status: TaskStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: any;
  error?: string;
  logs: string[];
}

export interface IntegrationStatus {
  service: string;
  connected: boolean;
  lastSync?: Date;
  error?: string;
  usage?: {
    requests: number;
    limit: number;
    resetDate: Date;
  };
  config?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface DashboardMetrics {
  activeTasks: number;
  completedTasks: number;
  contentGenerated: number;
  issuesDetected: number;
  timeSaved: number;
  clientHealth: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  destination: 'download' | 'google_drive' | 'google_docs' | 'google_sheets';
  template?: string;
  sharing?: {
    emails: string[];
    permissions: 'view' | 'edit' | 'comment';
  };
}