import { create } from 'zustand'

interface TablePreviewState {
  // Modal state
  dayDetailsModal: {
    isOpen: boolean
    dayData: any | null
    initialFilter?: 'all' | 'income' | 'outcome'
  }
  setDayDetailsModal: (modal: { isOpen: boolean; dayData: any | null; initialFilter?: 'all' | 'income' | 'outcome' }) => void

  quickAddModal: {
    isOpen: boolean
    date: string
  }
  setQuickAddModal: (modal: { isOpen: boolean; date: string }) => void

  // UI State
  currentMonth: number
  setCurrentMonth: (month: number) => void

  // Scroll state
  resetScroll: boolean
  setResetScroll: (reset: boolean) => void

  // Helper functions
  resetModals: () => void
}

export const useTablePreviewStore = create<TablePreviewState>((set) => ({
  // Initial state
  dayDetailsModal: {
    isOpen: false,
    dayData: null,
    initialFilter: 'all',
  },
  quickAddModal: {
    isOpen: false,
    date: '',
  },
  currentMonth: new Date().getMonth() + 1,
  resetScroll: false,

  // Actions
  setDayDetailsModal: (modal) => set({ dayDetailsModal: modal }),
  setQuickAddModal: (modal) => set({ quickAddModal: modal }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setResetScroll: (reset) => set({ resetScroll: reset }),

  // Helper functions
  resetModals: () => set({
    dayDetailsModal: { isOpen: false, dayData: null, initialFilter: 'all' },
    quickAddModal: { isOpen: false, date: '' },
  }),
}))
