import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ShoppingListItem, Recipe } from '../types';
import { useAuth } from './AuthContext';

interface ShoppingListContextType {
  items: ShoppingListItem[];
  addItem: (name: string, amount?: string, unit?: string, category?: string, recipeSource?: string) => void;
  addMultipleItems: (newItems: { name: string; amount?: string; unit?: string; category?: string; recipeSource?: string }[]) => void;
  addMissingFromRecipe: (recipe: Recipe) => number;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingListItem>) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  remainingCount: number;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  syncWithBackend: () => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const STORAGE_KEY = 'cookly_guest_shopping_list_v1';

const INITIAL_SHOPPING_ITEMS: ShoppingListItem[] = [
  {
    id: 'shop-1',
    name: 'Tomatoes',
    amount: '2 medium',
    quantity: 2,
    unit: 'pcs',
    category: 'Produce',
    checked: false,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'shop-2',
    name: 'Fresh Coriander',
    amount: '1 bunch',
    quantity: 1,
    unit: 'bunch',
    category: 'Produce',
    checked: false,
    createdAt: Date.now() - 3000000
  },
  {
    id: 'shop-3',
    name: 'Parmesan Cheese',
    amount: '100g',
    quantity: 100,
    unit: 'g',
    category: 'Dairy',
    checked: false,
    createdAt: Date.now() - 2400000
  }
];

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, refreshUser } = useAuth();

  const [items, setItems] = useState<ShoppingListItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_SHOPPING_ITEMS;
  });

  const syncWithBackend = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/shopping-list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          if (data.data.length > 0) {
            setItems(data.data);
          } else if (items.length > 0) {
            // First time sync guest list to server
            await fetch('/api/shopping-list/batch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                items: items.map(i => ({
                  name: i.name,
                  amount: i.amount,
                  quantity: i.quantity,
                  unit: i.unit,
                  category: i.category,
                  recipeSource: i.recipeSource
                }))
              })
            });
            const refreshed = await fetch('/api/shopping-list', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const refData = await refreshed.json();
            if (refData.success && Array.isArray(refData.data)) {
              setItems(refData.data);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to sync shopping list with backend:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // Persist guest list to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save guest shopping list:', e);
      }
    }
  }, [items, isAuthenticated]);

  const addItem = useCallback((name: string, amount = '1', unit = 'pcs', category = 'General', recipeSource?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (token) {
      fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formatted,
          amount,
          unit,
          category,
          recipeSource
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setItems(prev => [data.data, ...prev.filter(i => i.id !== data.data.id)]);
            refreshUser();
          }
        })
        .catch(console.warn);
    } else {
      setItems(prev => {
        const existingIndex = prev.findIndex(item => item.name.toLowerCase() === formatted.toLowerCase());
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            checked: false,
            amount: amount || updated[existingIndex].amount,
            recipeSource: recipeSource || updated[existingIndex].recipeSource
          };
          return updated;
        }

        const newItem: ShoppingListItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: formatted,
          amount,
          quantity: 1,
          unit,
          category,
          checked: false,
          recipeSource,
          createdAt: Date.now()
        };
        return [newItem, ...prev];
      });
    }
  }, [token, refreshUser]);

  const addMultipleItems = useCallback((newItems: { name: string; amount?: string; unit?: string; category?: string; recipeSource?: string }[]) => {
    if (newItems.length === 0) return;

    if (token) {
      fetch('/api/shopping-list/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: newItems })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setItems(data.data);
            refreshUser();
          }
        })
        .catch(console.warn);
    } else {
      setItems(prev => {
        const next = [...prev];
        newItems.forEach(item => {
          const trimmed = item.name.trim();
          if (!trimmed) return;
          const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          const existingIndex = next.findIndex(i => i.name.toLowerCase() === formatted.toLowerCase());

          if (existingIndex > -1) {
            next[existingIndex] = {
              ...next[existingIndex],
              checked: false,
              amount: item.amount || next[existingIndex].amount,
              recipeSource: item.recipeSource || next[existingIndex].recipeSource
            };
          } else {
            next.unshift({
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: formatted,
              amount: item.amount || '1',
              quantity: 1,
              unit: item.unit || 'pcs',
              category: item.category || 'General',
              checked: false,
              recipeSource: item.recipeSource,
              createdAt: Date.now()
            });
          }
        });
        return next;
      });
    }
  }, [token, refreshUser]);

  const addMissingFromRecipe = useCallback((recipe: Recipe): number => {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) {
      return 0;
    }

    const newItems = recipe.missingIngredients.map(ingName => {
      const fullIng = recipe.ingredients.find(i => i.name.toLowerCase().includes(ingName.toLowerCase()) || ingName.toLowerCase().includes(i.name.toLowerCase()));
      return {
        name: ingName,
        amount: fullIng?.amount || '1 portion',
        unit: fullIng?.unit || 'pcs',
        category: 'Produce',
        recipeSource: recipe.name || recipe.title
      };
    });

    addMultipleItems(newItems);
    return newItems.length;
  }, [addMultipleItems]);

  const toggleItem = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );

    if (token) {
      fetch(`/api/shopping-list/${encodeURIComponent(id)}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => refreshUser())
        .catch(console.warn);
    }
  }, [token, refreshUser]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));

    if (token) {
      fetch(`/api/shopping-list/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => refreshUser())
        .catch(console.warn);
    }
  }, [token, refreshUser]);

  const updateItem = useCallback((id: string, updates: Partial<ShoppingListItem>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setItems(prev => prev.filter(item => !item.checked));

    if (token) {
      fetch('/api/shopping-list/completed', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => refreshUser())
        .catch(console.warn);
    }
  }, [token, refreshUser]);

  const clearAll = useCallback(() => {
    setItems([]);

    if (token) {
      fetch('/api/shopping-list', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => refreshUser())
        .catch(console.warn);
    }
  }, [token, refreshUser]);

  const remainingCount = useMemo(() => items.filter(i => !i.checked).length, [items]);
  const completedCount = useMemo(() => items.filter(i => i.checked).length, [items]);
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        addItem,
        addMultipleItems,
        addMissingFromRecipe,
        toggleItem,
        removeItem,
        updateItem,
        clearCompleted,
        clearAll,
        remainingCount,
        completedCount,
        totalCount,
        progressPercentage,
        syncWithBackend
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};
