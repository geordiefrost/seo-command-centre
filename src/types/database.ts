export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'coordinator' | 'executive' | 'senior_executive' | 'head_of_search' | 'admin';
          avatar_url?: string;
          preferences?: {
            theme: 'light' | 'dark' | 'system';
            notifications: {
              email: boolean;
              slack: boolean;
              browser: boolean;
            };
            default_client_id?: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'coordinator' | 'executive' | 'senior_executive' | 'head_of_search' | 'admin';
          avatar_url?: string;
          preferences?: {
            theme: 'light' | 'dark' | 'system';
            notifications: {
              email: boolean;
              slack: boolean;
              browser: boolean;
            };
            default_client_id?: string;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'coordinator' | 'executive' | 'senior_executive' | 'head_of_search' | 'admin';
          avatar_url?: string;
          preferences?: {
            theme: 'light' | 'dark' | 'system';
            notifications: {
              email: boolean;
              slack: boolean;
              browser: boolean;
            };
            default_client_id?: string;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          industry: string;
          type: 'retainer' | 'project';
          status: 'active' | 'paused' | 'archived';
          website_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry: string;
          type: 'retainer' | 'project';
          status?: 'active' | 'paused' | 'archived';
          website_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string;
          type?: 'retainer' | 'project';
          status?: 'active' | 'paused' | 'archived';
          website_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          client_id: string;
          type: 'content_generation' | 'migration_analysis' | 'technical_audit' | 'competitor_analysis' | 'strategy_generation' | 'monitoring' | 'internal_linking' | 'schema_generation' | 'reporting';
          status: 'pending' | 'in_progress' | 'review' | 'completed' | 'failed' | 'cancelled';
          progress: number;
          priority: 'low' | 'medium' | 'high' | 'critical';
          assigned_to?: string;
          due_date?: string;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          type: 'content_generation' | 'migration_analysis' | 'technical_audit' | 'competitor_analysis' | 'strategy_generation' | 'monitoring' | 'internal_linking' | 'schema_generation' | 'reporting';
          status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'failed' | 'cancelled';
          progress?: number;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          assigned_to?: string;
          due_date?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          type?: 'content_generation' | 'migration_analysis' | 'technical_audit' | 'competitor_analysis' | 'strategy_generation' | 'monitoring' | 'internal_linking' | 'schema_generation' | 'reporting';
          status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'failed' | 'cancelled';
          progress?: number;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          assigned_to?: string;
          due_date?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      strategies: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string;
          timeframe: '3months' | '6months' | '12months';
          recommendations: Record<string, any>[];
          kpis: Record<string, any>[];
          timeline: Record<string, any>[];
          status: 'draft' | 'active' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description: string;
          timeframe: '3months' | '6months' | '12months';
          recommendations?: Record<string, any>[];
          kpis?: Record<string, any>[];
          timeline?: Record<string, any>[];
          status?: 'draft' | 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string;
          timeframe?: '3months' | '6months' | '12months';
          recommendations?: Record<string, any>[];
          kpis?: Record<string, any>[];
          timeline?: Record<string, any>[];
          status?: 'draft' | 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      content_briefs: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          content_type: 'blog-post' | 'landing-page' | 'guide' | 'case-study' | 'whitepaper' | 'video-script';
          target_keywords: string[];
          primary_keyword: string;
          word_count: number;
          tone: 'professional' | 'casual' | 'technical' | 'friendly';
          audience: string;
          purpose: string;
          outline: string[];
          brief_content: string;
          status: 'draft' | 'in_progress' | 'review' | 'approved' | 'published';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          content_type: 'blog-post' | 'landing-page' | 'guide' | 'case-study' | 'whitepaper' | 'video-script';
          target_keywords: string[];
          primary_keyword: string;
          word_count?: number;
          tone?: 'professional' | 'casual' | 'technical' | 'friendly';
          audience: string;
          purpose: string;
          outline?: string[];
          brief_content: string;
          status?: 'draft' | 'in_progress' | 'review' | 'approved' | 'published';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          content_type?: 'blog-post' | 'landing-page' | 'guide' | 'case-study' | 'whitepaper' | 'video-script';
          target_keywords?: string[];
          primary_keyword?: string;
          word_count?: number;
          tone?: 'professional' | 'casual' | 'technical' | 'friendly';
          audience?: string;
          purpose?: string;
          outline?: string[];
          brief_content?: string;
          status?: 'draft' | 'in_progress' | 'review' | 'approved' | 'published';
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_content: {
        Row: {
          id: string;
          brief_id: string;
          client_id: string;
          title: string;
          content: string;
          excerpt: string;
          seo_score: number;
          readability_score: number;
          keyword_density: Record<string, number>;
          status: 'draft' | 'review' | 'approved' | 'published';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brief_id: string;
          client_id: string;
          title: string;
          content: string;
          excerpt: string;
          seo_score?: number;
          readability_score?: number;
          keyword_density?: Record<string, number>;
          status?: 'draft' | 'review' | 'approved' | 'published';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brief_id?: string;
          client_id?: string;
          title?: string;
          content?: string;
          excerpt?: string;
          seo_score?: number;
          readability_score?: number;
          keyword_density?: Record<string, number>;
          status?: 'draft' | 'review' | 'approved' | 'published';
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          name: string;
          type: 'data' | 'automation' | 'reporting';
          status: 'connected' | 'error' | 'disconnected';
          last_sync?: string;
          config?: Record<string, any>;
          error_message?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'data' | 'automation' | 'reporting';
          status?: 'connected' | 'error' | 'disconnected';
          last_sync?: string;
          config?: Record<string, any>;
          error_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'data' | 'automation' | 'reporting';
          status?: 'connected' | 'error' | 'disconnected';
          last_sync?: string;
          config?: Record<string, any>;
          error_message?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}