import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// أنواع البيانات الأساسية
interface User {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  roleId: number
  roleName: string
  restaurantId?: string
  status: string
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

interface AppSettings {
  language: 'ar' | 'en'
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  notificationsEnabled: boolean
}

// متجر المستخدم والمصادقة
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    { name: 'auth-store' }
  )
)

// متجر الإشعارات
interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    persist(
      (set, get) => ({
        notifications: [],
        unreadCount: 0,
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            isRead: false,
            createdAt: new Date(),
          }
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }))
        },
        markAsRead: (id) => set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
        markAllAsRead: () => set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),
        removeNotification: (id) => set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.isRead 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          }
        }),
        clearAll: () => set({ notifications: [], unreadCount: 0 }),
      }),
      { name: 'notification-store' }
    ),
    { name: 'notification-store' }
  )
)

// متجر إعدادات التطبيق
interface SettingsStore {
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleSidebar: () => void
  setLanguage: (language: 'ar' | 'en') => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        settings: {
          language: 'ar',
          theme: 'light',
          sidebarCollapsed: false,
          notificationsEnabled: true,
        },
        updateSettings: (newSettings) => set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
        toggleSidebar: () => set((state) => ({
          settings: { 
            ...state.settings, 
            sidebarCollapsed: !state.settings.sidebarCollapsed 
          }
        })),
        setLanguage: (language) => set((state) => ({
          settings: { ...state.settings, language }
        })),
        setTheme: (theme) => set((state) => ({
          settings: { ...state.settings, theme }
        })),
      }),
      { name: 'settings-store' }
    ),
    { name: 'settings-store' }
  )
)

// متجر حالة الـ Workflow
interface WorkflowState {
  instanceId: string
  processName: string
  currentStep: string
  currentState: string
  allowedActions: string[]
  entityId: string
  entityType: string
}

interface WorkflowStore {
  activeWorkflows: WorkflowState[]
  selectedWorkflow: WorkflowState | null
  isLoading: boolean
  setActiveWorkflows: (workflows: WorkflowState[]) => void
  selectWorkflow: (workflow: WorkflowState | null) => void
  updateWorkflow: (instanceId: string, updates: Partial<WorkflowState>) => void
  removeWorkflow: (instanceId: string) => void
  setLoading: (loading: boolean) => void
}

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    (set) => ({
      activeWorkflows: [],
      selectedWorkflow: null,
      isLoading: false,
      setActiveWorkflows: (activeWorkflows) => set({ activeWorkflows }),
      selectWorkflow: (selectedWorkflow) => set({ selectedWorkflow }),
      updateWorkflow: (instanceId, updates) => set((state) => ({
        activeWorkflows: state.activeWorkflows.map(w =>
          w.instanceId === instanceId ? { ...w, ...updates } : w
        ),
        selectedWorkflow: state.selectedWorkflow?.instanceId === instanceId
          ? { ...state.selectedWorkflow, ...updates }
          : state.selectedWorkflow,
      })),
      removeWorkflow: (instanceId) => set((state) => ({
        activeWorkflows: state.activeWorkflows.filter(w => w.instanceId !== instanceId),
        selectedWorkflow: state.selectedWorkflow?.instanceId === instanceId 
          ? null 
          : state.selectedWorkflow,
      })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'workflow-store' }
  )
)

// متجر البيانات العامة للمطعم
interface RestaurantData {
  id: string
  name: string
  status: string
  monthlyQuota: number
  inventory: {
    ketchupRemaining: number
    chiliRemaining: number
  }
  lastDelivery?: Date
  nextDelivery?: Date
}

interface RestaurantStore {
  restaurant: RestaurantData | null
  contracts: any[]
  invoices: any[]
  designs: any[]
  isLoading: boolean
  setRestaurant: (restaurant: RestaurantData | null) => void
  updateInventory: (inventory: Partial<RestaurantData['inventory']>) => void
  setContracts: (contracts: any[]) => void
  setInvoices: (invoices: any[]) => void
  setDesigns: (designs: any[]) => void
  setLoading: (loading: boolean) => void
}

export const useRestaurantStore = create<RestaurantStore>()(
  devtools(
    (set) => ({
      restaurant: null,
      contracts: [],
      invoices: [],
      designs: [],
      isLoading: false,
      setRestaurant: (restaurant) => set({ restaurant }),
      updateInventory: (inventory) => set((state) => ({
        restaurant: state.restaurant 
          ? { ...state.restaurant, inventory: { ...state.restaurant.inventory, ...inventory } }
          : null
      })),
      setContracts: (contracts) => set({ contracts }),
      setInvoices: (invoices) => set({ invoices }),
      setDesigns: (designs) => set({ designs }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'restaurant-store' }
  )
)
