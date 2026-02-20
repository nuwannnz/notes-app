import type { StateCreator } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'blue' | 'purple' | 'rose' | 'mint'
export type FontSize = 'small' | 'medium' | 'large'
export type LineHeight = 'compact' | 'normal' | 'relaxed'

export interface ThemeSlice {
  themeMode: ThemeMode
  accentColor: AccentColor
  fontSize: FontSize
  lineHeight: LineHeight
  isDark: boolean

  // Actions
  setThemeMode: (mode: ThemeMode) => void
  setAccentColor: (color: AccentColor) => void
  setFontSize: (size: FontSize) => void
  setLineHeight: (height: LineHeight) => void
  initializeTheme: () => void
}

const THEME_STORAGE_KEY = 'notes-app-theme'
const ACCENT_STORAGE_KEY = 'notes-app-accent'
const FONT_SIZE_STORAGE_KEY = 'notes-app-font-size'
const LINE_HEIGHT_STORAGE_KEY = 'notes-app-line-height'

function getSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function applyFontSize(size: FontSize) {
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  }
  document.documentElement.style.setProperty('--editor-font-size', sizes[size])
}

function applyLineHeight(height: LineHeight) {
  const heights = {
    compact: '1.4',
    normal: '1.6',
    relaxed: '1.8'
  }
  document.documentElement.style.setProperty('--editor-line-height', heights[height])
}

export const createThemeSlice: StateCreator<ThemeSlice, [], [], ThemeSlice> = (set, get) => ({
  themeMode: 'system',
  accentColor: 'blue',
  fontSize: 'medium',
  lineHeight: 'compact',
  isDark: false,

  setThemeMode: (mode: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
    const isDark = mode === 'system' ? getSystemTheme() : mode === 'dark'
    applyTheme(isDark)
    set({ themeMode: mode, isDark })
  },

  setAccentColor: (color: AccentColor) => {
    localStorage.setItem(ACCENT_STORAGE_KEY, color)
    set({ accentColor: color })
  },

  setFontSize: (size: FontSize) => {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size)
    applyFontSize(size)
    set({ fontSize: size })
  },

  setLineHeight: (height: LineHeight) => {
    localStorage.setItem(LINE_HEIGHT_STORAGE_KEY, height)
    applyLineHeight(height)
    set({ lineHeight: height })
  },

  initializeTheme: () => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    const storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null
    const storedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize | null
    const storedLineHeight = localStorage.getItem(LINE_HEIGHT_STORAGE_KEY) as LineHeight | null

    const themeMode = storedTheme ?? 'system'
    const accentColor = storedAccent ?? 'blue'
    const fontSize = storedFontSize ?? 'medium'
    const lineHeight = storedLineHeight ?? 'compact'

    const isDark = themeMode === 'system' ? getSystemTheme() : themeMode === 'dark'

    applyTheme(isDark)
    applyFontSize(fontSize)
    applyLineHeight(lineHeight)

    set({ themeMode, accentColor, fontSize, lineHeight, isDark })

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (get().themeMode === 'system') {
        applyTheme(e.matches)
        set({ isDark: e.matches })
      }
    })
  }
})
