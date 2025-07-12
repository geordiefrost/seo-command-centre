import React, { useState } from 'react';
import { 
  Building, 
  Globe, 
  Users, 
  MapPin, 
  Target, 
  Search, 
  Mail, 
  Plus, 
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Zap,
  Bot,
  HelpCircle,
  Info
} from 'lucide-react';
import { Card, Button, Input, Select } from '../common';
import { useAppStore } from '../../store/appStore';
import { supabase } from '../../lib/supabase';
import FirecrawlService, { QuickCrawlInsights } from '../../services/integrations/FirecrawlService';
import GoogleOAuthService from '../../services/integrations/GoogleOAuthService';
import { Client, ClientCompetitor, ClientBrandTerm } from '../../types';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Company details and business model',
    icon: Building
  },
  {
    id: 'website',
    title: 'Website Analysis',
    description: 'Website URL and 20-page SEO analysis',
    icon: Globe
  },
  {
    id: 'market',
    title: 'Audience and Competitors',
    description: 'Target markets and competitor analysis',
    icon: Target
  },
  {
    id: 'brand',
    title: 'Brand Terms (Optional)',
    description: 'Brand terms for keyword research',
    icon: Search
  },
  {
    id: 'complete',
    title: 'Complete Setup',
    description: 'Review and create client profile',
    icon: CheckCircle
  }
];

interface ClientOnboardingWizardProps {
  onComplete: (client: Client) => void;
  onCancel: () => void;
  initialData?: Partial<Client>;
}

