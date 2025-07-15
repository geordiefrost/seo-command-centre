import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  Download,
  Eye,
  Target,
  TrendingUp,
  BarChart3,
  MousePointer
} from 'lucide-react';
import { Button, Input } from '../../common';

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
  // Priority fields
  priorityScore?: number;
  priorityCategory?: 'quick-win' | 'position-boost' | 'new-opportunity' | 'long-term';
  opportunityType?: string;
  hasClientRanking?: boolean;
}

interface KeywordResultsTableProps {
  keywords: KeywordData[];
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
  onKeywordSelect?: (keyword: KeywordData) => void;
  selectedKeywords?: Set<string>;
  onKeywordToggle?: (keyword: string) => void;
  showSelection?: boolean;
}

type SortField = 'keyword' | 'searchVolume' | 'competition' | 'clicks' | 'impressions' | 'position' | 'cpc' | 'priorityScore';
type SortDirection = 'asc' | 'desc';

const sourceLabels = {
  manual: 'Manual',
  gsc: 'GSC',
  competitor: 'Competitor'
};

const intentLabels = {
  informational: 'Info',
  navigational: 'Nav',
  transactional: 'Trans',
  commercial: 'Comm'
};

const intentColors = {
  informational: 'bg-blue-100 text-blue-800',
  navigational: 'bg-purple-100 text-purple-800',
  transactional: 'bg-green-100 text-green-800',
  commercial: 'bg-orange-100 text-orange-800'
};

const sourceColors = {
  manual: 'bg-gray-100 text-gray-800',
  gsc: 'bg-blue-100 text-blue-800',
  competitor: 'bg-red-100 text-red-800'
};

