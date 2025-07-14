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
  difficulty?: number;
  source: 'manual' | 'gsc' | 'competitor';
  competition?: number;
  cpc?: number;
  intent?: 'informational' | 'navigational' | 'transactional' | 'commercial';
  // GSC specific fields
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface KeywordResultsTableProps {
  keywords: KeywordData[];
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
  onKeywordSelect?: (keyword: KeywordData) => void;
}

type SortField = 'keyword' | 'searchVolume' | 'difficulty' | 'clicks' | 'impressions' | 'position' | 'cpc';
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
  onKeywordSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('searchVolume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Filter and sort keywords
  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(keyword => {
      const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === 'all' || keyword.source === sourceFilter;
      const matchesIntent = intentFilter === 'all' || keyword.intent === intentFilter;
      
      return matchesSearch && matchesSource && matchesIntent;
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
  }, [keywords, searchTerm, sourceFilter, intentFilter, sortField, sortDirection]);

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

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDecimal = (num?: number, decimals: number = 1): string => {
    if (num === undefined || num === null) return 'N/A';
    return num.toFixed(decimals);
  };

  const getDifficultyColor = (difficulty?: number): string => {
    if (!difficulty) return 'text-gray-500';
    if (difficulty < 30) return 'text-green-600';
    if (difficulty < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPositionColor = (position?: number): string => {
    if (!position) return 'text-gray-500';
    if (position <= 3) return 'text-green-600';
    if (position <= 10) return 'text-yellow-600';
    return 'text-red-600';
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

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                onClick={() => handleSort('difficulty')}
              >
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>Difficulty</span>
                  {getSortIcon('difficulty')}
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
              {onKeywordSelect && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedKeywords.map((keyword, index) => (
              <tr key={`${keyword.keyword}-${index}`} className="hover:bg-gray-50">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.searchVolume)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getDifficultyColor(keyword.difficulty)}>
                    {keyword.difficulty ? `${keyword.difficulty}%` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.cpc ? `$${formatDecimal(keyword.cpc, 2)}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.clicks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPositionColor(keyword.position)}>
                    {keyword.position ? formatDecimal(keyword.position) : 'N/A'}
                  </span>
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
            ))}
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