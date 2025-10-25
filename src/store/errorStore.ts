import { create } from 'zustand';

export interface EditorError {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'markdown' | 'mermaid' | 'math' | 'link' | 'accessibility';
  line?: number;
  message: string;
  details?: string;
  timestamp: number;
}

interface ErrorState {
  errors: EditorError[];
  showErrorPanel: boolean;
  
  setErrors: (errors: EditorError[]) => void;
  addError: (error: Omit<EditorError, 'id' | 'timestamp'>) => string;
  replaceErrorsByCategory: (categories: string[], newErrors: Omit<EditorError, 'id' | 'timestamp'>[]) => void;
  clearErrors: () => void;
  removeError: (id: string) => void;
  setShowErrorPanel: (show: boolean) => void;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  errors: [],
  showErrorPanel: false,

  setErrors: (errors) => set({ errors }),

  addError: (error) => {
    const id = `${error.category}-${Date.now()}-${Math.random()}`;
    const newError: EditorError = {
      ...error,
      id,
      timestamp: Date.now(),
    };
    set({ errors: [...get().errors, newError], showErrorPanel: true });
    return id;
  },

  replaceErrorsByCategory: (categories, newErrors) => {
    const currentErrors = get().errors;
    const filteredErrors = currentErrors.filter(
      (err) => !categories.includes(err.category)
    );
    
    const mappedNewErrors: EditorError[] = newErrors.map((err) => ({
      ...err,
      id: `${err.category}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }));
    
    const allErrors = [...filteredErrors, ...mappedNewErrors];
    set({ 
      errors: allErrors,
      showErrorPanel: allErrors.length > 0 ? true : get().showErrorPanel
    });
  },

  clearErrors: () => set({ errors: [] }),

  removeError: (id) => {
    set({ errors: get().errors.filter((err) => err.id !== id) });
  },

  setShowErrorPanel: (showErrorPanel) => set({ showErrorPanel }),
}));
