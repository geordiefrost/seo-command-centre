import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  FileText,
  Lightbulb
} from 'lucide-react';
import { Button, Card, Select, Input } from '../../common';
import { useAppStore } from '../../../store/appStore';

interface StrategyWizardProps {
  onComplete: (strategy: any) => void;
  onCancel: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: string[];
}

const wizardSteps: WizardStep[] = [
  {
    id: 'business-goals',
    title: 'Business Goals',
    description: 'Define your primary business objectives',
    icon: Target,
    fields: ['primaryGoal', 'timeline', 'budget']
  },
  {
    id: 'target-audience',
    title: 'Target Audience',
    description: 'Identify your ideal customers',
    icon: Users,
    fields: ['demographics', 'interests', 'painPoints']
  },
  {
    id: 'competitive-landscape',
    title: 'Competitive Analysis',
    description: 'Analyze your competitive environment',
    icon: BarChart3,
    fields: ['mainCompetitors', 'competitiveAdvantage', 'marketPosition']
  },
  {
    id: 'content-strategy',
    title: 'Content Strategy',
    description: 'Plan your content approach',
    icon: FileText,
    fields: ['contentTypes', 'publishingFrequency', 'contentGoals']
  },
  {
    id: 'review-generate',
    title: 'Review & Generate',
    description: 'Review inputs and generate strategy',
    icon: Lightbulb,
    fields: []
  }
];

