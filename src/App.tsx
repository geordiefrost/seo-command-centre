import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/appStore';
import { useToolStore } from './store/toolStore';
import { useIntegrationStore } from './store/integrationStore';
import { Layout } from './components/layout';
import { Dashboard, Login, Strategy, Content, Monitoring, Migration, Competitive, Automation, Clients, KeywordResearch } from './pages';
import { GoogleOAuthCallback } from './components/auth/GoogleOAuthCallback';
import { mockTools, mockIntegrationData } from './mock';
import { supabase } from './lib/supabase';
// import { quickDatabaseTest } from './utils/quickTest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const { isAuthenticated, loadClients, loadTasks, setAuthenticated, setUser } = useAppStore();
  const { setTools } = useToolStore();
  const { setIntegrations, setIntegrationStatus } = useIntegrationStore();
  
  // Initialize stores with data (DB for clients/tasks, mock for tools)
  useEffect(() => {
    // Load real data from database
    loadClients();
    loadTasks();
    
    // Load mock data for tools
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
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // User is logged in, set authenticated state
        setAuthenticated(true);
        // In a real app, you would fetch user data here
      }
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        setUser(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [loadClients, loadTasks, setTools, setIntegrations, setIntegrationStatus, setAuthenticated, setUser]);
  
  // Test database connection (only in development)
  // useEffect(() => {
  //   if (import.meta.env.DEV && import.meta.env.VITE_SUPABASE_URL) {
  //     // Run tests after a short delay to let the app initialize
  //     setTimeout(() => {
  //       quickDatabaseTest();
  //     }, 2000);
  //   }
  // }, []);
  
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
              path="/auth/google/callback" 
              element={<GoogleOAuthCallback />} 
            />
            <Route
              path="/"
              element={
                isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="strategy" element={<Strategy />} />
              <Route path="keyword-research" element={<KeywordResearch />} />
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