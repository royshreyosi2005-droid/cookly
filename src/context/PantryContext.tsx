import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Recipe, PantrySearchMode } from '../types';
import { MOCK_RECIPES } from '../data/mockData';
import {
  searchUniversalRecipes,
  calculatePantryMatch,
  parseNaturalLanguagePantry
} from '../services/universalRecipeEngine';
import { useAuth } from './AuthContext';

interface PantryContextType {
  selectedIngredients: string[];
  toggleIngredient: (name: string) => void;
  addIngredient: (name: string) => void;
  addMultipleIngredients: (names: string[]) => void;
  removeIngredient: (name: string) => void;
  clearAllIngredients: () => void;
  parseAndAddFromText: (text: string) => { included: string[]; excluded: string[] };
  pantryMode: PantrySearchMode;
  setPantryMode: (mode: PantrySearchMode) => void;
  pantrySortBy: string;
  setPantrySortBy: (sort: string) => void;
  savedRecipeIds: string[];
  savedRecipes: Recipe[];
  toggleSaveRecipe: (id: string, recipeObj?: Recipe) => void;
  isRecipeSaved: (id: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTagFilter: string;
  setActiveTagFilter: (tag: string) => void;
  recipes: Recipe[];
  pantryRecipes: Recipe[];
  isPantryLoading: boolean;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  enrichRecipe: (recipe: Recipe) => Recipe;
  refreshPantryMatches: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

const LOCAL_PANTRY_KEY = 'cookly_guest_pantry_v2';
const LOCAL_SAVED_KEY = 'cookly_guest_saved_v1';

const INITIAL_PANTRY: string[] = [];

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, refreshUser } = useAuth();

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_PANTRY_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PANTRY;
    } catch {
      return INITIAL_PANTRY;
    }
  });

  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_SAVED_KEY);
      return stored ? JSON.parse(stored) : ['recipe-1'];
    } catch {
      return ['recipe-1'];
    }
  });

  const [savedCustomRecipes, setSavedCustomRecipes] = useState<Record<string, Recipe>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [pantryMode, setPantryMode] = useState<PantrySearchMode>('best_match');
  const [pantrySortBy, setPantrySortBy] = useState<string>('match');
  const [pantryRecipes, setPantryRecipes] = useState<Recipe[]>([]);
  const [isPantryLoading, setIsPantryLoading] = useState<boolean>(false);

  // Sync data from database when authenticated
  const syncWithBackend = useCallback(async () => {
    if (!token) return;

    try {
      // 1. Fetch User Pantry
      const pantryRes = await fetch('/api/user-pantry', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pantryRes.ok) {
        const pData = await pantryRes.json();
        if (pData.success && Array.isArray(pData.data) && pData.data.length > 0) {
          const names = pData.data.map((item: any) => item.ingredient);
          setSelectedIngredients(names);
        } else if (pData.success && Array.isArray(pData.data) && pData.data.length === 0) {
          // If fresh user, populate default pantry on backend
          await fetch('/api/user-pantry/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ingredients: selectedIngredients })
          });
        }
      }

      // 2. Fetch User Saved Recipes
      const savedRes = await fetch('/api/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (savedRes.ok) {
        const sData = await savedRes.json();
        if (sData.success && Array.isArray(sData.data)) {
          const ids = sData.data.map((item: any) => item.recipeId);
          setSavedRecipeIds(ids);

          const customMap: Record<string, Recipe> = {};
          sData.data.forEach((item: any) => {
            if (item.recipeData && item.recipeData.id) {
              customMap[item.recipeId] = item.recipeData;
            }
          });
          setSavedCustomRecipes(prev => ({ ...prev, ...customMap }));
        }
      }
    } catch (err) {
      console.warn('Failed to sync pantry/saved with backend:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // Persist guest pantry to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LOCAL_PANTRY_KEY, JSON.stringify(selectedIngredients));
      } catch {}
    }
  }, [selectedIngredients, isAuthenticated]);

  // Persist guest saved to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(savedRecipeIds));
      } catch {}
    }
  }, [savedRecipeIds, isAuthenticated]);

  const toggleIngredient = (name: string) => {
    const exists = selectedIngredients.some(i => i.toLowerCase() === name.toLowerCase());

    if (exists) {
      removeIngredient(name);
    } else {
      addIngredient(name);
    }
  };

  const addIngredient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (!selectedIngredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedIngredients(prev => [...prev, formatted]);

      if (token) {
        fetch('/api/user-pantry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ingredient: formatted })
        }).then(() => refreshUser()).catch(console.warn);
      }
    }
  };

  const addMultipleIngredients = (names: string[]) => {
    const addedList: string[] = [];
    setSelectedIngredients(prev => {
      const next = [...prev];
      names.forEach(name => {
        const trimmed = name.trim();
        if (trimmed && !next.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
          const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          next.push(formatted);
          addedList.push(formatted);
        }
      });
      return next;
    });

    if (token && addedList.length > 0) {
      fetch('/api/user-pantry/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ingredients: addedList })
      }).then(() => refreshUser()).catch(console.warn);
    }
  };

  const removeIngredient = (name: string) => {
    setSelectedIngredients(prev => prev.filter(i => i.toLowerCase() !== name.toLowerCase()));

    if (token) {
      fetch(`/api/user-pantry/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(() => refreshUser()).catch(console.warn);
    }
  };

  const clearAllIngredients = () => {
    setSelectedIngredients([]);

    if (token) {
      fetch('/api/user-pantry', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(() => refreshUser()).catch(console.warn);
    }
  };

  const parseAndAddFromText = (text: string) => {
    const { included, excluded } = parseNaturalLanguagePantry(text);
    if (included.length > 0) {
      addMultipleIngredients(included);
    }
    return { included, excluded };
  };

  const toggleSaveRecipe = (id: string, recipeObj?: Recipe) => {
    const isCurrentlySaved = savedRecipeIds.includes(id);

    if (isCurrentlySaved) {
      setSavedRecipeIds(prev => prev.filter(rId => rId !== id));

      if (token) {
        fetch(`/api/saved/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => refreshUser()).catch(console.warn);
      }
    } else {
      setSavedRecipeIds(prev => [...prev, id]);
      if (recipeObj) {
        setSavedCustomRecipes(curr => ({ ...curr, [id]: recipeObj }));
      }

      if (token) {
        fetch('/api/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipeId: id,
            recipeTitle: recipeObj?.name || recipeObj?.title || 'Recipe',
            recipeImage: recipeObj?.image || recipeObj?.imageUrl || '',
            source: recipeObj?.source || 'curated',
            recipeData: recipeObj
          })
        }).then(() => refreshUser()).catch(console.warn);
      }
    }
  };

  const isRecipeSaved = (id: string) => savedRecipeIds.includes(id);

  const enrichRecipe = useCallback((recipe: Recipe): Recipe => {
    return calculatePantryMatch(recipe, selectedIngredients);
  }, [selectedIngredients]);

  // Fetch dynamic pantry matches across the universal recipe database
  const refreshPantryMatches = useCallback(async () => {
    setIsPantryLoading(true);
    try {
      const results = await searchUniversalRecipes({
        ingredients: selectedIngredients,
        pantryMode,
        sortBy: pantrySortBy as any,
        userPantry: selectedIngredients
      });
      setPantryRecipes(results);
    } catch (err) {
      console.error('Failed to load universal pantry matches:', err);
    } finally {
      setIsPantryLoading(false);
    }
  }, [selectedIngredients, pantryMode, pantrySortBy]);

  useEffect(() => {
    refreshPantryMatches();
  }, [refreshPantryMatches]);

  // Base fallback recipes for backwards compatibility
  const recipes = useMemo(() => {
    if (pantryRecipes.length > 0) return pantryRecipes;
    return MOCK_RECIPES.map(enrichRecipe).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [pantryRecipes, enrichRecipe]);

  // Saved recipes list combining base recipes and any dynamically saved recipes
  const savedRecipes = useMemo(() => {
    const combinedMap: Record<string, Recipe> = { ...savedCustomRecipes };
    recipes.forEach(r => {
      combinedMap[r.id] = r;
    });

    return savedRecipeIds
      .map(id => combinedMap[id])
      .filter(Boolean)
      .map(enrichRecipe);
  }, [savedRecipeIds, savedCustomRecipes, recipes, enrichRecipe]);

  return (
    <PantryContext.Provider
      value={{
        selectedIngredients,
        toggleIngredient,
        addIngredient,
        addMultipleIngredients,
        removeIngredient,
        clearAllIngredients,
        parseAndAddFromText,
        pantryMode,
        setPantryMode,
        pantrySortBy,
        setPantrySortBy,
        savedRecipeIds,
        savedRecipes,
        toggleSaveRecipe,
        isRecipeSaved,
        searchQuery,
        setSearchQuery,
        activeTagFilter,
        setActiveTagFilter,
        recipes,
        pantryRecipes,
        isPantryLoading,
        selectedRecipe,
        setSelectedRecipe,
        enrichRecipe,
        refreshPantryMatches,
        syncWithBackend
      }}
    >
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
};
