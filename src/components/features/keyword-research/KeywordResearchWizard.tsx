import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Calendar,
  FileText,
  Target,
  Search,
  Plus,
  X,
  Building,
  Globe,
  Loader2,
  Bot,
  Users,
  Download
} from 'lucide-react';
import { Card, Button, Input, Select } from '../../common';
import { useAppStore } from '../../../store/appStore';
import { supabase } from '../../../lib/supabase';
import GoogleOAuthService from '../../../services/integrations/GoogleOAuthService';
import DataForSEOService from '../../../services/integrations/DataForSEOService';
import { KeywordResultsTable } from './KeywordResultsTable';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface CompetitorData {
  id?: string;
  domain: string;
  name?: string;
  priority: number;
  isExisting: boolean;
}

interface KeywordData {
  keyword: string;
  searchVolume?: number;
  source: 'manual' | 'gsc' | 'competitor';
  competition?: string; // LOW, MEDIUM, HIGH
  cpc?: number;
  intent?: 'informational' | 'navigational' | 'transactional' | 'commercial';
  // GSC specific fields
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  // Cross-reference fields
  hasClientRanking?: boolean;
  // Priority scoring fields
  priorityScore?: number;
  priorityCategory?: 'quick-win' | 'position-boost' | 'new-opportunity' | 'long-term';
  opportunityType?: string;
}

const STEPS: WizardStep[] = [
  {
    id: 'setup',
    title: 'Project Setup',
    description: 'Basic project information and settings',
    icon: FileText
  },
  {
    id: 'seeds',
    title: 'Seed Keywords',
    description: 'Initial keywords and GSC data import',
    icon: Search
  },
  {
    id: 'competitors',
    title: 'Competitor Selection',
    description: 'Choose competitors for keyword analysis',
    icon: Target
  },
  {
    id: 'discovery',
    title: 'Keyword Discovery',
    description: 'Generate keywords from all sources',
    icon: Bot
  },
  {
    id: 'selection',
    title: 'Review Keywords',
    description: 'Review and remove unwanted keywords',
    icon: Users
  },
  {
    id: 'save',
    title: 'Save Project',
    description: 'Save selected keywords and project',
    icon: CheckCircle
  }
];

interface KeywordResearchWizardProps {
  clientId: string;
  onComplete: (savedProject: any) => void;
  onCancel: () => void;
  editingProject?: any;
}

