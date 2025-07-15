import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Target,
  BarChart3,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common';
import { useAppStore } from '../store/appStore';
import { supabase } from '../lib/supabase';
import { KeywordResearchWizard, KeywordResultsTable } from '../components/features/keyword-research';

interface KeywordResearchProject {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  status: 'setup' | 'in_progress' | 'review' | 'completed' | 'archived';
  assignedTo?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  keywordCount?: number;
}

interface KeywordResearchPageProps {}

const KeywordResearch: React.FC<KeywordResearchPageProps> = () => {
  const { clients, selectedClientId } = useAppStore();
  const [projects, setProjects] = useState<KeywordResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProject, setSelectedProject] = useState<KeywordResearchProject | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [editingProject, setEditingProject] = useState<KeywordResearchProject | null>(null);
  const [projectKeywords, setProjectKeywords] = useState<any[]>([]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  useEffect(() => {
    loadProjects();
  }, [selectedClientId]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('keyword_research_projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by selected client if one is chosen
      if (selectedClientId) {
        query = query.eq('client_id', selectedClientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get keyword counts separately for each project
      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project) => {
          const { count } = await supabase
            .from('keywords')
            .select('*', { count: 'exact' })
            .eq('project_id', project.id);
          
          return {
            id: project.id,
            clientId: project.client_id,
            name: project.name,
            description: project.description,
            dateRangeStart: project.date_range_start,
            dateRangeEnd: project.date_range_end,
            status: project.status,
            assignedTo: project.assigned_to,
            settings: project.settings,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            keywordCount: count || 0
          };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error loading keyword research projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    if (!selectedClientId) {
      alert('Please select a client first using the dropdown in the header.');
      return;
    }
    setShowWizard(true);
  };

  const handleViewProject = async (project: KeywordResearchProject) => {
    setSelectedProject(project);
    setShowResults(true);
    
    // Load keywords for this project
    try {
      const { data: keywords, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('project_id', project.id)
        .order('search_volume', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      
      // Transform database keywords to KeywordData format with legacy compatibility
      const transformedKeywords = (keywords || []).map(keyword => {
        // Handle legacy difficulty to competition conversion
        const competitionValue = keyword.competition || 
          (keyword.difficulty ? 
            (keyword.difficulty <= 30 ? 'LOW' : keyword.difficulty <= 70 ? 'MEDIUM' : 'HIGH') : 
            undefined);

        // Handle legacy current_position to position conversion
        const positionValue = keyword.gsc_position || keyword.current_position || undefined;

        return {
          keyword: keyword.keyword,
          searchVolume: keyword.search_volume || undefined,
          competition: competitionValue,
          source: keyword.source || 'manual',
          cpc: keyword.cpc || undefined,
          intent: keyword.search_intent || undefined,
          clicks: keyword.gsc_clicks || undefined,
          impressions: keyword.gsc_impressions || undefined,
          ctr: keyword.gsc_ctr || undefined,
          position: positionValue,
          priorityScore: keyword.priority_score || undefined,
          priorityCategory: keyword.priority_category || undefined,
          opportunityType: keyword.opportunity_type || undefined,
          hasClientRanking: keyword.has_client_ranking || false
        };
      });
      
      setProjectKeywords(transformedKeywords);
    } catch (error) {
      console.error('Error loading project keywords:', error);
      setProjectKeywords([]);
    }
  };

  const handleEditProject = (project: KeywordResearchProject) => {
    setEditingProject(project);
    setShowWizard(true);
  };

  const handleDeleteProject = async (project: KeywordResearchProject) => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('keyword_research_projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'setup': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (showWizard) {
    return (
      <div className="p-6">
        <KeywordResearchWizard
          clientId={selectedClientId!}
          onComplete={async (savedProject) => {
            setShowWizard(false);
            setEditingProject(null);
            
            // Automatically navigate to the results view
            await handleViewProject(savedProject);
          }}
          onCancel={() => {
            setShowWizard(false);
            setEditingProject(null);
          }}
          editingProject={editingProject}
        />
      </div>
    );
  }

  if (showResults && selectedProject) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowResults(false)}
              className="mb-4"
            >
              ← Back to Projects
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
            <p className="text-gray-600">{selectedProject.description}</p>
          </div>
          
          {/* Project Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{projectKeywords.length}</div>
                  <div className="text-sm text-gray-600">Total Keywords</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {projectKeywords.filter(k => k.intent === 'commercial').length}
                  </div>
                  <div className="text-sm text-gray-600">Commercial</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {projectKeywords.filter(k => k.intent === 'informational').length}
                  </div>
                  <div className="text-sm text-gray-600">Informational</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {projectKeywords.filter(k => (k.searchVolume || 0) > 100 && k.competition === 'LOW').length}
                  </div>
                  <div className="text-sm text-gray-600">Quick Wins</div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Keywords Table */}
          <KeywordResultsTable 
            keywords={projectKeywords}
            title={`Keywords for ${selectedProject.name}`}
            showFilters={true}
            showExport={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keyword Research</h1>
            {selectedClient ? (
              <p className="text-gray-600">Research projects for {selectedClient.name}</p>
            ) : (
              <p className="text-gray-600">Select a client to view their keyword research projects</p>
            )}
          </div>
          <Button
            onClick={handleNewProject}
            icon={Plus}
            disabled={!selectedClientId}
          >
            New Research Project
          </Button>
        </div>

        {/* Client Selection Prompt */}
        {!selectedClientId && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Select a Client</h3>
                <p className="text-blue-700">Choose a client from the dropdown in the header to view their keyword research projects.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedClientId ? 'No Research Projects' : 'No Projects Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedClientId 
                ? 'Start your first keyword research project for this client.'
                : 'Select a client to see their keyword research projects.'
              }
            </p>
            {selectedClientId && (
              <Button onClick={handleNewProject} icon={Plus}>
                Create Research Project
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>{project.keywordCount || 0} keywords</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>

                  {project.assignedTo && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{project.assignedTo}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProject(project)}
                    icon={Eye}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProject(project)}
                    icon={Edit}
                  >
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project)}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-700"
                  >
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordResearch;