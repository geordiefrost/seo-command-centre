import { create } from 'zustand';
import { Tool, ToolCategory } from '../types';

interface ToolState {
  tools: Tool[];
  activeToolId: string | null;
  toolSettings: Record<string, any>;
  favorites: string[];
  recentlyUsed: string[];
  
  // Actions
  setTools: (tools: Tool[]) => void;
  launchTool: (toolId: string) => void;
  setActiveToolId: (toolId: string | null) => void;
  updateToolSettings: (toolId: string, settings: any) => void;
  addToFavorites: (toolId: string) => void;
  removeFromFavorites: (toolId: string) => void;
  addToRecentlyUsed: (toolId: string) => void;
  getToolsByCategory: (category: ToolCategory) => Tool[];
  getToolById: (toolId: string) => Tool | undefined;
  getFavoriteTools: () => Tool[];
  getRecentlyUsedTools: () => Tool[];
}

export const useToolStore = create<ToolState>((set, get) => ({
  // Initial state
  tools: [],
  activeToolId: null,
  toolSettings: {},
  favorites: [],
  recentlyUsed: [],
  
  // Actions
  setTools: (tools) => set({ tools }),
  
  launchTool: (toolId) => {
    const { addToRecentlyUsed } = get();
    addToRecentlyUsed(toolId);
    set({ activeToolId: toolId });
  },
  
  setActiveToolId: (toolId) => set({ activeToolId: toolId }),
  
  updateToolSettings: (toolId, settings) => {
    const { toolSettings } = get();
    set({
      toolSettings: {
        ...toolSettings,
        [toolId]: { ...toolSettings[toolId], ...settings }
      }
    });
  },
  
  addToFavorites: (toolId) => {
    const { favorites } = get();
    if (!favorites.includes(toolId)) {
      set({ favorites: [...favorites, toolId] });
    }
  },
  
  removeFromFavorites: (toolId) => {
    const { favorites } = get();
    set({ favorites: favorites.filter(id => id !== toolId) });
  },
  
  addToRecentlyUsed: (toolId) => {
    const { recentlyUsed } = get();
    const filtered = recentlyUsed.filter(id => id !== toolId);
    set({ recentlyUsed: [toolId, ...filtered].slice(0, 10) });
  },
  
  getToolsByCategory: (category) => {
    const { tools } = get();
    return tools.filter(tool => tool.category === category);
  },
  
  getToolById: (toolId) => {
    const { tools } = get();
    return tools.find(tool => tool.id === toolId);
  },
  
  getFavoriteTools: () => {
    const { tools, favorites } = get();
    return tools.filter(tool => favorites.includes(tool.id));
  },
  
  getRecentlyUsedTools: () => {
    const { tools, recentlyUsed } = get();
    return recentlyUsed
      .map(id => tools.find(tool => tool.id === id))
      .filter(Boolean) as Tool[];
  },
}));