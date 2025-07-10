import { create } from 'zustand';
import { Client, Task, TaskFilters, User, UserRole, Notification } from '../types';

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Clients
  clients: Client[];
  selectedClientId: string | null;
  
  // Tasks
  tasks: Task[];
  taskFilters: TaskFilters;
  
  // UI State
  sidebarCollapsed: boolean;
  activeModal: string | null;
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setClients: (clients: Client[]) => void;
  selectClient: (clientId: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setTaskFilters: (filters: TaskFilters) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  clients: [],
  selectedClientId: null,
  tasks: [],
  taskFilters: {},
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],
  isLoading: false,
  loadingMessage: '',
  
  // Actions
  setUser: (user) => set({ user }),
  
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  
  setClients: (clients) => set({ clients }),
  
  selectClient: (clientId) => set({ selectedClientId: clientId }),
  
  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (taskId, updates) => {
    const { tasks } = get();
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    set({ tasks: updatedTasks });
  },
  
  addTask: (task) => {
    const { tasks } = get();
    set({ tasks: [...tasks, task] });
  },
  
  removeTask: (taskId) => {
    const { tasks } = get();
    set({ tasks: tasks.filter(task => task.id !== taskId) });
  },
  
  setTaskFilters: (filters) => set({ taskFilters: filters }),
  
  toggleSidebar: () => {
    const { sidebarCollapsed } = get();
    set({ sidebarCollapsed: !sidebarCollapsed });
  },
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setActiveModal: (modal) => set({ activeModal: modal }),
  
  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    set({ notifications: [newNotification, ...notifications] });
  },
  
  removeNotification: (id) => {
    const { notifications } = get();
    set({ notifications: notifications.filter(n => n.id !== id) });
  },
  
  markNotificationAsRead: (id) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
  },
  
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
}));