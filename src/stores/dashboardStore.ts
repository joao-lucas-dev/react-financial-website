import { create } from 'zustand'

interface DashboardState {
  // Modal state
  openModal: {
    isOpen: boolean
    transaction: any
    type: string
    button?: 'income' | 'outcome'
  }
  setOpenModal: (modal: { isOpen: boolean; transaction: any; type: string; button?: 'income' | 'outcome' }) => void

  // Filters for recent transactions
  recentSearchTerm: string
  setRecentSearchTerm: (term: string) => void
  
  paymentStatusFilter: 'all' | 'paid' | 'unpaid'
  setPaymentStatusFilter: (filter: 'all' | 'paid' | 'unpaid') => void
  
  recentTypeFilter: 'all' | 'income' | 'outcome'
  setRecentTypeFilter: (filter: 'all' | 'income' | 'outcome') => void
  
  // UI State
  filtersExpanded: boolean
  setFiltersExpanded: (expanded: boolean) => void
  
  searchExpanded: boolean
  setSearchExpanded: (expanded: boolean) => void
  
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  
  // Pagination
  itemsToShow: number
  setItemsToShow: (items: number) => void
  
  // Helper functions
  resetFilters: () => void
  getActiveFiltersCount: () => number
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  openModal: {
    isOpen: false,
    transaction: {},
    type: '',
  },
  recentSearchTerm: '',
  paymentStatusFilter: 'all',
  recentTypeFilter: 'all',
  filtersExpanded: false,
  searchExpanded: false,
  activeMenuId: null,
  itemsToShow: 5,

  // Actions
  setOpenModal: (modal) => set({ openModal: modal }),
  setRecentSearchTerm: (term) => set({ recentSearchTerm: term }),
  setPaymentStatusFilter: (filter) => set({ paymentStatusFilter: filter }),
  setRecentTypeFilter: (filter) => set({ recentTypeFilter: filter }),
  setFiltersExpanded: (expanded) => set({ filtersExpanded: expanded }),
  setSearchExpanded: (expanded) => set({ searchExpanded: expanded }),
  setActiveMenuId: (id) => set({ activeMenuId: id }),
  setItemsToShow: (items) => set({ itemsToShow: items }),

  // Helper functions
  resetFilters: () => set({
    recentSearchTerm: '',
    paymentStatusFilter: 'all',
    recentTypeFilter: 'all',
  }),

  getActiveFiltersCount: () => {
    const state = get()
    return [
      state.recentSearchTerm !== '',
      state.recentTypeFilter !== 'all',
      state.paymentStatusFilter !== 'all',
    ].filter(Boolean).length
  },
}))