export const KeywordResultsTable: React.FC<KeywordResultsTableProps> = ({
  keywords,
  title = 'Discovered Keywords',
  showFilters = true,
  showExport = false,
  onKeywordSelect,
  selectedKeywords,
  onKeywordToggle,
  showSelection = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [priorityTab, setPriorityTab] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('searchVolume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Define priority tab filters
  const priorityTabs = [
    { id: 'all', label: 'All Keywords', emoji: '📊' },
    { id: 'quick-win', label: 'Quick Wins', emoji: '🔥' },
    { id: 'position-boost', label: 'Position Boosts', emoji: '⚡' },
    { id: 'new-opportunity', label: 'New Opportunities', emoji: '🚀' },
    { id: 'long-term', label: 'Long-term', emoji: '📈' }
  ];

  // Filter and sort keywords
  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(keyword => {
      const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === 'all' || keyword.source === sourceFilter;
      const matchesIntent = intentFilter === 'all' || keyword.intent === intentFilter;
      const matchesPriority = priorityTab === 'all' || keyword.priorityCategory === priorityTab;
      
      return matchesSearch && matchesSource && matchesIntent && matchesPriority;
    });

    // Sort keywords
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      // String comparison for keyword
      if (sortField === 'keyword') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [keywords, searchTerm, sourceFilter, intentFilter, priorityTab, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedKeywords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedKeywords = filteredAndSortedKeywords.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const formatNumber = (num?: number, showZero: boolean = false): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num === 0 && !showZero) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDecimal = (num?: number, decimals: number = 1): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num === 0) return '-';
    return num.toFixed(decimals);
  };

  const formatCurrency = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num === 0) return '-';
    return `$${num.toFixed(2)}`;
  };

  const getCompetitionColor = (competition?: string): string => {
    if (!competition) return 'text-gray-500';
    if (competition === 'LOW') return 'text-green-600';
    if (competition === 'MEDIUM') return 'text-yellow-600';
    if (competition === 'HIGH') return 'text-red-600';
    return 'text-gray-500';
  };

  const getPositionColor = (position?: number): string => {
    if (!position) return 'text-gray-500';
    if (position <= 3) return 'text-green-600';
    if (position <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (score?: number): string => {
    if (!score) return 'text-gray-500';
    if (score >= 2.5) return 'text-green-600';
    if (score >= 2.0) return 'text-yellow-600';
    if (score >= 1.5) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getPriorityBadgeColor = (category?: string): string => {
    switch (category) {
      case 'quick-win': return 'bg-red-100 text-red-800';
      case 'position-boost': return 'bg-yellow-100 text-yellow-800';
      case 'new-opportunity': return 'bg-green-100 text-green-800';
      case 'long-term': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Keywords Found</h3>
          <p className="text-gray-500">
            Run keyword discovery to see results here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {filteredAndSortedKeywords.length} of {keywords.length} keywords
            </p>
          </div>
          {showExport && (
            <Button variant="outline" size="sm" icon={Download}>
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Priority Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {priorityTabs.map((tab) => {
            const isActive = priorityTab === tab.id;
            const tabCount = tab.id === 'all' 
              ? keywords.length 
              : keywords.filter(k => k.priorityCategory === tab.id).length;
            
            return (
              <button
                key={tab.id}
                onClick={() => setPriorityTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tabCount}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Input
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual</option>
                <option value="gsc">Google Search Console</option>
                <option value="competitor">Competitor</option>
              </select>
            </div>
            <div>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
              >
                <option value="all">All Intent</option>
                <option value="informational">Informational</option>
                <option value="navigational">Navigational</option>
                <option value="transactional">Transactional</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Filtered: {filteredAndSortedKeywords.length}</span>
            </div>
          </div>
          
          {/* Data Source Legend */}
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span>API = DataForSEO (Volume, Difficulty, CPC)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>GSC = Google Search Console (Clicks, Position)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span>- = No data available</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showSelection && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedKeywords?.size === keywords.length && keywords.length > 0}
                    onChange={() => {
                      if (onKeywordToggle && selectedKeywords) {
                        if (selectedKeywords.size === keywords.length) {
                          // Deselect all
                          keywords.forEach(k => onKeywordToggle(k.keyword));
                        } else {
                          // Select all
                          keywords.forEach(k => {
                            if (!selectedKeywords.has(k.keyword)) {
                              onKeywordToggle(k.keyword);
                            }
                          });
                        }
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
              )}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('keyword')}
              >
                <div className="flex items-center space-x-1">
                  <span>Keyword</span>
                  {getSortIcon('keyword')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('searchVolume')}
              >
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-3 w-3" />
                  <span>Volume</span>
                  {getSortIcon('searchVolume')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('competition')}
              >
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>Competition</span>
                  {getSortIcon('competition')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cpc')}
              >
                <div className="flex items-center space-x-1">
                  <MousePointer className="h-3 w-3" />
                  <span>CPC</span>
                  {getSortIcon('cpc')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('clicks')}
              >
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Clicks</span>
                  {getSortIcon('clicks')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('position')}
              >
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Position</span>
                  {getSortIcon('position')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priorityScore')}
              >
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>Priority</span>
                  {getSortIcon('priorityScore')}
                </div>
              </th>
              {onKeywordSelect && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedKeywords.map((keyword, index) => {
              const isSelected = selectedKeywords?.has(keyword.keyword) || false;
              return (
              <tr key={`${keyword.keyword}-${index}`} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                {showSelection && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedKeywords?.has(keyword.keyword) || false}
                      onChange={() => onKeywordToggle?.(keyword.keyword)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {keyword.keyword}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sourceColors[keyword.source]}`}>
                    {sourceLabels[keyword.source]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {keyword.intent && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${intentColors[keyword.intent]}`}>
                      {intentLabels[keyword.intent]}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-900">{formatNumber(keyword.searchVolume)}</span>
                    {keyword.searchVolume && keyword.searchVolume > 0 && (
                      <span className="text-xs text-blue-600" title="Data from DataForSEO">API</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    <span className={getCompetitionColor(keyword.competition)}>
                      {keyword.competition || '-'}
                    </span>
                    {keyword.competition && (
                      <span className="text-xs text-blue-600" title="Data from DataForSEO">API</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-900">{formatCurrency(keyword.cpc)}</span>
                    {keyword.cpc && keyword.cpc > 0 && (
                      <span className="text-xs text-blue-600" title="Data from DataForSEO">API</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-900">{formatNumber(keyword.clicks, true)}</span>
                    {keyword.clicks && keyword.clicks > 0 && (
                      <span className="text-xs text-green-600" title="Data from Google Search Console">GSC</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-1">
                    <span className={getPositionColor(keyword.position)}>
                      {formatDecimal(keyword.position)}
                    </span>
                    {keyword.position && keyword.position > 0 && (
                      <span className="text-xs text-green-600" title="Data from Google Search Console">GSC</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getPriorityColor(keyword.priorityScore)}`}>
                        {keyword.priorityScore ? keyword.priorityScore.toFixed(1) : 'N/A'}
                      </span>
                      {keyword.priorityCategory && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(keyword.priorityCategory)}`}>
                          {keyword.priorityCategory === 'quick-win' ? '🔥 Quick Win' :
                           keyword.priorityCategory === 'position-boost' ? '⚡ Position' :
                           keyword.priorityCategory === 'new-opportunity' ? '🚀 New Opp' :
                           '📈 Long-term'}
                        </span>
                      )}
                    </div>
                    {keyword.opportunityType && (
                      <div className="text-xs text-gray-500">{keyword.opportunityType}</div>
                    )}
                  </div>
                </td>
                {onKeywordSelect && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onKeywordSelect(keyword)}
                    >
                      View
                    </Button>
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedKeywords.length)} of {filteredAndSortedKeywords.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};