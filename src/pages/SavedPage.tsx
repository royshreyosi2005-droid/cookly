import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { RecipeDetailModal } from '../components/recipe/RecipeDetailModal';
import { EmptyState } from '../components/common/EmptyState';
import { usePantry } from '../context/PantryContext';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SavedPage: React.FC = () => {
  const { savedRecipes, selectedRecipe, setSelectedRecipe } = usePantry();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-7">
        {/* Header */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-primary bg-accent-soft px-3 py-1 rounded-full shadow-2xs border border-accent-primary/20">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Personal Collection</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            My Saved Cookbook
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed max-w-xl">
            Recipes you've bookmarked for easy reference. Match scores automatically update based on your selected pantry ingredients.
          </p>
        </div>

        {/* Saved Grid or Empty State */}
        {savedRecipes.length === 0 ? (
          <EmptyState
            type="saved"
            onAction={() => navigate('/discover')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {savedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(selected) => setSelectedRecipe(selected)}
              />
            ))}
          </div>
        )}
      </div>

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </PageContainer>
  );
};

