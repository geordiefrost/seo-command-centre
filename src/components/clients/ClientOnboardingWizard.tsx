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
  Bot
} from 'lucide-react';
import { Card, Button, Input, Select } from '../common';
import { useAppStore } from '../../store/appStore';
import { supabase } from '../../lib/supabase';
import FirecrawlService, { QuickCrawlInsights } from '../../services/integrations/FirecrawlService';
import { Client, ClientContact, ClientCompetitor, ClientBrandTerm } from '../../types';

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
    description: 'Tell us about your client',
    icon: Building
  },
  {
    id: 'website',
    title: 'Website & Domain',
    description: 'Website details and quick analysis',
    icon: Globe
  },
  {
    id: 'market',
    title: 'Market & Competitors',
    description: 'Target markets and competitors',
    icon: Target
  },
  {
    id: 'contacts',
    title: 'Contacts & Brand',
    description: 'Key contacts and brand terms',
    icon: Users
  },
  {
    id: 'complete',
    title: 'Complete Setup',
    description: 'Review and create client',
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
    contacts: [] as Array<{
      name: string;
      email: string;
      role: string;
      isPrimary: boolean;
    }>,
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

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    role: '',
    isPrimary: false
  });

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
    }
  };

  const handleQuickCrawl = async () => {
    if (!formData.websiteUrl) return;

    setIsCrawling(true);
    try {
      const insights = await FirecrawlService.quickCrawl(formData.websiteUrl);
      setCrawlInsights(insights);
    } catch (error) {
      console.error('Quick crawl failed:', error);
    } finally {
      setIsCrawling(false);
    }
  };

  const addContact = () => {
    if (newContact.name && newContact.email) {
      updateFormData('contacts', [...formData.contacts, newContact]);
      setNewContact({ name: '', email: '', role: '', isPrimary: false });
    }
  };

  const removeContact = (index: number) => {
    updateFormData('contacts', formData.contacts.filter((_, i) => i !== index));
  };

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

      // Insert contacts
      if (formData.contacts.length > 0) {
        const { error: contactsError } = await supabase
          .from('client_contacts')
          .insert(formData.contacts.map(contact => ({
            client_id: clientId,
            name: contact.name,
            email: contact.email,
            role: contact.role || null,
            is_primary: contact.isPrimary
          })));

        if (contactsError) throw contactsError;
      }

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
            crawl_type: 'quick',
            status: 'completed',
            pages_analyzed: 1,
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
              <Input
                placeholder="Optional GSC property ID"
                value={formData.searchConsolePropertyId}
                onChange={(e) => updateFormData('searchConsolePropertyId', e.target.value)}
              />
            </div>

            {formData.websiteUrl && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Website Analysis
                  </h4>
                  <Button
                    onClick={handleQuickCrawl}
                    disabled={isCrawling}
                    size="sm"
                    icon={isCrawling ? Loader2 : Bot}
                  >
                    {isCrawling ? 'Analyzing...' : 'Analyze Website'}
                  </Button>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Markets
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add target market (e.g., Australia, New Zealand)"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitors
              </label>
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

      case 'contacts':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Contacts
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    placeholder="Contact name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email address"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Role (optional)"
                    value={newContact.role}
                    onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))}
                  />
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newContact.isPrimary}
                        onChange={(e) => setNewContact(prev => ({ ...prev, isPrimary: e.target.checked }))}
                        className="mr-1"
                      />
                      <span className="text-sm">Primary</span>
                    </label>
                    <Button
                      type="button"
                      onClick={addContact}
                      size="sm"
                      icon={Plus}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                {formData.contacts.length > 0 && (
                  <div className="space-y-2">
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{contact.email}</span>
                          {contact.role && <span className="text-sm text-gray-500 ml-2">({contact.role})</span>}
                          {contact.isPrimary && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Terms
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add brand term"
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
                <h5 className="font-medium mb-2">Contacts & Brand</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Contacts:</span> {formData.contacts.length}</p>
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
      case 'contacts':
        return true; // Optional step
      case 'complete':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Onboarding</h1>
        <p className="text-gray-600">
          Add a new client with automated website analysis and setup
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 
                    ${isActive ? 'bg-primary-500 border-primary-500 text-white' : 
                      isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      'bg-gray-100 border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-primary-600 font-medium' : 
                    isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-gray-600">{STEPS[currentStep].description}</p>
        </div>

        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : prevStep}
          icon={currentStep === 0 ? X : ChevronLeft}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <div className="flex space-x-2">
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              icon={ChevronRight}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              icon={isSubmitting ? Loader2 : CheckCircle}
            >
              {isSubmitting 
                ? (initialData?.id ? 'Updating Client...' : 'Creating Client...') 
                : (initialData?.id ? 'Update Client' : 'Create Client')
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};