export const ClientOnboardingWizard: React.FC<ClientOnboardingWizardProps> = ({ 
  onComplete, 
  onCancel,
  initialData
}) => {
  const { addClient } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crawlInsights, setCrawlInsights] = useState<QuickCrawlInsights | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(GoogleOAuthService.isAuthenticated());
  const [availableGSCProperties, setAvailableGSCProperties] = useState<Array<{value: string, label: string}>>([]);
  const [isLoadingGSCProperties, setIsLoadingGSCProperties] = useState(false);
  const [gscLookupStatus, setGscLookupStatus] = useState<'none' | 'loading' | 'found' | 'not-found' | 'error'>('none');
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [gscError, setGscError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    industry: initialData?.industry || '',
    type: (initialData?.type || 'retainer') as 'retainer' | 'project',
    status: (initialData?.status || 'active') as 'active' | 'paused' | 'archived',
    websiteUrl: initialData?.websiteUrl || '',
    domain: initialData?.domain || '',
    businessType: (initialData?.businessType || 'B2B') as 'B2B' | 'B2C' | 'Local' | 'E-commerce',
    primaryLocation: initialData?.primaryLocation || 'Australia',
    targetMarkets: initialData?.targetMarkets || [],
    acceloCompanyId: initialData?.acceloCompanyId || '',
    searchConsolePropertyId: initialData?.searchConsolePropertyId || '',
    notes: initialData?.notes || '',
    
    // Additional data
    competitors: [] as Array<{
      domain: string;
      name: string;
      priority: number;
    }>,
    brandTerms: [] as Array<{
      term: string;
      isRegex: boolean;
    }>
  });

  // Removed contact management

  const [newCompetitor, setNewCompetitor] = useState({
    domain: '',
    name: '',
    priority: 1
  });

  const [newBrandTerm, setNewBrandTerm] = useState({
    term: '',
    isRegex: false
  });

  const [newMarket, setNewMarket] = useState('');

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const extractDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const handleWebsiteChange = (url: string) => {
    updateFormData('websiteUrl', url);
    if (url) {
      const domain = extractDomainFromUrl(url);
      updateFormData('domain', domain);
      // Reset GSC lookup status when URL changes
      setGscLookupStatus('none');
      setGscError(null);
    }
  };

  const handleGSCLookup = async () => {
    if (!formData.domain) return;
    
    setGscLookupStatus('loading');
    setGscError(null);
    
    try {
      if (!isGoogleAuthenticated) {
        await GoogleOAuthService.initiateOAuth();
        setIsGoogleAuthenticated(true);
      }
      
      const gscProperty = await GoogleOAuthService.findPropertyForDomain(formData.domain);
      if (gscProperty) {
        updateFormData('searchConsolePropertyId', gscProperty);
        setGscLookupStatus('found');
      } else {
        setGscLookupStatus('not-found');
      }
    } catch (error) {
      console.error('GSC property lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGscError(errorMessage);
      setGscLookupStatus('error');
    }
  };

  const handleQuickCrawl = async () => {
    if (!formData.websiteUrl) return;

    setIsCrawling(true);
    setCrawlError(null);
    setCrawlInsights(null);
    
    try {
      console.log('Starting website crawl:', formData.websiteUrl);
      
      // Use fullCrawl with 20 page limit instead of quickCrawl (1 page)
      const results = await FirecrawlService.fullCrawl(formData.websiteUrl, { maxPages: 20 });
      
      // Convert full crawl results to insights format
      const insights = FirecrawlService.convertCrawlToInsights(results);
      setCrawlInsights(insights);
      
      console.log('Website crawl completed successfully:', {
        pagesAnalyzed: insights.pagesAnalyzed,
        seoScore: insights.seoScore
      });
    } catch (error) {
      console.error('Website crawl failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCrawlError(errorMessage);
    } finally {
      setIsCrawling(false);
    }
  };

  // Contact management removed - no longer needed

  const addCompetitor = () => {
    if (newCompetitor.domain) {
      updateFormData('competitors', [...formData.competitors, newCompetitor]);
      setNewCompetitor({ domain: '', name: '', priority: 1 });
    }
  };

  const removeCompetitor = (index: number) => {
    updateFormData('competitors', formData.competitors.filter((_, i) => i !== index));
  };

  const addBrandTerm = () => {
    if (newBrandTerm.term) {
      updateFormData('brandTerms', [...formData.brandTerms, newBrandTerm]);
      setNewBrandTerm({ term: '', isRegex: false });
    }
  };

  const removeBrandTerm = (index: number) => {
    updateFormData('brandTerms', formData.brandTerms.filter((_, i) => i !== index));
  };

  const addMarket = () => {
    if (newMarket && !formData.targetMarkets.includes(newMarket)) {
      updateFormData('targetMarkets', [...formData.targetMarkets, newMarket]);
      setNewMarket('');
    }
  };

  const removeMarket = (market: string) => {
    updateFormData('targetMarkets', formData.targetMarkets.filter(m => m !== market));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let clientData;
      let clientId;

      if (initialData?.id) {
        // Update existing client
        const { data: updatedData, error: updateError } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            industry: formData.industry,
            type: formData.type,
            status: formData.status,
            website_url: formData.websiteUrl,
            domain: formData.domain,
            business_type: formData.businessType,
            primary_location: formData.primaryLocation,
            target_markets: formData.targetMarkets,
            accelo_company_id: formData.acceloCompanyId || null,
            search_console_property_id: formData.searchConsolePropertyId || null,
            notes: formData.notes || null
          })
          .eq('id', initialData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        clientData = updatedData;
        clientId = initialData.id;
      } else {
        // Insert new client
        const { data: insertedData, error: insertError } = await supabase
          .from('clients')
          .insert([{
            name: formData.name,
            industry: formData.industry,
            type: formData.type,
            status: formData.status,
            website_url: formData.websiteUrl,
            domain: formData.domain,
            business_type: formData.businessType,
            primary_location: formData.primaryLocation,
            target_markets: formData.targetMarkets,
            accelo_company_id: formData.acceloCompanyId || null,
            search_console_property_id: formData.searchConsolePropertyId || null,
            notes: formData.notes || null
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        clientData = insertedData;
        clientId = clientData.id;
      }

      // Removed contact insertion - contacts no longer collected

      // Insert competitors
      if (formData.competitors.length > 0) {
        const { error: competitorsError } = await supabase
          .from('client_competitors')
          .insert(formData.competitors.map(competitor => ({
            client_id: clientId,
            competitor_domain: competitor.domain,
            competitor_name: competitor.name || null,
            priority: competitor.priority
          })));

        if (competitorsError) throw competitorsError;
      }

      // Insert brand terms
      if (formData.brandTerms.length > 0) {
        const { error: brandTermsError } = await supabase
          .from('client_brand_terms')
          .insert(formData.brandTerms.map(term => ({
            client_id: clientId,
            term: term.term,
            is_regex: term.isRegex
          })));

        if (brandTermsError) throw brandTermsError;
      }

      // Insert crawl data if available
      if (crawlInsights) {
        const { error: crawlError } = await supabase
          .from('client_crawl_data')
          .insert([{
            client_id: clientId,
            crawl_type: 'full',
            status: 'completed',
            pages_analyzed: crawlInsights.pagesAnalyzed || 20,
            insights: crawlInsights
          }]);

        if (crawlError) throw crawlError;
      }

      // Create client object for local state
      const finalClient: Client = {
        id: clientId,
        name: formData.name,
        industry: formData.industry,
        type: formData.type,
        status: formData.status,
        websiteUrl: formData.websiteUrl,
        domain: formData.domain,
        businessType: formData.businessType,
        primaryLocation: formData.primaryLocation,
        targetMarkets: formData.targetMarkets,
        acceloCompanyId: formData.acceloCompanyId || undefined,
        searchConsolePropertyId: formData.searchConsolePropertyId || undefined,
        notes: formData.notes || undefined,
        createdAt: new Date(clientData.created_at)
      };

      onComplete(finalClient);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <Input
                  placeholder="Enter client name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <Input
                  placeholder="e.g., Technology, Healthcare, Finance"
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagement Type
                </label>
                <Select
                  options={[
                    { value: 'retainer', label: 'Retainer' },
                    { value: 'project', label: 'Project' }
                  ]}
                  value={formData.type}
                  onValueChange={(value) => updateFormData('type', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <Select
                  options={[
                    { value: 'B2B', label: 'B2B' },
                    { value: 'B2C', label: 'B2C' },
                    { value: 'Local', label: 'Local Business' },
                    { value: 'E-commerce', label: 'E-commerce' }
                  ]}
                  value={formData.businessType}
                  onValueChange={(value) => updateFormData('businessType', value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accelo Company ID
                </label>
                <Input
                  placeholder="Optional Accelo integration ID"
                  value={formData.acceloCompanyId}
                  onChange={(e) => updateFormData('acceloCompanyId', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Location
                </label>
                <Input
                  placeholder="e.g., Australia, Sydney, Melbourne"
                  value={formData.primaryLocation}
                  onChange={(e) => updateFormData('primaryLocation', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Any additional notes about the client..."
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
              />
            </div>
          </div>
        );

      case 'website':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL *
              </label>
              <Input
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={(e) => handleWebsiteChange(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <Input
                placeholder="Automatically extracted from URL"
                value={formData.domain}
                onChange={(e) => updateFormData('domain', e.target.value)}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Search Console Property ID
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="Optional - use lookup button to find automatically"
                  value={formData.searchConsolePropertyId}
                  onChange={(e) => updateFormData('searchConsolePropertyId', e.target.value)}
                />
                
                {formData.domain && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGSCLookup}
                      disabled={gscLookupStatus === 'loading'}
                      icon={gscLookupStatus === 'loading' ? Loader2 : Search}
                    >
                      {gscLookupStatus === 'loading' ? 'Looking up...' : 'Lookup GSC Property'}
                    </Button>
                    
                    {gscLookupStatus === 'found' && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Found and filled!
                      </div>
                    )}
                    
                    {gscLookupStatus === 'not-found' && (
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        No GSC property found
                      </div>
                    )}
                    
                    {gscLookupStatus === 'error' && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        Lookup failed
                      </div>
                    )}
                  </div>
                )}
                
                {gscError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <div className="font-medium mb-1">GSC Lookup Error:</div>
                    <div className="text-xs font-mono">{gscError}</div>
                  </div>
                )}
              </div>
            </div>

            {formData.websiteUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Quick Website Analysis</h4>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Get comprehensive SEO insights from your client's website - page titles, meta descriptions, 
                  content analysis, and technical SEO recommendations. This analyzes up to 20 pages of the website.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleQuickCrawl}
                    disabled={isCrawling}
                    size="sm"
                    icon={isCrawling ? Loader2 : Bot}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isCrawling ? 'Analyzing Website (20 pages)...' : 'Analyze Website (20 pages)'}
                  </Button>
                  <span className="text-xs text-blue-600">Takes 30-60 seconds</span>
                </div>

                {crawlInsights && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">SEO Score:</span>
                        <span className={`ml-2 ${crawlInsights.seoScore >= 80 ? 'text-green-600' : 
                          crawlInsights.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {crawlInsights.seoScore}/100
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Words:</span>
                        <span className="ml-2 text-blue-600">{crawlInsights.wordCount}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Tech:</span>
                        <span className="ml-2 text-blue-600">
                          {crawlInsights.techStack.join(', ') || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Images:</span>
                        <span className="ml-2 text-blue-600">{crawlInsights.imageCount}</span>
                      </div>
                    </div>

                    {crawlInsights.issues.length > 0 && (
                      <div>
                        <h5 className="font-medium text-orange-800 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Issues Found
                        </h5>
                        <ul className="text-sm text-orange-700 space-y-1">
                          {crawlInsights.issues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'market':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Target Audience Segments
                </label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Specific geographic areas, demographics, or market segments your client wants to target. 
                    This helps with local SEO and content strategy. Different from business model (B2B/B2C) above.
                    <div className="mt-2 text-gray-300">
                      <strong>Examples:</strong> "Sydney CBD professionals", "Melbourne families", "National tech startups", "Brisbane healthcare"  
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="e.g., Sydney CBD professionals, Melbourne families, National B2B tech companies"
                    value={newMarket}
                    onChange={(e) => setNewMarket(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMarket())}
                  />
                  <Button
                    type="button"
                    onClick={addMarket}
                    size="sm"
                    icon={Plus}
                  >
                    Add
                  </Button>
                </div>
                {formData.targetMarkets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.targetMarkets.map((market, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {market}
                        <button
                          type="button"
                          onClick={() => removeMarket(market)}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Main Competitors
                </label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Top 3-5 competitors in your client's space. We'll use these for competitive keyword analysis and benchmarking.
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Competitor domain"
                    value={newCompetitor.domain}
                    onChange={(e) => setNewCompetitor(prev => ({ ...prev, domain: e.target.value }))}
                  />
                  <Input
                    placeholder="Competitor name (optional)"
                    value={newCompetitor.name}
                    onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="flex items-center space-x-2">
                    <Select
                      options={[
                        { value: '1', label: 'Priority 1' },
                        { value: '2', label: 'Priority 2' },
                        { value: '3', label: 'Priority 3' },
                        { value: '4', label: 'Priority 4' },
                        { value: '5', label: 'Priority 5' }
                      ]}
                      value={newCompetitor.priority.toString()}
                      onValueChange={(value) => setNewCompetitor(prev => ({ ...prev, priority: parseInt(value) }))}
                    />
                    <Button
                      type="button"
                      onClick={addCompetitor}
                      size="sm"
                      icon={Plus}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                {formData.competitors.length > 0 && (
                  <div className="space-y-2">
                    {formData.competitors.map((competitor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{competitor.name || competitor.domain}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            Priority {competitor.priority}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCompetitor(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'brand':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Optional: Brand Terms</h3>
              </div>
              <p className="text-sm text-gray-600">
                Brand terms help us exclude branded traffic from competitive analysis and identify opportunities 
                for non-branded keyword research. You can add these later or skip this step entirely.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Brand Terms
                </label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Company name variations and branded terms. Helps exclude branded traffic from competitive analysis.
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="e.g., techcorp, tech corp, techcorp australia"
                    value={newBrandTerm.term}
                    onChange={(e) => setNewBrandTerm(prev => ({ ...prev, term: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBrandTerm())}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newBrandTerm.isRegex}
                      onChange={(e) => setNewBrandTerm(prev => ({ ...prev, isRegex: e.target.checked }))}
                      className="mr-1"
                    />
                    <span className="text-sm">Regex</span>
                  </label>
                  <Button
                    type="button"
                    onClick={addBrandTerm}
                    size="sm"
                    icon={Plus}
                  >
                    Add
                  </Button>
                </div>
                {formData.brandTerms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.brandTerms.map((term, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        {term.term}
                        {term.isRegex && <span className="ml-1 text-xs">(regex)</span>}
                        <button
                          type="button"
                          onClick={() => removeBrandTerm(index)}
                          className="ml-2 hover:text-purple-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Ready to Create Client
              </h4>
              <p className="text-green-700">
                Review the information below and click "Create Client" to complete the setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Basic Information</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.name}</p>
                  <p><span className="font-medium">Industry:</span> {formData.industry}</p>
                  <p><span className="font-medium">Type:</span> {formData.type}</p>
                  <p><span className="font-medium">Business:</span> {formData.businessType}</p>
                  <p><span className="font-medium">Location:</span> {formData.primaryLocation}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Website & Domain</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Website:</span> {formData.websiteUrl}</p>
                  <p><span className="font-medium">Domain:</span> {formData.domain}</p>
                  {crawlInsights && (
                    <p><span className="font-medium">SEO Score:</span> {crawlInsights.seoScore}/100</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Markets & Competitors</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Markets:</span> {formData.targetMarkets.join(', ')}</p>
                  <p><span className="font-medium">Competitors:</span> {formData.competitors.length}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Brand Terms</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Brand Terms:</span> {formData.brandTerms.length}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'basic':
        return formData.name && formData.industry;
      case 'website':
        return formData.websiteUrl && formData.domain;
      case 'market':
        return true; // Optional step
      case 'complete':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Client Onboarding</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Add a new client with automated website analysis and setup
          </p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto">

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 overflow-x-auto">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''} min-w-0`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 
                        ${isActive ? 'bg-primary-500 border-primary-500 text-white' : 
                          isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                          'bg-gray-100 border-gray-300 text-gray-400'}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-1 text-center hidden sm:block ${isActive ? 'text-primary-600 font-medium' : 
                        isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-4 sm:p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">{STEPS[currentStep].description}</p>
            </div>

            {renderStep()}
          </Card>
        </div>
      </div>

      {/* Navigation - Fixed at Bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : prevStep}
              icon={currentStep === 0 ? X : ChevronLeft}
              className="text-sm sm:text-base"
            >
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex space-x-2">
              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  icon={ChevronRight}
                  className="text-sm sm:text-base"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  icon={isSubmitting ? Loader2 : CheckCircle}
                  className="text-sm sm:text-base"
                >
                  {isSubmitting 
                    ? (initialData?.id ? 'Updating...' : 'Creating...') 
                    : (initialData?.id ? 'Update Client' : 'Create Client')
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};