export const KeywordResearchWizard: React.FC<KeywordResearchWizardProps> = ({
  clientId,
  onComplete,
  onCancel,
  editingProject
}) => {
  const { clients } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Form data
  const [projectData, setProjectData] = useState({
    name: editingProject?.name || '',
    description: editingProject?.description || ''
  });

  const [seedKeywords, setSeedKeywords] = useState<string[]>(
    editingProject?.settings?.seedKeywords || []
  );
  const [newSeedKeyword, setNewSeedKeyword] = useState('');
  const [gscKeywords, setGscKeywords] = useState<KeywordData[]>([]);
  const [isLoadingGSC, setIsLoadingGSC] = useState(false);

  const [existingCompetitors, setExistingCompetitors] = useState<CompetitorData[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<CompetitorData[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({ domain: '', name: '' });

  const [discoveredKeywords, setDiscoveredKeywords] = useState<KeywordData[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [keywordStats, setKeywordStats] = useState({
    total: 0,
    branded: 0,
    commercial: 0,
    informational: 0,
    quickWins: 0
  });

  const selectedClient = clients.find(c => c.id === clientId);

  // SEO-optimized priority scoring algorithm
  const calculatePriorityScore = (keyword: KeywordData): { score: number; category: string; opportunityType: string } => {
    let score = 0;
    let category = 'long-term';
    let opportunityType = 'Content Creation';
    
    // Position Improvement Potential (highest weight)
    let positionScore = 0;
    if (keyword.position) {
      if (keyword.position >= 11 && keyword.position <= 20) {
        positionScore = 3; // 🔥 Quick Win - Page 2 to Page 1
        category = 'quick-win';
        opportunityType = 'Page 1 Breakthrough';
      } else if (keyword.position >= 4 && keyword.position <= 10) {
        positionScore = 2; // ⚡ Position Boost - Page 1 improvement
        category = 'position-boost';
        opportunityType = 'Top 3 Position';
      } else if (keyword.position >= 1 && keyword.position <= 3) {
        positionScore = 1; // Already ranking well
        category = 'long-term';
        opportunityType = 'Maintain Ranking';
      }
    } else if (keyword.competition === 'LOW' && (keyword.searchVolume || 0) > 100) {
      positionScore = 1; // 🚀 New Opportunity
      category = 'new-opportunity';
      opportunityType = 'Ranking Opportunity';
    }
    
    // Volume Score
    let volumeScore = 0;
    const volume = keyword.searchVolume || 0;
    if (volume > 1000) volumeScore = 3;
    else if (volume >= 100) volumeScore = 2;
    else volumeScore = 1;
    
    // Competition Score
    let competitionScore = 0;
    if (keyword.competition === 'LOW') competitionScore = 3;
    else if (keyword.competition === 'MEDIUM') competitionScore = 2;
    else if (keyword.competition === 'HIGH') competitionScore = 1;
    else competitionScore = 1; // Default
    
    // Business Value Score (Intent)
    let businessScore = 0;
    if (keyword.intent === 'commercial' || keyword.intent === 'transactional') businessScore = 3;
    else if (keyword.intent === 'navigational') businessScore = 2;
    else businessScore = 1; // Informational
    
    // Calculate weighted score
    score = (
      positionScore * 3 + // Position improvement potential (highest weight)
      volumeScore * 2 +   // Volume
      competitionScore * 2 + // Competition advantage
      businessScore * 1   // Business value
    ) / 8;
    
    // Override category for high-value keywords
    if (score >= 2.5 && category === 'long-term') {
      category = 'quick-win';
    } else if (score >= 2.0 && category === 'long-term') {
      category = 'position-boost';
    }
    
    return { score: Math.round(score * 100) / 100, category, opportunityType };
  };

  useEffect(() => {
    loadExistingCompetitors();
  }, [clientId]);

  const loadExistingCompetitors = async () => {
    try {
      const { data, error } = await supabase
        .from('client_competitors')
        .select('*')
        .eq('client_id', clientId)
        .order('priority', { ascending: true });

      if (error) throw error;

      const competitors = data?.map(comp => ({
        id: comp.id,
        domain: comp.competitor_domain,
        name: comp.competitor_name || '',
        priority: comp.priority,
        isExisting: true
      })) || [];

      setExistingCompetitors(competitors);
    } catch (error) {
      console.error('Error loading competitors:', error);
    }
  };

  const handleAddSeedKeyword = () => {
    if (newSeedKeyword.trim() && !seedKeywords.includes(newSeedKeyword.trim())) {
      setSeedKeywords([...seedKeywords, newSeedKeyword.trim()]);
      setNewSeedKeyword('');
    }
  };

  const handleRemoveSeedKeyword = (keyword: string) => {
    setSeedKeywords(seedKeywords.filter(k => k !== keyword));
  };

  const handleRemoveGSCKeyword = (index: number) => {
    setGscKeywords(gscKeywords.filter((_, i) => i !== index));
  };

  const handleLoadGSCKeywords = async () => {
    setIsLoadingGSC(true);
    try {
      if (!GoogleOAuthService.isAuthenticated()) {
        await GoogleOAuthService.initiateOAuth();
      }

      // Load client brand terms for filtering
      let brandTerms: { term: string; isRegex: boolean }[] = [];
      if (selectedClient?.id) {
        try {
          const { data: brandData, error: brandError } = await supabase
            .from('client_brand_terms')
            .select('term, is_regex')
            .eq('client_id', selectedClient.id);
          
          if (brandError) {
            console.warn('Error loading brand terms:', brandError);
          } else {
            brandTerms = brandData?.map(bt => ({ term: bt.term, isRegex: bt.is_regex })) || [];
            console.log('Loaded brand terms for filtering:', brandTerms);
          }
        } catch (error) {
          console.warn('Failed to load brand terms:', error);
        }
      }

      // Get the client's assigned GSC property or auto-detect the best one
      let clientGSCProperty: string | undefined;
      
      // If client has domain, always use auto-detection to find the best working property
      // Extract domain from stored GSC property or website URL if domain field is missing
      const clientDomain = selectedClient?.domain || 
                          selectedClient?.searchConsolePropertyId?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
                          selectedClient?.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') ||
                          'bangdigital.com.au'; // Fallback for test client
      
      if (clientDomain) {
        console.log('Using auto-detection for domain:', clientDomain);
        
        const detectionResult = await GoogleOAuthService.detectPrimaryProperty(clientDomain);
        if (detectionResult.primaryProperty) {
          clientGSCProperty = detectionResult.primaryProperty;
          console.log('Auto-detected working GSC property:', {
            selectedProperty: clientGSCProperty,
            recommendedFormat: detectionResult.recommendedFormat,
            totalMatches: detectionResult.allMatches.length,
            validated: !!detectionResult.validatedProperty
          });
        } else {
          console.warn('No working GSC property found for domain:', clientDomain);
          // Fallback to stored property if auto-detection fails
          if (selectedClient?.searchConsolePropertyId) {
            clientGSCProperty = selectedClient.searchConsolePropertyId;
            console.log('Falling back to stored GSC property:', clientGSCProperty);
          }
        }
      } else if (selectedClient?.searchConsolePropertyId) {
        clientGSCProperty = selectedClient.searchConsolePropertyId;
        console.log('Using stored GSC property (no domain for auto-detection):', clientGSCProperty);
      } else {
        console.warn('No GSC property or domain available, using first available property');
      }

      // Get real GSC keyword data using client's specific property
      const gscData = await GoogleOAuthService.getSearchConsoleKeywords(
        clientGSCProperty, // Use client's specific property
        undefined, // startDate - use default (90 days ago)
        undefined, // endDate - use default (today)
        25 // rowLimit
      );
      
      console.log('GSC keyword data received:', {
        keywordCount: gscData.length,
        propertyUsed: clientGSCProperty || 'first_available',
        clientName: selectedClient?.name
      });
      
      // Transform GSC data to our KeywordData format
      const transformedKeywords: KeywordData[] = gscData.map(gscKeyword => ({
        keyword: gscKeyword.keyword,
        searchVolume: undefined, // GSC doesn't provide search volume
        source: 'gsc' as const,
        competition: undefined, // GSC doesn't provide competition data initially
        cpc: undefined,
        intent: gscKeyword.intent,
        // Additional GSC specific data
        clicks: gscKeyword.clicks,
        impressions: gscKeyword.impressions,
        ctr: gscKeyword.ctr,
        position: gscKeyword.position
      }));

      // Filter out brand keywords
      const filteredKeywords = transformedKeywords.filter(keyword => {
        const keywordLower = keyword.keyword.toLowerCase();
        
        for (const brandTerm of brandTerms) {
          if (brandTerm.isRegex) {
            try {
              const regex = new RegExp(brandTerm.term, 'i');
              if (regex.test(keyword.keyword)) {
                console.log(`Filtered brand keyword (regex): ${keyword.keyword} matches ${brandTerm.term}`);
                return false;
              }
            } catch (error) {
              console.warn(`Invalid regex pattern: ${brandTerm.term}`, error);
              // Fallback to simple string match
              if (keywordLower.includes(brandTerm.term.toLowerCase())) {
                console.log(`Filtered brand keyword (fallback): ${keyword.keyword} contains ${brandTerm.term}`);
                return false;
              }
            }
          } else {
            if (keywordLower.includes(brandTerm.term.toLowerCase())) {
              console.log(`Filtered brand keyword: ${keyword.keyword} contains ${brandTerm.term}`);
              return false;
            }
          }
        }
        return true;
      });

      console.log(`Brand filtering: ${transformedKeywords.length} → ${filteredKeywords.length} keywords (${transformedKeywords.length - filteredKeywords.length} branded filtered)`);
      setGscKeywords(filteredKeywords);
    } catch (error) {
      console.error('Error loading GSC keywords:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to load GSC keywords';
      alert(`GSC Import Error: ${errorMessage}`);
    } finally {
      setIsLoadingGSC(false);
    }
  };

  const handleCompetitorToggle = (competitor: CompetitorData) => {
    const isSelected = selectedCompetitors.some(c => 
      c.domain === competitor.domain
    );

    if (isSelected) {
      setSelectedCompetitors(selectedCompetitors.filter(c => 
        c.domain !== competitor.domain
      ));
    } else {
      setSelectedCompetitors([...selectedCompetitors, competitor]);
    }
  };

  const handleAddNewCompetitor = () => {
    if (newCompetitor.domain.trim()) {
      const competitor: CompetitorData = {
        domain: newCompetitor.domain.trim(),
        name: newCompetitor.name.trim(),
        priority: existingCompetitors.length + selectedCompetitors.length + 1,
        isExisting: false
      };

      setSelectedCompetitors([...selectedCompetitors, competitor]);
      setNewCompetitor({ domain: '', name: '' });
    }
  };

  const handleRemoveCompetitor = (domain: string) => {
    setSelectedCompetitors(selectedCompetitors.filter(c => c.domain !== domain));
  };

  const handleKeywordDiscovery = async () => {
    setIsProcessing(true);
    setProcessingStatus('Analyzing competitor keywords...');

    try {
      let allKeywords: KeywordData[] = [];

      // PHASE 1: COLLECT RAW KEYWORDS FROM ALL SOURCES
      
      // Add seed keywords (raw, no DataForSEO calls yet)
      setProcessingStatus('Collecting seed keywords...');
      allKeywords.push(...seedKeywords.map(keyword => ({
        keyword: keyword,
        source: 'manual' as const
      })));
      
      // Expand each seed keyword into related keyword suggestions
      setProcessingStatus('Expanding seed keywords into related suggestions...');
      for (const seedKeyword of seedKeywords) {
        try {
          console.log(`Expanding seed keyword: "${seedKeyword}"`);
          const suggestions = await DataForSEOService.getKeywordSuggestions(seedKeyword, 10);
          
          // Add expanded keywords (raw, no additional processing yet)
          const expandedKeywords = suggestions.map(suggestion => ({
            keyword: suggestion.keyword,
            source: 'manual' as const // Keep as manual but could be 'seed-expansion'
          }));
          
          allKeywords.push(...expandedKeywords);
          console.log(`Added ${expandedKeywords.length} expanded keywords from seed "${seedKeyword}"`);
        } catch (error) {
          console.warn(`Failed to expand seed keyword "${seedKeyword}":`, error);
        }
      }

      // Add GSC keywords (raw, preserve GSC data but no DataForSEO enrichment yet)
      setProcessingStatus('Collecting GSC keywords...');
      if (gscKeywords.length > 0) {
        allKeywords.push(...gscKeywords);
      }

      // Add competitor keywords (raw, no DataForSEO enrichment yet)
      setProcessingStatus('Collecting competitor keywords...');
      for (const competitor of selectedCompetitors) {
        try {
          const competitorKeywords = await DataForSEOService.getCompetitorRankings(competitor.domain);
          
          // Add raw competitor keywords without DataForSEO enrichment
          const competitorData = competitorKeywords.slice(0, 50).map((k: any) => ({
            keyword: k.keyword,
            source: 'competitor' as const
          }));

          allKeywords.push(...competitorData);
        } catch (error) {
          console.warn(`Failed to get keywords for ${competitor.domain}:`, error);
        }
      }

      // PHASE 2: BATCH DATAFORSEO ENRICHMENT FOR ALL KEYWORDS
      setProcessingStatus('Enriching all keywords with DataForSEO (Volume, Competition, CPC, Intent)...');
      
      // Remove duplicates before enrichment
      const uniqueKeywordMap = new Map();
      allKeywords.forEach(keyword => {
        const key = keyword.keyword.toLowerCase().trim();
        if (!uniqueKeywordMap.has(key)) {
          uniqueKeywordMap.set(key, keyword);
        }
      });
      
      const uniqueKeywords = Array.from(uniqueKeywordMap.values());
      const keywordStrings = uniqueKeywords.map(k => k.keyword);
      
      console.log(`🔄 Batch DataForSEO enrichment: processing ${keywordStrings.length} unique keywords`);
      
      try {
        // Batch process all keywords through DataForSEO
        const enrichedData = await DataForSEOService.getKeywordData(keywordStrings);
        
        // Create enrichment map
        const enrichmentMap = new Map();
        enrichedData.forEach(data => {
          enrichmentMap.set(data.keyword.toLowerCase().trim(), data);
        });
        
        // Apply enrichment to all keywords (preserving existing GSC data)
        allKeywords = uniqueKeywords.map(keyword => {
          const enrichment = enrichmentMap.get(keyword.keyword.toLowerCase().trim());
          
          return {
            ...keyword,
            // Preserve existing GSC data, supplement with DataForSEO
            searchVolume: enrichment?.searchVolume || keyword.searchVolume || 0,
            competition: enrichment?.competition || keyword.competition || 'UNKNOWN',
            cpc: enrichment?.cpc || keyword.cpc || 0,
            intent: enrichment?.intent || keyword.intent || 'informational',
            // Keep GSC performance data if it exists
            clicks: keyword.clicks,
            impressions: keyword.impressions,
            ctr: keyword.ctr,
            position: keyword.position
          };
        });
        
        console.log(`✅ DataForSEO enrichment complete: ${allKeywords.length} keywords enriched`);
      } catch (error) {
        console.warn('Failed to batch enrich keywords with DataForSEO:', error);
        // Continue with unenriched keywords
        allKeywords = uniqueKeywords;
      }

      // Final GSC cross-reference: Check ALL discovered keywords for client rankings
      setProcessingStatus('Cross-referencing all keywords with client GSC data...');
      
      if (allKeywords.length > 0 && selectedClient?.domain) {
        try {
          // Detect the correct GSC property for this client (same logic as initial call)
          let finalGSCProperty: string | undefined;
          const clientDomain = selectedClient?.domain || 
                              selectedClient?.searchConsolePropertyId?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
                              selectedClient?.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') ||
                              'bangdigital.com.au';
          
          console.log(`Final GSC cross-reference: detecting property for domain: ${clientDomain}`);
          const detectionResult = await GoogleOAuthService.detectPrimaryProperty(clientDomain);
          if (detectionResult.primaryProperty) {
            finalGSCProperty = detectionResult.primaryProperty;
            console.log(`✓ Final GSC property detected: ${finalGSCProperty}`);
          } else {
            console.warn('No working GSC property found for final cross-reference, using fallback');
            finalGSCProperty = selectedClient?.searchConsolePropertyId;
          }
          
          // Extract all unique keyword strings for GSC lookup
          const allKeywordStrings = [...new Set(allKeywords.map(k => k.keyword))];
          console.log(`Final GSC cross-reference: checking ${allKeywordStrings.length} unique keywords`);
          console.log('Sample keywords to check:', allKeywordStrings.slice(0, 10));
          
          // Make fresh GSC call using the correct client property
          const finalGSCResults = await GoogleOAuthService.getSearchConsoleKeywords(
            finalGSCProperty, // Use the client's detected property
            undefined, // Use default date range
            undefined,
            2000 // Get comprehensive results for final cross-reference
          );
          
          console.log(`Final GSC results: ${finalGSCResults.length} keywords from GSC`);
          console.log('Sample GSC keywords:', finalGSCResults.slice(0, 5).map(k => k.keyword));
          
          // Create comprehensive GSC keyword map
          const finalGSCMap = new Map();
          finalGSCResults.forEach(gscKeyword => {
            finalGSCMap.set(gscKeyword.keyword.toLowerCase().trim(), {
              clicks: gscKeyword.clicks,
              impressions: gscKeyword.impressions,
              ctr: gscKeyword.ctr,
              position: gscKeyword.position
            });
          });
          
          // Cross-reference ALL keywords (manual, competitor, initial GSC) with fresh GSC data
          let matchCount = 0;
          allKeywords = allKeywords.map(keyword => {
            const gscData = finalGSCMap.get(keyword.keyword.toLowerCase().trim());
            if (gscData) {
              matchCount++;
              console.log(`✓ GSC match found: "${keyword.keyword}" (${keyword.source}) - Position: ${gscData.position}, Clicks: ${gscData.clicks}`);
              return {
                ...keyword,
                clicks: gscData.clicks,
                impressions: gscData.impressions,
                ctr: gscData.ctr,
                position: gscData.position,
                hasClientRanking: true
              };
            }
            return keyword;
          });
          
          console.log(`✅ Final GSC cross-reference complete: ${matchCount} keywords matched with client rankings`);
        } catch (error) {
          console.warn('Failed to perform final GSC cross-reference:', error);
        }
      }
      
      // Apply priority scoring to all keywords
      setProcessingStatus('Calculating keyword priorities...');
      const keywordsWithPriority = allKeywords.map(keyword => {
        const priorityData = calculatePriorityScore(keyword);
        return {
          ...keyword,
          priorityScore: priorityData.score,
          priorityCategory: priorityData.category as 'quick-win' | 'position-boost' | 'new-opportunity' | 'long-term',
          opportunityType: priorityData.opportunityType
        };
      });
      
      // Sort by priority score (highest first)
      keywordsWithPriority.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

      setDiscoveredKeywords(keywordsWithPriority);

      // Calculate stats
      const branded = keywordsWithPriority.filter(k => 
        selectedClient?.name && k.keyword.toLowerCase().includes(selectedClient.name.toLowerCase())
      ).length;

      const commercial = keywordsWithPriority.filter(k => k.intent === 'commercial').length;
      const informational = keywordsWithPriority.filter(k => k.intent === 'informational').length;
      const quickWins = keywordsWithPriority.filter(k => 
        (k.searchVolume || 0) > 100 && k.competition === 'LOW'
      ).length;

      setKeywordStats({
        total: keywordsWithPriority.length,
        branded,
        commercial,
        informational,
        quickWins
      });

    } catch (error) {
      console.error('Error during keyword discovery:', error);
      alert('Failed to complete keyword discovery. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleSaveProject = async () => {
    setIsProcessing(true);
    setProcessingStatus('Saving project...');

    try {
      // Get current user (you may need to adjust this based on your auth setup)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create or update project
      const projectPayload = {
        client_id: clientId,
        name: projectData.name,
        description: projectData.description,
        status: 'completed',
        assigned_to: user?.email || null,
        settings: {
          seedKeywords,
          selectedCompetitors,
          gscImported: gscKeywords.length > 0
        }
      };

      let projectId = editingProject?.id;

      if (editingProject) {
        // Update existing project
        const { error: updateError } = await supabase
          .from('keyword_research_projects')
          .update(projectPayload)
          .eq('id', editingProject.id);

        if (updateError) throw updateError;

        // Delete existing keywords
        await supabase
          .from('keywords')
          .delete()
          .eq('project_id', editingProject.id);
      } else {
        // Create new project
        const { data: newProject, error: insertError } = await supabase
          .from('keyword_research_projects')
          .insert([projectPayload])
          .select()
          .single();

        if (insertError) throw insertError;
        projectId = newProject.id;
      }

      // Save non-existing competitors to client_competitors
      setProcessingStatus('Saving new competitors...');
      const newCompetitors = selectedCompetitors.filter(c => !c.isExisting);
      
      if (newCompetitors.length > 0) {
        const competitorInserts = newCompetitors.map(comp => ({
          client_id: clientId,
          competitor_domain: comp.domain,
          competitor_name: comp.name || null,
          priority: comp.priority
        }));

        await supabase
          .from('client_competitors')
          .insert(competitorInserts);
      }

      // Save keywords
      setProcessingStatus('Saving keywords...');
      const selectedKeywordList = discoveredKeywords.filter(k => selectedKeywords.has(k.keyword));
      
      if (selectedKeywordList.length > 0) {
        // Create keyword inserts using base database schema fields only
        const keywordInserts = selectedKeywordList.map(keyword => {
          // Convert competition string to difficulty integer for base schema
          let difficultyValue = null;
          if (keyword.competition) {
            switch (keyword.competition.toUpperCase()) {
              case 'LOW': difficultyValue = 25; break;
              case 'MEDIUM': difficultyValue = 50; break;
              case 'HIGH': difficultyValue = 75; break;
              default: difficultyValue = 50; break;
            }
          }

          // Convert decimal priority score to integer (1-3) for base schema
          let integerPriorityScore = null;
          if (keyword.priorityScore) {
            integerPriorityScore = Math.max(1, Math.min(3, Math.round(keyword.priorityScore)));
          }

          // Use only fields that exist in the base database.sql schema
          // Store additional data in notes field as JSON for preservation
          const additionalData = {
            cpc: keyword.cpc,
            clicks: keyword.clicks,
            impressions: keyword.impressions,
            ctr: keyword.ctr,
            competition: keyword.competition,
            hasClientRanking: keyword.hasClientRanking
          };

          return {
            project_id: projectId,
            keyword: keyword.keyword,
            search_volume: keyword.searchVolume || null,
            difficulty: difficultyValue,
            current_position: keyword.position ? Math.round(keyword.position) : null,
            competition_level: keyword.cpc || null, // Store CPC in available decimal field
            search_intent: keyword.intent || null,
            priority_score: integerPriorityScore,
            category: keyword.priorityCategory || null,
            sub_category: keyword.opportunityType || null,
            source: keyword.source || 'manual',
            is_branded: selectedClient?.name ? 
              keyword.keyword.toLowerCase().includes(selectedClient.name.toLowerCase()) : false,
            is_quick_win: keyword.priorityCategory === 'quick-win',
            notes: JSON.stringify(additionalData) // Store extra data as JSON
          };
        });

        try {
          console.log('Attempting to insert keywords:', {
            count: keywordInserts.length,
            sampleFields: Object.keys(keywordInserts[0] || {}),
            sampleData: keywordInserts[0]
          });
          
          const { data, error } = await supabase
            .from('keywords')
            .insert(keywordInserts);
            
          if (error) {
            throw error;
          }
          
          console.log('Keywords inserted successfully:', keywordInserts.length);
        } catch (insertError: any) {
          console.error('Keyword insertion error details:', {
            error: insertError,
            message: insertError?.message,
            details: insertError?.details,
            hint: insertError?.hint,
            code: insertError?.code
          });
          
          // Try inserting with absolute minimal fields if full insert fails
          console.log('Attempting fallback insertion with minimal fields...');
          const minimalInserts = selectedKeywordList.map(keyword => {
            const additionalData = {
              cpc: keyword.cpc,
              clicks: keyword.clicks,
              impressions: keyword.impressions,
              ctr: keyword.ctr,
              competition: keyword.competition,
              hasClientRanking: keyword.hasClientRanking
            };

            return {
              project_id: projectId,
              keyword: keyword.keyword,
              search_volume: keyword.searchVolume || null,
              source: keyword.source || 'manual',
              is_branded: false,
              is_quick_win: false,
              priority_score: 2, // Default medium priority
              notes: JSON.stringify(additionalData) // Store extra data as JSON
            };
          });
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('keywords')
            .insert(minimalInserts);
          
          if (fallbackError) {
            console.error('Fallback insertion also failed:', {
              error: fallbackError,
              message: fallbackError.message,
              details: fallbackError.details,
              sampleMinimalInsert: minimalInserts[0]
            });
            throw new Error(`Keyword insertion failed: ${fallbackError.message}`);
          }
          
          console.warn('Inserted keywords with minimal fields due to schema compatibility issues');
        }
      }

      // Create saved project object with all necessary data
      const savedProject = {
        id: projectId,
        clientId,
        name: projectData.name,
        description: projectData.description,
        status: 'completed',
        assignedTo: user?.email || null,
        settings: {
          seedKeywords,
          selectedCompetitors,
          gscImported: gscKeywords.length > 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        keywordCount: selectedKeywords.size
      };

      onComplete(savedProject);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const nextStep = () => {
    if (currentStep === 3 && discoveredKeywords.length === 0) {
      handleKeywordDiscovery().then(() => {
        // Initialize ALL keywords as selected by default for removal interface
        setSelectedKeywords(new Set(discoveredKeywords.map(k => k.keyword)));
        setCurrentStep(currentStep + 1);
      });
    } else if (currentStep === 3 && discoveredKeywords.length > 0) {
      // Initialize ALL keywords as selected by default for removal interface
      setSelectedKeywords(new Set(discoveredKeywords.map(k => k.keyword)));
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return projectData.name.trim().length > 0;
      case 1: return seedKeywords.length > 0 || gscKeywords.length > 0;
      case 2: return true; // Competitors are optional
      case 3: return true; // Allow proceeding to trigger discovery or move to next step
      case 4: return discoveredKeywords.length > 0; // Must have keywords to proceed (selection is for removal)
      case 5: return discoveredKeywords.length > 0; // Must have keywords to save
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Project Setup
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <Input
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                placeholder="e.g., Q1 2024 Keyword Research"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                placeholder="Project goals and scope..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>


          </div>
        );

      case 1: // Seed Keywords
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manual Seed Keywords
              </label>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newSeedKeyword}
                  onChange={(e) => setNewSeedKeyword(e.target.value)}
                  placeholder="Enter keyword"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSeedKeyword()}
                  className="flex-1"
                />
                <Button onClick={handleAddSeedKeyword} icon={Plus}>
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {seedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveSeedKeyword(keyword)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Google Search Console Keywords
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadGSCKeywords}
                  disabled={isLoadingGSC}
                  icon={isLoadingGSC ? Loader2 : Download}
                >
                  {isLoadingGSC ? 'Loading...' : 'Import from GSC'}
                </Button>
              </div>
              
              {gscKeywords.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800 mb-3">
                    ✓ Imported {gscKeywords.length} keywords from Google Search Console
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {gscKeywords.map((keyword, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-900">{keyword.keyword}</span>
                        <div className="flex items-center space-x-2">
                          {keyword.clicks !== undefined && (
                            <span className="text-gray-500 text-xs">
                              Clicks: {keyword.clicks}
                            </span>
                          )}
                          {keyword.position !== undefined && (
                            <span className="text-gray-500 text-xs">
                              Pos: {keyword.position}
                            </span>
                          )}
                          {keyword.ctr !== undefined && (
                            <span className="text-gray-500 text-xs">
                              CTR: {keyword.ctr}%
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveGSCKeyword(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Competitor Selection
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Competitors</h3>
              {existingCompetitors.length > 0 ? (
                <div className="space-y-2">
                  {existingCompetitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className={`flex items-center justify-between p-3 border rounded-md ${
                        selectedCompetitors.some(c => c.domain === competitor.domain)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCompetitors.some(c => c.domain === competitor.domain)}
                          onChange={() => handleCompetitorToggle(competitor)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Building className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {competitor.name || competitor.domain}
                          </div>
                          <div className="text-sm text-gray-500">{competitor.domain}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Priority {competitor.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No existing competitors found for this client.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Competitor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={newCompetitor.domain}
                  onChange={(e) => setNewCompetitor({...newCompetitor, domain: e.target.value})}
                  placeholder="competitor-domain.com"
                />
                <Input
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                  placeholder="Competitor Name (optional)"
                />
                <Button onClick={handleAddNewCompetitor} icon={Plus}>
                  Add Competitor
                </Button>
              </div>
            </div>

            {selectedCompetitors.filter(c => !c.isExisting).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">New Competitors to Add</h4>
                <div className="space-y-2">
                  {selectedCompetitors.filter(c => !c.isExisting).map((competitor) => (
                    <div
                      key={competitor.domain}
                      className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {competitor.name || competitor.domain}
                          </div>
                          <div className="text-sm text-gray-500">{competitor.domain}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCompetitor(competitor.domain)}
                        icon={X}
                        className="text-red-600"
                      >
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Keyword Discovery
        return (
          <div className="space-y-6">
            {isProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Discovering Keywords
                </h3>
                <p className="text-gray-600">{processingStatus}</p>
              </div>
            ) : discoveredKeywords.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Discovery Complete!</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">{keywordStats.total}</div>
                    <div className="text-sm text-blue-800">Total Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-md">
                    <div className="text-2xl font-bold text-purple-600">{keywordStats.branded}</div>
                    <div className="text-sm text-purple-800">Branded</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-md">
                    <div className="text-2xl font-bold text-green-600">{keywordStats.commercial}</div>
                    <div className="text-sm text-green-800">Commercial</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-md">
                    <div className="text-2xl font-bold text-yellow-600">{keywordStats.informational}</div>
                    <div className="text-sm text-yellow-800">Informational</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-md">
                    <div className="text-2xl font-bold text-orange-600">{keywordStats.quickWins}</div>
                    <div className="text-sm text-orange-800">Quick Wins</div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Keywords have been successfully discovered and analyzed. 
                    Click "Next" to review and select which keywords to save.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 inline-block">
                    <p className="text-green-800 font-medium">
                      ✓ Ready for keyword selection
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Discover Keywords
                </h3>
                <p className="text-gray-600">
                  We'll analyze {seedKeywords.length} seed keywords, {gscKeywords.length} GSC keywords, 
                  and {selectedCompetitors.length} competitors to find relevant keywords.
                </p>
              </div>
            )}
          </div>
        );

      case 4: // Select Keywords
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Review Keywords to Save</h3>
                <p className="text-gray-600">
                  All keywords are selected by default. Uncheck any keywords you want to remove from your project.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (selectedKeywords.size === discoveredKeywords.length) {
                      setSelectedKeywords(new Set());
                    } else {
                      setSelectedKeywords(new Set(discoveredKeywords.map(k => k.keyword)));
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedKeywords.size === discoveredKeywords.length ? 'Remove All' : 'Keep All'}
                </button>
                <button
                  onClick={() => {
                    setSelectedKeywords(new Set());
                  }}
                  disabled={selectedKeywords.size === 0}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Remove All Keywords
                </button>
                <div className="text-sm text-gray-600">
                  <span className={`font-medium ${selectedKeywords.size > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedKeywords.size}
                  </span> of {discoveredKeywords.length} keywords will be saved
                </div>
              </div>
            </div>

            {/* Editable Results Table */}
            <KeywordResultsTable 
              keywords={discoveredKeywords}
              title=""
              showFilters={true}
              showExport={false}
              selectedKeywords={selectedKeywords}
              onKeywordToggle={(keyword) => {
                const newSelected = new Set(selectedKeywords);
                if (newSelected.has(keyword)) {
                  newSelected.delete(keyword);
                } else {
                  newSelected.add(keyword);
                }
                setSelectedKeywords(newSelected);
              }}
              showSelection={true}
            />
          </div>
        );

      case 5: // Save Project
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ready to Save Project</h3>
              
              <div className="bg-gray-50 rounded-md p-4 space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Project Name:</span>
                  <span className="ml-2 text-gray-900">{projectData.name}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Client:</span>
                  <span className="ml-2 text-gray-900">{selectedClient?.name}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Keywords to Save:</span>
                  <span className="ml-2 text-gray-900">{selectedKeywords.size} of {discoveredKeywords.length}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Competitors Analyzed:</span>
                  <span className="ml-2 text-gray-900">{selectedCompetitors.length}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Data Sources:</span>
                  <span className="ml-2 text-gray-900">
                    {[
                      seedKeywords.length > 0 && 'Manual Seeds',
                      gscKeywords.length > 0 && 'Google Search Console',
                      selectedCompetitors.length > 0 && 'Competitor Analysis'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Saving {selectedKeywords.size} keywords to this project</li>
                  <li>• Found {keywordStats.quickWins} quick win opportunities (high volume, low competition)</li>
                  <li>• Identified {keywordStats.commercial} commercial intent keywords for conversion focus</li>
                  <li>• Discovered {keywordStats.informational} informational keywords for content marketing</li>
                  {selectedCompetitors.filter(c => !c.isExisting).length > 0 && (
                    <li>• Added {selectedCompetitors.filter(c => !c.isExisting).length} new competitors to client profile</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Special layout for step 4 (keyword selection) - full width
  if (currentStep === 4) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject ? 'Edit' : 'New'} Keyword Research Project
                </h2>
                <p className="text-sm text-gray-600">
                  Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
                </p>
              </div>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="ml-3 hidden md:block">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    
                    {index < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full-width content */}
        <div className="bg-white">
          <div className="px-6 py-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  icon={ArrowLeft}
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() || isProcessing}
                  icon={isProcessing ? Loader2 : ArrowRight}
                >
                  {isProcessing ? 'Processing...' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular layout for other steps
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProject ? 'Edit' : 'New'} Keyword Research Project
              </h2>
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {STEPS[currentStep].title}
            </h3>
            <p className="text-gray-600">
              {STEPS[currentStep].description}
            </p>
          </div>

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                icon={ArrowLeft}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            <div className="flex space-x-3">
              {currentStep === STEPS.length - 1 ? (
                <Button
                  onClick={handleSaveProject}
                  disabled={!canProceed() || isProcessing}
                  icon={isProcessing ? Loader2 : CheckCircle}
                >
                  {isProcessing ? processingStatus : 'Save Project'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() || isProcessing}
                  icon={isProcessing ? Loader2 : ArrowRight}
                >
                  {isProcessing ? 'Processing...' : 'Next'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};