export const StrategyWizard: React.FC<StrategyWizardProps> = ({ onComplete, onCancel }) => {
  const { clients, selectedClientId } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    clientId: selectedClientId,
    primaryGoal: '',
    timeline: '',
    budget: '',
    demographics: '',
    interests: '',
    painPoints: '',
    mainCompetitors: '',
    competitiveAdvantage: '',
    marketPosition: '',
    contentTypes: '',
    publishingFrequency: '',
    contentGoals: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI strategy generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const generatedStrategy = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      title: `SEO Strategy for ${clients.find(c => c.id === formData.clientId)?.name}`,
      goals: formData.primaryGoal,
      timeline: formData.timeline,
      budget: formData.budget,
      targetAudience: {
        demographics: formData.demographics,
        interests: formData.interests,
        painPoints: formData.painPoints
      },
      competitiveAnalysis: {
        mainCompetitors: formData.mainCompetitors,
        advantage: formData.competitiveAdvantage,
        position: formData.marketPosition
      },
      contentStrategy: {
        types: formData.contentTypes,
        frequency: formData.publishingFrequency,
        goals: formData.contentGoals
      },
      recommendations: [
        {
          category: 'Technical SEO',
          priority: 'high',
          actions: ['Improve Core Web Vitals', 'Fix crawl errors', 'Optimize site structure']
        },
        {
          category: 'Content Strategy',
          priority: 'high',
          actions: ['Create topic clusters', 'Develop content calendar', 'Optimize existing content']
        },
        {
          category: 'Link Building',
          priority: 'medium',
          actions: ['Build industry partnerships', 'Create linkable assets', 'Guest posting campaign']
        }
      ],
      createdAt: new Date(),
      status: 'draft'
    };

    setIsGenerating(false);
    onComplete(generatedStrategy);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentStepData = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Strategy Generation Wizard</h2>
        <p className="text-gray-600">
          Follow these steps to generate a comprehensive SEO strategy
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {wizardSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep 
                  ? 'bg-primary-100 border-primary-500' 
                  : 'bg-gray-100 border-gray-300'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5 text-primary-600" />
                ) : (
                  <step.icon className={`h-5 w-5 ${
                    index <= currentStep ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                )}
              </div>
              {index < wizardSteps.length - 1 && (
                <div className={`w-20 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-primary-500' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <currentStepData.icon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>
        </div>

        {/* Step Forms */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Business Goal
                </label>
                <Select
                  options={[
                    { value: 'increase-traffic', label: 'Increase Organic Traffic' },
                    { value: 'improve-rankings', label: 'Improve Search Rankings' },
                    { value: 'generate-leads', label: 'Generate More Leads' },
                    { value: 'boost-sales', label: 'Boost Online Sales' },
                    { value: 'brand-awareness', label: 'Increase Brand Awareness' }
                  ]}
                  value={formData.primaryGoal}
                  onValueChange={(value) => updateFormData('primaryGoal', value)}
                  placeholder="Select primary goal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <Select
                  options={[
                    { value: '3-months', label: '3 Months' },
                    { value: '6-months', label: '6 Months' },
                    { value: '12-months', label: '12 Months' },
                    { value: '18-months', label: '18+ Months' }
                  ]}
                  value={formData.timeline}
                  onValueChange={(value) => updateFormData('timeline', value)}
                  placeholder="Select timeline"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Budget Range
                </label>
                <Select
                  options={[
                    { value: 'under-5k', label: 'Under $5,000' },
                    { value: '5k-10k', label: '$5,000 - $10,000' },
                    { value: '10k-25k', label: '$10,000 - $25,000' },
                    { value: '25k-50k', label: '$25,000 - $50,000' },
                    { value: 'over-50k', label: 'Over $50,000' }
                  ]}
                  value={formData.budget}
                  onValueChange={(value) => updateFormData('budget', value)}
                  placeholder="Select budget range"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Demographics
                </label>
                <Input
                  placeholder="e.g., Small business owners, 25-45 years old, Australia"
                  value={formData.demographics}
                  onChange={(e) => updateFormData('demographics', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests & Behaviors
                </label>
                <Input
                  placeholder="e.g., Technology adoption, cost-conscious, time-pressed"
                  value={formData.interests}
                  onChange={(e) => updateFormData('interests', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Points
                </label>
                <Input
                  placeholder="e.g., Complex accounting processes, compliance concerns"
                  value={formData.painPoints}
                  onChange={(e) => updateFormData('painPoints', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Competitors
                </label>
                <Input
                  placeholder="e.g., Xero, QuickBooks, MYOB"
                  value={formData.mainCompetitors}
                  onChange={(e) => updateFormData('mainCompetitors', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitive Advantage
                </label>
                <Input
                  placeholder="e.g., Local market expertise, specialized features"
                  value={formData.competitiveAdvantage}
                  onChange={(e) => updateFormData('competitiveAdvantage', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Position
                </label>
                <Select
                  options={[
                    { value: 'market-leader', label: 'Market Leader' },
                    { value: 'challenger', label: 'Challenger' },
                    { value: 'follower', label: 'Follower' },
                    { value: 'niche-player', label: 'Niche Player' }
                  ]}
                  value={formData.marketPosition}
                  onValueChange={(value) => updateFormData('marketPosition', value)}
                  placeholder="Select market position"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Types
                </label>
                <Input
                  placeholder="e.g., Blog posts, guides, case studies, videos"
                  value={formData.contentTypes}
                  onChange={(e) => updateFormData('contentTypes', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publishing Frequency
                </label>
                <Select
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'bi-weekly', label: 'Bi-weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                  value={formData.publishingFrequency}
                  onValueChange={(value) => updateFormData('publishingFrequency', value)}
                  placeholder="Select frequency"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Goals
                </label>
                <Input
                  placeholder="e.g., Increase brand awareness, generate leads, educate customers"
                  value={formData.contentGoals}
                  onChange={(e) => updateFormData('contentGoals', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Strategy Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Primary Goal:</span>
                    <span className="ml-2 text-blue-700">{formData.primaryGoal}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Timeline:</span>
                    <span className="ml-2 text-blue-700">{formData.timeline}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Budget:</span>
                    <span className="ml-2 text-blue-700">{formData.budget}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Market Position:</span>
                    <span className="ml-2 text-blue-700">{formData.marketPosition}</span>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    <span className="text-gray-600">Generating your SEO strategy...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              icon={ArrowLeft}
            >
              Back
            </Button>
          )}
        </div>

        <div>
          {isLastStep ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              icon={isGenerating ? undefined : Lightbulb}
            >
              {isGenerating ? 'Generating...' : 'Generate Strategy'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              icon={ArrowRight}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};