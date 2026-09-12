import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile, CookingHistoryItem, Recipe } from '../types';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  togglePreference: (type: 'foodPreferences' | 'dietaryPreferences' | 'nutritionGoals', value: string) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  cookingHistory: CookingHistoryItem[];
  addCookingHistory: (recipe: Recipe) => void;
  clearCookingHistory: () => void;
  syncWithBackend: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = 'cookly_guest_profile_v1';
const HISTORY_STORAGE_KEY = 'cookly_guest_cooking_history_v1';

const INITIAL_PROFILE: UserProfile = {
  id: 'guest-cookly',
  name: 'Alex Morgan',
  email: 'alex.culinary@cookly.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Home chef & nutrition enthusiast. Passionate about quick, protein-dense weeknight dinners.',
  skillLevel: 'Intermediate',
  memberSince: 'January 2026',
  foodPreferences: ['High-protein', 'Quick Meals', 'Balanced', 'Comfort Food'],
  dietaryPreferences: ['Dairy-Free', 'High-Protein'],
  nutritionGoals: ['High Protein (25g+/meal)', 'High Fiber (6g+/meal)', 'Calorie Smart (<450 kcal)'],
  allergies: ['Peanuts', 'Excess Sodium'],
  defaultServings: 2,
  maxCookTimeMinutes: 30
};

const INITIAL_COOKING_HISTORY: CookingHistoryItem[] = [
  {
    id: 'hist-1',
    recipeId: 'recipe-1',
    recipeName: 'High-Protein Egg Potato Bowl',
    recipeImage: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
    cookedAt: '2 days ago',
    servings: 2,
    rating: 5
  },
  {
    id: 'hist-2',
    recipeId: 'recipe-2',
    recipeName: '20-Min Golden Egg & Jeera Rice Skillet',
    recipeImage: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
    cookedAt: '4 days ago',
    servings: 2,
    rating: 5
  }
];

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, preferences, token, isAuthenticated, updateProfile: authUpdateProfile, updatePreferences: authUpdatePrefs, refreshUser } = useAuth();

  const [guestProfile, setGuestProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_PROFILE;
  });

  const [cookingHistory, setCookingHistory] = useState<CookingHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_COOKING_HISTORY;
  });

  // Sync cooking history from backend when authenticated
  const syncWithBackend = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          if (data.data.length > 0) {
            setCookingHistory(data.data);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch cooking history from backend:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // Persist guest profile to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(guestProfile));
      } catch (e) {
        console.warn('Failed to save guest profile to localStorage:', e);
      }
    }
  }, [guestProfile, isAuthenticated]);

  // Persist guest history to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(cookingHistory));
      } catch (e) {
        console.warn('Failed to save history to localStorage:', e);
      }
    }
  }, [cookingHistory, isAuthenticated]);

  // Active composite profile
  const profile: UserProfile = useMemo(() => {
    if (isAuthenticated && user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: user.bio,
        skillLevel: user.skillLevel,
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
        foodPreferences: preferences?.foodPreferences || [],
        dietaryPreferences: preferences?.dietaryPreferences || [],
        nutritionGoals: preferences?.nutritionGoals || [],
        allergies: preferences?.allergies || [],
        defaultServings: preferences?.defaultServings || 2,
        maxCookTimeMinutes: preferences?.maxCookTimeMinutes || 30
      };
    }
    return guestProfile;
  }, [isAuthenticated, user, preferences, guestProfile]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (isAuthenticated) {
      authUpdateProfile({
        name: updates.name,
        avatarUrl: updates.avatarUrl,
        bio: updates.bio,
        skillLevel: updates.skillLevel
      }).catch(console.warn);

      if (updates.defaultServings !== undefined || updates.maxCookTimeMinutes !== undefined) {
        authUpdatePrefs({
          defaultServings: updates.defaultServings,
          maxCookTimeMinutes: updates.maxCookTimeMinutes
        }).catch(console.warn);
      }
    } else {
      setGuestProfile(prev => ({ ...prev, ...updates }));
    }
  }, [isAuthenticated, authUpdateProfile, authUpdatePrefs]);

  const togglePreference = useCallback((
    type: 'foodPreferences' | 'dietaryPreferences' | 'nutritionGoals',
    value: string
  ) => {
    if (isAuthenticated && preferences) {
      const list = preferences[type] || [];
      const exists = list.includes(value);
      const updatedList = exists
        ? list.filter(item => item !== value)
        : [...list, value];

      authUpdatePrefs({ [type]: updatedList }).catch(console.warn);
    } else {
      setGuestProfile(prev => {
        const list = prev[type] || [];
        const exists = list.includes(value);
        const updatedList = exists
          ? list.filter(item => item !== value)
          : [...list, value];
        return { ...prev, [type]: updatedList };
      });
    }
  }, [isAuthenticated, preferences, authUpdatePrefs]);

  const addAllergy = useCallback((allergy: string) => {
    const trimmed = allergy.trim();
    if (!trimmed) return;

    if (isAuthenticated && preferences) {
      if (!preferences.allergies.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
        authUpdatePrefs({ allergies: [...preferences.allergies, trimmed] }).catch(console.warn);
      }
    } else {
      setGuestProfile(prev => {
        if (prev.allergies.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
          return prev;
        }
        return { ...prev, allergies: [...prev.allergies, trimmed] };
      });
    }
  }, [isAuthenticated, preferences, authUpdatePrefs]);

  const removeAllergy = useCallback((allergy: string) => {
    if (isAuthenticated && preferences) {
      const updated = preferences.allergies.filter(a => a.toLowerCase() !== allergy.toLowerCase());
      authUpdatePrefs({ allergies: updated }).catch(console.warn);
    } else {
      setGuestProfile(prev => ({
        ...prev,
        allergies: prev.allergies.filter(a => a.toLowerCase() !== allergy.toLowerCase())
      }));
    }
  }, [isAuthenticated, preferences, authUpdatePrefs]);

  const addCookingHistory = useCallback((recipe: Recipe) => {
    const newItem: CookingHistoryItem = {
      id: `hist-${Date.now()}`,
      recipeId: recipe.id,
      recipeName: recipe.name || recipe.title,
      recipeImage: recipe.image || recipe.imageUrl || '',
      cookedAt: 'Just now',
      servings: recipe.servings || 2,
      rating: 5
    };

    setCookingHistory(prev => [newItem, ...prev]);

    if (token) {
      fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          recipeName: recipe.name || recipe.title,
          recipeImage: recipe.image || recipe.imageUrl || '',
          servings: recipe.servings || 2,
          rating: 5,
          source: recipe.source || ''
        })
      }).then(() => refreshUser()).catch(console.warn);
    }
  }, [token, refreshUser]);

  const clearCookingHistory = useCallback(() => {
    setCookingHistory([]);

    if (token) {
      fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(() => refreshUser()).catch(console.warn);
    }
  }, [token, refreshUser]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        togglePreference,
        addAllergy,
        removeAllergy,
        cookingHistory,
        addCookingHistory,
        clearCookingHistory,
        syncWithBackend
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
