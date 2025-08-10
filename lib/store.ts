import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
  role: "USER" | "COMPANY" | "ADMIN"
  avatar?: string
  location?: string
  headline?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
)

interface SearchState {
  query: string
  location: string
  jobType: string
  filters: {
    locationType: string[]
    experienceLevel: string[]
    salaryRange: [number, number]
  }
  setQuery: (query: string) => void
  setLocation: (location: string) => void
  setJobType: (jobType: string) => void
  setFilters: (filters: Partial<SearchState["filters"]>) => void
  clearFilters: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  location: "",
  jobType: "",
  filters: {
    locationType: [],
    experienceLevel: [],
    salaryRange: [0, 300000],
  },
  setQuery: (query) => set({ query }),
  setLocation: (location) => set({ location }),
  setJobType: (jobType) => set({ jobType }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearFilters: () =>
    set({
      query: "",
      location: "",
      jobType: "",
      filters: {
        locationType: [],
        experienceLevel: [],
        salaryRange: [0, 300000],
      },
    }),
}))
