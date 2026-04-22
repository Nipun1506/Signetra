import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  
  cookiesAccepted: boolean | null
  setCookiesAccepted: (accepted: boolean) => void
  
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: window.innerWidth > 768,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  // Initialize with values from localStorage if they exist
  cookiesAccepted: localStorage.getItem('signetra_cookies_accepted') 
    ? localStorage.getItem('signetra_cookies_accepted') === 'true' 
    : null,
  setCookiesAccepted: (accepted) => {
    localStorage.setItem('signetra_cookies_accepted', String(accepted))
    set({ cookiesAccepted: accepted })
  },
  
  termsAccepted: localStorage.getItem('signetra_terms_accepted') === 'true',
  setTermsAccepted: (accepted) => {
    localStorage.setItem('signetra_terms_accepted', String(accepted))
    set({ termsAccepted: accepted })
  }
}))
