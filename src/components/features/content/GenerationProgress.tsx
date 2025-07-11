import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  FileText, 
  Search, 
  Edit3,
  Eye,
  Download,
  Pause,
  Play,
  X
} from 'lucide-react';
import { Card, Button, ProgressBar } from '../../common';

interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  duration?: number;
  startTime?: Date;
  endTime?: Date;
  details?: string;
  error?: string;
}

interface GenerationProgressProps {
  taskId: string;
  title: string;
  type: 'blog-post' | 'landing-page' | 'guide' | 'case-study' | 'whitepaper' | 'video-script';
  onCancel: () => void;
  onComplete: (result: any) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  taskId,
  title,
  type,
  onCancel,
  onComplete,
  onPause,
  onResume
}) => {
  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: 'research',
      name: 'Keyword Research',
      description: 'Analyzing target keywords and search intent',
      status: 'pending'
    },
    {
      id: 'outline',
      name: 'Content Outline',
      description: 'Creating structured content outline',
      status: 'pending'
    },
    {
      id: 'content',
      name: 'Content Generation',
      description: 'Generating high-quality content',
      status: 'pending'
    },
    {
      id: 'optimization',
      name: 'SEO Optimization',
      description: 'Optimizing for search engines',
      status: 'pending'
    },
    {
      id: 'quality',
      name: 'Quality Check',
      description: 'Reviewing content quality and readability',
      status: 'pending'
    },
    {
      id: 'finalize',
      name: 'Finalization',
      description: 'Preparing final content for review',
      status: 'pending'
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [startTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const current = newSteps[currentStep];

        if (current && current.status === 'pending') {
          // Start current step
          current.status = 'in-progress';
          current.startTime = new Date();
        } else if (current && current.status === 'in-progress') {
          // Simulate step completion
          const elapsed = Date.now() - (current.startTime?.getTime() || 0);
          const stepDuration = getStepDuration(current.id);
          
          if (elapsed > stepDuration) {
            current.status = 'completed';
            current.endTime = new Date();
            current.duration = elapsed;
            
            if (currentStep < newSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              // All steps completed
              setIsRunning(false);
              setTimeout(() => {
                onComplete({
                  taskId,
                  title,
                  type,
                  content: generateMockContent(type),
                  steps: newSteps,
                  completedAt: new Date()
                });
              }, 1000);
            }
          }
        }

        return newSteps;
      });

      // Update progress
      const completedSteps = steps.filter(s => s.status === 'completed').length;
      const currentStepProgress = steps[currentStep]?.status === 'in-progress' ? 0.5 : 0;
      const totalProgress = (completedSteps + currentStepProgress) / steps.length * 100;
      setProgress(totalProgress);

      // Update estimated time remaining
      const elapsedTime = (Date.now() - startTime.getTime()) / 1000;
      const estimatedTotalTime = elapsedTime / (totalProgress / 100);
      setEstimatedTimeRemaining(Math.max(0, estimatedTotalTime - elapsedTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentStep, steps, startTime, onComplete, taskId, title, type]);

  const getStepDuration = (stepId: string): number => {
    const durations = {
      research: 8000,
      outline: 6000,
      content: 15000,
      optimization: 5000,
      quality: 4000,
      finalize: 3000
    };
    return durations[stepId as keyof typeof durations] || 5000;
  };

  const generateMockContent = (contentType: string) => {
    const mockContent = {
      'blog-post': {
        title: 'The Ultimate Guide to SEO Best Practices in 2024',
        content: 'This comprehensive guide covers all the essential SEO strategies...',
        wordCount: 2150,
        readabilityScore: 8.5,
        seoScore: 92
      },
      'landing-page': {
        title: 'Transform Your Business with Our SEO Solutions',
        content: 'Discover how our proven SEO strategies can boost your online presence...',
        wordCount: 850,
        readabilityScore: 9.2,
        seoScore: 95
      },
      'guide': {
        title: 'Complete Technical SEO Audit Checklist',
        content: 'Follow this step-by-step guide to perform a comprehensive technical SEO audit...',
        wordCount: 3200,
        readabilityScore: 7.8,
        seoScore: 89
      }
    };
    return mockContent[contentType as keyof typeof mockContent] || mockContent['blog-post'];
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause?.();
  };

  const handleResume = () => {
    setIsRunning(true);
    onResume?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const elapsedTime = (Date.now() - startTime.getTime()) / 1000;

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Content Generation in Progress
          </h2>
          <p className="text-gray-600">{title}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isRunning ? (
            <Button
              onClick={handlePause}
              variant="outline"
              icon={Pause}
              size="sm"
            >
              Pause
            </Button>
          ) : (
            <Button
              onClick={handleResume}
              variant="outline"
              icon={Play}
              size="sm"
            >
              Resume
            </Button>
          )}
          <Button
            onClick={onCancel}
            variant="outline"
            icon={X}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-primary-600">
              {Math.round(progress)}%
            </div>
            <div>
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-sm text-gray-500">
                {isRunning ? 'In Progress' : 'Paused'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Elapsed: {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-gray-500">
              Remaining: ~{formatTime(estimatedTimeRemaining)}
            </div>
          </div>
        </div>
        <ProgressBar value={progress} className="h-3" />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border ${getStatusColor(step.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(step.status)}
                <div>
                  <h4 className="font-semibold text-gray-900">{step.name}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
              <div className="text-right">
                {step.status === 'completed' && step.duration && (
                  <div className="text-sm text-gray-500">
                    {formatTime(step.duration / 1000)}
                  </div>
                )}
                {step.status === 'in-progress' && (
                  <div className="text-sm text-blue-600 font-medium">
                    Processing...
                  </div>
                )}
              </div>
            </div>
            
            {step.status === 'in-progress' && (
              <div className="mt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span>
                    {step.id === 'research' && 'Analyzing keyword difficulty and search volume...'}
                    {step.id === 'outline' && 'Creating structured content sections...'}
                    {step.id === 'content' && 'Generating high-quality, original content...'}
                    {step.id === 'optimization' && 'Optimizing for target keywords...'}
                    {step.id === 'quality' && 'Checking readability and quality metrics...'}
                    {step.id === 'finalize' && 'Preparing final content for review...'}
                  </span>
                </div>
              </div>
            )}

            {step.status === 'completed' && step.details && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">{step.details}</p>
              </div>
            )}

            {step.status === 'failed' && step.error && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">{step.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Real-time Updates */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Live Updates</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>API connections established</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Processing with GPT-4 model</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Quality checks in progress</span>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.floor(Math.random() * 50) + 20}
          </div>
          <div className="text-sm text-gray-600">API Calls</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.floor(Math.random() * 10) + 5}
          </div>
          <div className="text-sm text-gray-600">Credits Used</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.floor(Math.random() * 100) + 200}
          </div>
          <div className="text-sm text-gray-600">Tokens</div>
        </div>
      </div>
    </Card>
  );
};