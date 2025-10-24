import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'sepia';

interface SettingsState {
  theme: Theme;
  fontSize: number;
  lineWrap: boolean;
  viewMode: 'split' | 'editor' | 'preview';
  showOutline: boolean;
  focusMode: boolean;
  zenMode: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  syncScroll: boolean;
  zoomLevel: number;
  statisticsExpanded: boolean;
  previewRefreshKey: number;
  
  // Word/Character Limit Warnings
  wordLimitWarningsEnabled: boolean;
  customWordLimit: number | null;
  customCharLimit: number | null;
  
  // Document Settings
  documentSettings: {
    paperSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: 'normal' | 'narrow' | 'wide';
    includeLineNumbers: boolean;
    includePageNumbers: boolean;
    includeHeaderFooter: boolean;
    headerText: string;
    footerText: string;
    fontSize: 'small' | 'medium' | 'large';
    syntaxHighlighting: boolean;
    colorMode: 'color' | 'grayscale' | 'blackwhite';
    columns: 'single' | 'two';
    includeTableOfContents: boolean;
    breakPagesAtHeadings: boolean;
  };
  
  // Preview Settings
  previewSettings: {
    enableSmoothScroll: boolean;
    compactHeadings: boolean;
    showWordCount: boolean;
    enableImageLazyLoad: boolean;
    maxImageWidth: 'full' | 'content' | 'narrow';
    highlightCurrentSection: boolean;
    previewZoom: number;
  };
  
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLineWrap: (wrap: boolean) => void;
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  setShowOutline: (show: boolean) => void;
  setFocusMode: (mode: boolean) => void;
  setZenMode: (mode: boolean) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setSyncScroll: (enabled: boolean) => void;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setStatisticsExpanded: (expanded: boolean) => void;
  forceRefreshPreview: () => void;
  setWordLimitWarningsEnabled: (enabled: boolean) => void;
  setCustomWordLimit: (limit: number | null) => void;
  setCustomCharLimit: (limit: number | null) => void;
  setDocumentSettings: (settings: Partial<SettingsState['documentSettings']>) => void;
  setPreviewSettings: (settings: Partial<SettingsState['previewSettings']>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      fontSize: 14,
      lineWrap: true,
      viewMode: 'split',
      showOutline: false,
      focusMode: false,
      zenMode: false,
      lineNumbers: true,
      autoSave: true,
      syncScroll: true,
      zoomLevel: 100,
      statisticsExpanded: false,
      previewRefreshKey: 0,
      wordLimitWarningsEnabled: false,
      customWordLimit: null,
      customCharLimit: null,
      
      documentSettings: {
        paperSize: 'A4',
        orientation: 'portrait',
        margins: 'normal',
        includeLineNumbers: false,
        includePageNumbers: false,
        includeHeaderFooter: false,
        headerText: '',
        footerText: '',
        fontSize: 'medium',
        syntaxHighlighting: true,
        colorMode: 'color',
        columns: 'single',
        includeTableOfContents: false,
        breakPagesAtHeadings: false,
      },
      
      previewSettings: {
        enableSmoothScroll: true,
        compactHeadings: false,
        showWordCount: false,
        enableImageLazyLoad: true,
        maxImageWidth: 'full',
        highlightCurrentSection: false,
        previewZoom: 100,
      },

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineWrap: (lineWrap) => set({ lineWrap }),
      setViewMode: (viewMode) => set({ viewMode }),
      setShowOutline: (showOutline) => set({ showOutline }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setZenMode: (zenMode) => set({ zenMode }),
      setLineNumbers: (lineNumbers) => set({ lineNumbers }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setSyncScroll: (syncScroll) => set({ syncScroll }),
      setZoomLevel: (zoomLevel) => set({ zoomLevel: Math.max(50, Math.min(200, zoomLevel)) }),
      zoomIn: () => set({ zoomLevel: Math.min(200, get().zoomLevel + 10) }),
      zoomOut: () => set({ zoomLevel: Math.max(50, get().zoomLevel - 10) }),
      resetZoom: () => set({ zoomLevel: 100 }),
      setStatisticsExpanded: (statisticsExpanded) => set({ statisticsExpanded }),
      forceRefreshPreview: () => set({ previewRefreshKey: get().previewRefreshKey + 1 }),
      setWordLimitWarningsEnabled: (wordLimitWarningsEnabled) => set({ wordLimitWarningsEnabled }),
      setCustomWordLimit: (customWordLimit) => set({ customWordLimit }),
      setCustomCharLimit: (customCharLimit) => set({ customCharLimit }),
      setDocumentSettings: (settings) =>
        set({ documentSettings: { ...get().documentSettings, ...settings } }),
      setPreviewSettings: (settings) =>
        set({ previewSettings: { ...get().previewSettings, ...settings } }),
      
      resetToDefaults: () => set({
        theme: 'light',
        fontSize: 14,
        lineWrap: true,
        viewMode: 'split',
        showOutline: false,
        focusMode: false,
        zenMode: false,
        lineNumbers: true,
        autoSave: true,
        syncScroll: true,
        zoomLevel: 100,
      }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
