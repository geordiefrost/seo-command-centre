import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/appStore';
import { useToolStore } from './store/toolStore';
import { useIntegrationStore } from './store/integrationStore';
import { Layout } from './components/layout';
import { Dashboard, Login, Strategy, Content, Monitoring, Migration, Competitive, Automation } from './pages';
import { mockClients, mockTasks, mockTools, mockIntegrationData } from './mock';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const { isAuthenticated, setClients, setTasks } = useAppStore();
  const { setTools } = useToolStore();
  const { setIntegrations, setIntegrationStatus } = useIntegrationStore();
  
  // Initialize stores with mock data
  useEffect(() => {
    setClients(mockClients);
    setTasks(mockTasks);
    setTools(mockTools);
    
    // Initialize integrations
    const integrations = [
      { id: '1', name: 'DataForSEO', type: 'data' as const, status: 'connected' as const, lastSync: new Date() },
      { id: '2', name: 'Firecrawl MCP', type: 'automation' as const, status: 'connected' as const, lastSync: new Date() },
      { id: '3', name: 'Perplexity MCP', type: 'data' as const, status: 'connected' as const, lastSync: new Date() },
      { id: '4', name: 'OpenAI', type: 'automation' as const, status: 'connected' as const, lastSync: new Date() },
      { id: '5', name: 'Apify', type: 'automation' as const, status: 'error' as const },
      { id: '6', name: 'Google Analytics', type: 'reporting' as const, status: 'connected' as const, lastSync: new Date() },
      { id: '7', name: 'Slack', type: 'reporting' as const, status: 'connected' as const, lastSync: new Date() },
    ];
    
    setIntegrations(integrations);
    
    // Set integration statuses
    Object.entries(mockIntegrationData.integrationStatuses).forEach(([service, status]) => {
      setIntegrationStatus(service, {
        service,
        connected: status.connected,
        lastSync: status.lastSync,
        error: (status as any).error,
        usage: (status as any).usage,
      });
    });
  }, [setClients, setTasks, setTools, setIntegrations, setIntegrationStatus]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route
              path="/"
              element={
                isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="strategy" element={<Strategy />} />
              <Route path="content" element={<Content />} />
              <Route path="migration" element={<Migration />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="competitive" element={<Competitive />} />
              <Route path="automation" element={<Automation />} />
              <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports Module - Coming Soon</h1></div>} />
              <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;