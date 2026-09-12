import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Pro Home Cook';
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  foodPreferences: string[];
  dietaryPreferences: string[];
  nutritionGoals: string[];
  allergies: string[];
  foodsToAvoid: string[];
  cookingSkill: string;
  preferredCuisines: string[];
  preferredMealTypes: string[];
  defaultServings: number;
  maxCookTimeMinutes: number;
  updatedAt: string;
}

export interface UserStats {
  savedCount: number;
  pantryCount: number;
  shoppingListCount: number;
  cookingHistoryCount: number;
}

interface AuthContextType {
  user: AuthUser | null;
  preferences: UserPreferences | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  stats: UserStats;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authPromptMessage: string | null;
  openAuthModal: (mode?: 'login' | 'signup', promptMessage?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'cookly_auth_token_v1';
const USER_KEY = 'cookly_auth_user_v1';
const PREFS_KEY = 'cookly_auth_prefs_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences | null>(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState<UserStats>({
    savedCount: 0,
    pantryCount: 0,
    shoppingListCount: 0,
    cookingHistoryCount: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login', promptMessage?: string) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(promptMessage || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
  }, []);

  // Fetch current user from /api/auth/me
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      setUser(null);
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user);
          setPreferences(json.data.preferences);
          if (json.data.stats) {
            setStats(json.data.stats);
          }
          localStorage.setItem(USER_KEY, JSON.stringify(json.data.user));
          localStorage.setItem(PREFS_KEY, JSON.stringify(json.data.preferences));
        }
      } else if (res.status === 401) {
        // Token expired
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PREFS_KEY);
        setToken(null);
        setUser(null);
        setPreferences(null);
      }
    } catch (err) {
      console.warn('Unable to verify user session with backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    const { user: authedUser, preferences: userPrefs, token: newToken } = data.data;
    setToken(newToken);
    setUser(authedUser);
    setPreferences(userPrefs);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authedUser));
    localStorage.setItem(PREFS_KEY, JSON.stringify(userPrefs));
    closeAuthModal();
    await refreshUser();
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'Signup failed');
    }

    const { user: authedUser, preferences: userPrefs, token: newToken } = data.data;
    setToken(newToken);
    setUser(authedUser);
    setPreferences(userPrefs);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authedUser));
    localStorage.setItem(PREFS_KEY, JSON.stringify(userPrefs));
    closeAuthModal();
    await refreshUser();
  };

  const logout = () => {
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PREFS_KEY);
    setToken(null);
    setUser(null);
    setPreferences(null);
    setStats({
      savedCount: 0,
      pantryCount: 0,
      shoppingListCount: 0,
      cookingHistoryCount: 0
    });
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!token) return;
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setUser(data.data);
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    } else {
      throw new Error(data.error?.message || 'Failed to update profile');
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!token) return;
    const res = await fetch('/api/profile/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setPreferences(data.data);
      localStorage.setItem(PREFS_KEY, JSON.stringify(data.data));
    } else {
      throw new Error(data.error?.message || 'Failed to update preferences');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        stats,
        login,
        signup,
        logout,
        updateProfile,
        updatePreferences,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        authPromptMessage,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
