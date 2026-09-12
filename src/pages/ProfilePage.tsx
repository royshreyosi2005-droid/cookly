import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useProfile } from '../context/ProfileContext';
import { usePantry } from '../context/PantryContext';
import { useShoppingList } from '../context/ShoppingListContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import {
  ChefHat,
  Sparkles,
  Bookmark,
  ShoppingCart,
  Clock,
  Users,
  Settings,
  ShieldAlert,
  Flame,
  Plus,
  X,
  History,
  ArrowRight,
  Edit3,
  Heart,
  Award,
  Sun,
  Moon,
  Monitor,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AVAILABLE_FOOD_PREFS = [
  'High-protein',
  'Quick Meals',
  'Balanced',
  'Comfort Food',
  'Low-calorie',
  'Vegetarian',
  'Meal Prep Friendly'
];

const AVAILABLE_DIETARY_PREFS = [
  'Dairy-Free',
  'Gluten-Free',
  'Vegan',
  'Nut-Free',
  'Halal',
  'Low Sodium',
  'Keto'
];

const AVAILABLE_NUTRITION_GOALS = [
  { label: 'High Protein (25g+/meal)', desc: 'Optimized for muscle maintenance & satiety', icon: Flame },
  { label: 'High Fiber (6g+/meal)', desc: 'Supports gut health & stable digestion', icon: Heart },
  { label: 'Calorie Smart (<450 kcal)', desc: 'Portion-controlled nutrient density', icon: Award },
  { label: 'Low Added Sugar', desc: 'Naturally sweetened whole foods', icon: Sparkles }
];

