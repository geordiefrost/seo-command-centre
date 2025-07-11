import React, { useState } from 'react';
import { 
  FileText, 
  Target, 
  Users, 
  TrendingUp, 
  Hash, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Plus,
  X
} from 'lucide-react';
import { Card, Button, Select, Input } from '../../common';
import { useAppStore } from '../../../store/appStore';

interface ContentBriefProps {
  onSubmit: (brief: ContentBrief) => void;
  onCancel: () => void;
  initialData?: Partial<ContentBrief>;
}

interface ContentBrief {
  id?: string;
  clientId: string;
  title: string;
  contentType: 'blog-post' | 'landing-page' | 'guide' | 'case-study' | 'whitepaper' | 'video-script';
  targetAudience: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  contentGoal: 'awareness' | 'consideration' | 'conversion' | 'retention';
  wordCount: number;
  tone: 'professional' | 'conversational' | 'technical' | 'friendly' | 'authoritative';
  outline: string[];
  requirements: string[];
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  competitorUrls?: string[];
  internalLinks?: string[];
  externalLinks?: string[];
}

export const ContentBrief: React.FC<ContentBriefProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData = {} 
}) => {
  const { clients, selectedClientId } = useAppStore();
  const [brief, setBrief] = useState<ContentBrief>({
    clientId: selectedClientId || '',
    title: '',
    contentType: 'blog-post',
    targetAudience: '',
    primaryKeyword: '',
    secondaryKeywords: [],
    contentGoal: 'awareness',
    wordCount: 1000,
    tone: 'professional',
    outline: [''],
    requirements: [''],
    deadline: new Date(),
    priority: 'medium',
    notes: '',
    competitorUrls: [],
    internalLinks: [],
    externalLinks: [],
    ...initialData
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutlineItem, setNewOutlineItem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(brief);
  };

  const updateBrief = (field: keyof ContentBrief, value: any) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !brief.secondaryKeywords.includes(newKeyword.trim())) {
      updateBrief('secondaryKeywords', [...brief.secondaryKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateBrief('secondaryKeywords', brief.secondaryKeywords.filter(k => k !== keyword));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      updateBrief('requirements', [...brief.requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    updateBrief('requirements', brief.requirements.filter((_, i) => i !== index));
  };

  const addOutlineItem = () => {
    if (newOutlineItem.trim()) {
      updateBrief('outline', [...brief.outline, newOutlineItem.trim()]);
      setNewOutlineItem('');
    }
  };

  const removeOutlineItem = (index: number) => {
    updateBrief('outline', brief.outline.filter((_, i) => i !== index));
  };

  const updateOutlineItem = (index: number, value: string) => {
    const newOutline = [...brief.outline];
    newOutline[index] = value;
    updateBrief('outline', newOutline);
  };

  const getWordCountColor = (count: number) => {
    if (count < 300) return 'text-red-600';
    if (count < 800) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Brief</h2>
        <p className="text-gray-600">
          Create a detailed brief for AI-powered content generation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <Select
              options={clients.map(client => ({ value: client.id, label: client.name }))}
              value={brief.clientId}
              onValueChange={(value) => updateBrief('clientId', value)}
              placeholder="Select client"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <Select
              options={[
                { value: 'blog-post', label: 'Blog Post' },
                { value: 'landing-page', label: 'Landing Page' },
                { value: 'guide', label: 'Guide' },
                { value: 'case-study', label: 'Case Study' },
                { value: 'whitepaper', label: 'Whitepaper' },
                { value: 'video-script', label: 'Video Script' }
              ]}
              value={brief.contentType}
              onValueChange={(value) => updateBrief('contentType', value)}
              placeholder="Select content type"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Title
          </label>
          <Input
            placeholder="Enter the working title for your content"
            value={brief.title}
            onChange={(e) => updateBrief('title', e.target.value)}
            required
          />
        </div>

        {/* Target Audience & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <Input
              placeholder="e.g., Small business owners, Marketing professionals"
              value={brief.targetAudience}
              onChange={(e) => updateBrief('targetAudience', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Goal
            </label>
            <Select
              options={[
                { value: 'awareness', label: 'Awareness' },
                { value: 'consideration', label: 'Consideration' },
                { value: 'conversion', label: 'Conversion' },
                { value: 'retention', label: 'Retention' }
              ]}
              value={brief.contentGoal}
              onValueChange={(value) => updateBrief('contentGoal', value)}
              placeholder="Select content goal"
            />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Keyword
          </label>
          <Input
            placeholder="Main keyword to target"
            value={brief.primaryKeyword}
            onChange={(e) => updateBrief('primaryKeyword', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Keywords
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add secondary keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button
                type="button"
                onClick={addKeyword}
                size="sm"
                icon={Plus}
              >
                Add
              </Button>
            </div>
            {brief.secondaryKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {brief.secondaryKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Word Count
            </label>
            <Input
              type="number"
              min="100"
              max="10000"
              value={brief.wordCount}
              onChange={(e) => updateBrief('wordCount', parseInt(e.target.value))}
              required
            />
            <div className={`text-xs mt-1 ${getWordCountColor(brief.wordCount)}`}>
              {brief.wordCount < 300 ? 'Too short' : 
               brief.wordCount < 800 ? 'Good length' : 'Comprehensive'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <Select
              options={[
                { value: 'professional', label: 'Professional' },
                { value: 'conversational', label: 'Conversational' },
                { value: 'technical', label: 'Technical' },
                { value: 'friendly', label: 'Friendly' },
                { value: 'authoritative', label: 'Authoritative' }
              ]}
              value={brief.tone}
              onValueChange={(value) => updateBrief('tone', value)}
              placeholder="Select tone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
              value={brief.priority}
              onValueChange={(value) => updateBrief('priority', value)}
              placeholder="Select priority"
            />
          </div>
        </div>

        {/* Content Outline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Outline
          </label>
          <div className="space-y-2">
            {brief.outline.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                <Input
                  placeholder={`Outline item ${index + 1}`}
                  value={item}
                  onChange={(e) => updateOutlineItem(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOutlineItem(index)}
                  icon={X}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">{brief.outline.length + 1}.</span>
              <Input
                placeholder="Add outline item"
                value={newOutlineItem}
                onChange={(e) => setNewOutlineItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutlineItem())}
              />
              <Button
                type="button"
                onClick={addOutlineItem}
                size="sm"
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requirements
          </label>
          <div className="space-y-2">
            {brief.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <Input
                  placeholder={`Requirement ${index + 1}`}
                  value={req}
                  onChange={(e) => {
                    const newReqs = [...brief.requirements];
                    newReqs[index] = e.target.value;
                    updateBrief('requirements', newReqs);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                  icon={X}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="Add requirement"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button
                type="button"
                onClick={addRequirement}
                size="sm"
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <Input
            type="date"
            value={brief.deadline.toISOString().split('T')[0]}
            onChange={(e) => updateBrief('deadline', new Date(e.target.value))}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
            placeholder="Any additional context, style preferences, or specific instructions..."
            value={brief.notes}
            onChange={(e) => updateBrief('notes', e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Brief Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Content Type:</span>
              <span className="ml-2 text-blue-700 capitalize">{brief.contentType.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Word Count:</span>
              <span className="ml-2 text-blue-700">{brief.wordCount} words</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Target Keyword:</span>
              <span className="ml-2 text-blue-700">{brief.primaryKeyword}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Priority:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(brief.priority)}`}>
                {brief.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={FileText}
          >
            Create Content Brief
          </Button>
        </div>
      </form>
    </Card>
  );
};