export const ProfilePage: React.FC = () => {
  const {
    profile,
    togglePreference,
    addAllergy,
    removeAllergy,
    cookingHistory
  } = useProfile();

  const { savedRecipeIds } = usePantry();
  const { totalCount: shoppingCount } = useShoppingList();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, logout, openAuthModal } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newAllergyInput, setNewAllergyInput] = useState('');

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergyInput.trim()) {
      addAllergy(newAllergyInput.trim());
      setNewAllergyInput('');
    }
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Identity Card & Quick Stats */}
          <div className="lg:col-span-4 space-y-5">
            {/* Identity Card */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-6 shadow-card text-center sm:text-left space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-bg-secondary shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent-primary text-white flex items-center justify-center border-2 border-surface-card shadow-xs">
                    <ChefHat className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-accent-soft text-accent-primary text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-accent-primary/20">
                    {profile.skillLevel}
                  </div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-text-primary leading-tight">
                    {profile.name}
                  </h1>
                  <p className="text-xs text-text-muted font-medium">
                    {profile.email}
                  </p>
                </div>
              </div>

              {profile.bio && (
                <p className="text-xs sm:text-sm text-text-secondary bg-bg-secondary/70 p-3 rounded-2xl border border-border-theme leading-relaxed italic">
                  "{profile.bio}"
                </p>
              )}

              {/* Edit Profile Action */}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-bg-secondary hover:bg-surface-hover text-text-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-border-theme"
              >
                <Edit3 className="w-4 h-4 text-accent-primary" />
                <span>Edit Profile</span>
              </button>

              {/* Quick Stats Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-theme text-center">
                <Link
                  to="/saved"
                  className="p-2.5 rounded-2xl bg-bg-secondary hover:bg-accent-soft transition-colors border border-border-theme group"
                >
                  <span className="block text-lg font-bold text-text-primary group-hover:text-accent-primary">
                    {savedRecipeIds.length}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-text-muted">Saved</span>
                </Link>

                <div className="p-2.5 rounded-2xl bg-bg-secondary border border-border-theme">
                  <span className="block text-lg font-bold text-status-success">
                    {cookingHistory.length}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-text-muted">Cooked</span>
                </div>

                <Link
                  to="/shopping-list"
                  className="p-2.5 rounded-2xl bg-bg-secondary hover:bg-accent-soft transition-colors border border-border-theme group"
                >
                  <span className="block text-lg font-bold text-text-primary group-hover:text-accent-primary">
                    {shoppingCount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-text-muted">List</span>
                </Link>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-5 shadow-card space-y-3 transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Quick Shortcuts
              </h3>

              <div className="space-y-1.5">
                <Link
                  to="/shopping-list"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-bg-secondary border border-transparent hover:border-border-theme text-xs sm:text-sm font-semibold text-text-primary transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-primary flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <span>Shopping List</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-primary">
                    <span className="text-xs font-bold">{shoppingCount} items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>

                <Link
                  to="/saved"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-bg-secondary border border-transparent hover:border-border-theme text-xs sm:text-sm font-semibold text-text-primary transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-color-highlight-soft text-color-highlight flex items-center justify-center">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <span>Saved Cookbook</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-primary">
                    <span className="text-xs font-bold">{savedRecipeIds.length} recipes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>

                <Link
                  to="/pantry"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-bg-secondary border border-transparent hover:border-border-theme text-xs sm:text-sm font-semibold text-text-primary transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-color-secondary-soft text-color-secondary flex items-center justify-center">
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <span>Pantry Ingredients</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Preferences, Nutrition, Allergies, History & Settings */}
          <div className="lg:col-span-8 space-y-6">
            {/* Food & Dietary Preferences Card */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-5 sm:p-6 shadow-card space-y-5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-text-primary">
                    Food & Culinary Preferences
                  </h2>
                </div>
                <span className="text-[11px] text-text-muted font-medium">Tap to toggle</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Meal & Cooking Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FOOD_PREFS.map((pref) => {
                      const isSelected = profile.foodPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference('foodPreferences', pref)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-accent-primary text-white border-accent-primary shadow-xs'
                              : 'bg-bg-secondary text-text-primary border-border-theme hover:bg-surface-hover'
                          }`}
                        >
                          {isSelected ? `✓ ${pref}` : `+ ${pref}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-border-theme">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Dietary Focus & Restrictions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_DIETARY_PREFS.map((diet) => {
                      const isSelected = profile.dietaryPreferences.includes(diet);
                      return (
                        <button
                          key={diet}
                          type="button"
                          onClick={() => togglePreference('dietaryPreferences', diet)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-color-secondary text-white border-color-secondary shadow-xs'
                              : 'bg-bg-secondary text-text-primary border-border-theme hover:bg-surface-hover'
                          }`}
                        >
                          {isSelected ? `✓ ${diet}` : `+ ${diet}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition & Wellness Goals */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-5 sm:p-6 shadow-card space-y-4 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-color-secondary-soft text-color-secondary flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h2 className="font-serif text-lg font-bold text-text-primary">
                  Nutrition & Health Goals
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_NUTRITION_GOALS.map((goal) => {
                  const isSelected = profile.nutritionGoals.includes(goal.label);
                  return (
                    <button
                      key={goal.label}
                      type="button"
                      onClick={() => togglePreference('nutritionGoals', goal.label)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-color-secondary-soft border-color-secondary ring-1 ring-color-secondary/30 shadow-2xs'
                          : 'bg-bg-secondary border-border-theme hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-1.5">
                          <goal.icon className="w-3.5 h-3.5 text-color-secondary" />
                          {goal.label}
                        </span>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-color-secondary text-white' : 'bg-bg-secondary border border-border-theme text-text-muted'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-normal">
                        {goal.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies & Foods to Avoid */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-5 sm:p-6 shadow-card space-y-4 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-color-highlight-soft text-color-highlight flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-text-primary">
                    Allergies & Foods to Avoid
                  </h2>
                  <p className="text-xs text-text-muted">
                    AI Chef and recipe match engines will prioritize excluding these ingredients.
                  </p>
                </div>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-color-highlight-soft text-color-highlight border border-color-highlight/25 text-xs font-bold"
                  >
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy)}
                      aria-label={`Remove ${allergy}`}
                      className="w-4 h-4 rounded-full hover:bg-color-highlight/20 text-color-highlight flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Allergy Input */}
              <form onSubmit={handleAddAllergy} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  placeholder="Add allergen or food to avoid (e.g. Shellfish, Mushrooms)..."
                  className="flex-grow px-4 py-2 rounded-2xl border border-border-theme bg-bg-secondary text-xs sm:text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-color-highlight/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Cooking History */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-5 sm:p-6 shadow-card space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-bg-secondary text-text-secondary flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-text-primary">
                    Recent Cooking History
                  </h2>
                </div>
                <span className="text-xs font-bold text-text-muted">
                  {cookingHistory.length} dishes logged
                </span>
              </div>

              <div className="space-y-2.5">
                {cookingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-bg-secondary/60 border border-border-theme hover:border-border-strong transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.recipeImage}
                        alt={item.recipeName}
                        className="w-12 h-12 rounded-xl object-cover border border-border-theme shrink-0"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                          {item.recipeName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                          <span>Cooked {item.cookedAt}</span>
                          <span>•</span>
                          <span>{item.servings} Servings</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-color-highlight bg-color-highlight-soft px-2 py-1 rounded-lg border border-color-highlight/25">
                      ★ {item.rating || 5}.0
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Defaults / Settings & Appearance */}
            <div className="bg-surface-card rounded-3xl border border-border-theme p-5 sm:p-6 shadow-card space-y-5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-bg-secondary text-text-secondary flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="font-serif text-lg font-bold text-text-primary">
                  App Defaults & Cooking Settings
                </h2>
              </div>

              {/* Appearance & Theme Selector */}
              <div className="p-4 rounded-2xl bg-bg-secondary/70 border border-border-theme space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent-primary flex items-center justify-center">
                      {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-accent-primary" /> : <Monitor className="w-3.5 h-3.5 text-status-success" />}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-text-primary">
                        Appearance & Theme
                      </h3>
                      <p className="text-[11px] text-text-secondary">
                        {theme === 'system' ? `Auto-syncing with OS preference (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})` : `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode active`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-1.5 bg-surface-card rounded-2xl border border-border-theme">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-accent-primary text-white shadow-card ring-2 ring-accent-soft'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-white' : 'text-amber-500'}`} />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-accent-primary text-white shadow-card ring-2 ring-accent-soft'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-accent-primary'}`} />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      theme === 'system'
                        ? 'bg-color-secondary text-white shadow-card ring-2 ring-color-secondary-soft'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Monitor className={`w-4 h-4 ${theme === 'system' ? 'text-white' : 'text-status-success'}`} />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Account & Sync Status */}
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAuthenticated ? 'bg-status-success/15 text-status-success' : 'bg-accent-soft text-accent-primary'}`}>
                    {isAuthenticated ? <UserCheck className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                      {isAuthenticated ? 'Persistent Cloud Sync Active' : 'Guest Mode'}
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      {isAuthenticated ? `Logged in as ${profile.email}` : 'Sign in to sync your pantry, recipes & shopping list'}
                    </p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-status-error/10 hover:bg-status-error/20 text-status-error text-xs font-bold transition-colors border border-status-error/25 self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors shadow-xs self-start sm:self-auto"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-bg-secondary border border-border-theme space-y-1">
                  <div className="flex items-center text-text-muted text-xs font-bold uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Default Portions
                  </div>
                  <p className="text-sm font-bold text-text-primary">
                    {profile.defaultServings} {profile.defaultServings === 1 ? 'Person' : 'People'}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Used to auto-scale ingredients in AI Chef and recipe calculations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bg-secondary border border-border-theme space-y-1">
                  <div className="flex items-center text-text-muted text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Max Cooking Time
                  </div>
                  <p className="text-sm font-bold text-text-primary">
                    {profile.maxCookTimeMinutes} minutes
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Default threshold for Quick & Easy recipe recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </PageContainer>
  );
};
