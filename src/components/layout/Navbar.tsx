import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Bookmark, ShoppingBag, Search, Leaf, Sparkles, User } from 'lucide-react';
import { usePantry } from '../../context/PantryContext';
import { useProfile } from '../../context/ProfileContext';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { selectedIngredients, savedRecipeIds } = usePantry();
  const { profile } = useProfile();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'AI Chef', path: '/ai-chef', icon: Sparkles, isHighlight: true },
    { name: 'Discover', path: '/discover', icon: Search },
    { name: 'My Pantry', path: '/pantry', icon: ShoppingBag, count: selectedIngredients.length },
    { name: 'Saved', path: '/saved', icon: Bookmark, count: savedRecipeIds.length }
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-200 w-full pt-safe',
        isScrolled
          ? 'glass-header border-b border-border-theme shadow-card py-2.5 sm:py-3.5'
          : 'bg-bg-primary/80 backdrop-blur-md py-3 sm:py-4 border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group touch-manipulation">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-accent-primary text-white flex items-center justify-center shadow-card group-hover:scale-105 transition-transform duration-200">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-text-primary group-hover:text-accent-primary transition-colors leading-none">
                Cookly<span className="text-accent-primary">.</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-text-muted mt-0.5">
                PANTRY → PLATE AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-bg-secondary p-1.5 rounded-full border border-border-theme">
            <Link
              to="/"
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                location.pathname === '/'
                  ? 'bg-surface-card text-text-primary shadow-card'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              Home
            </Link>

            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-surface-card text-text-primary shadow-card'
                      : link.isHighlight
                      ? 'text-accent-primary hover:text-accent-hover hover:bg-surface-hover font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  )}
                >
                  {link.isHighlight && <Sparkles className="w-3.5 h-3.5 text-accent-primary" />}
                  <span>{link.name}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={cn(
                        'text-[11px] font-bold px-1.5 py-0.2 rounded-full',
                        isActive
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-primary text-text-secondary border border-border-theme'
                      )}
                    >
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Desktop Healthy Picks, Mobile Saved, & Profile Avatar */}
          <div className="flex items-center gap-2">
            {/* Desktop Healthy Picks */}
            <div className="hidden sm:flex items-center">
              <Link
                to="/healthy-picks"
                className={cn(
                  'group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm border cursor-pointer',
                  location.pathname === '/healthy-picks'
                    ? 'bg-color-secondary text-white border-color-secondary shadow-card'
                    : 'bg-color-secondary-soft hover:opacity-90 text-color-secondary border-color-secondary/25 hover:shadow-card'
                )}
              >
                <Leaf className={cn('w-4 h-4 transition-transform group-hover:scale-110', location.pathname === '/healthy-picks' ? 'text-white' : 'text-color-secondary')} />
                <span>Healthy Picks</span>
                <span className={cn(
                  'text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full transition-colors',
                  location.pathname === '/healthy-picks'
                    ? 'bg-white/20 text-white'
                    : 'bg-color-secondary/20 text-color-secondary'
                )}>
                  Diet & Macros
                </span>
              </Link>
            </div>

            {/* Mobile Saved Button */}
            <Link
              to="/saved"
              aria-label="Saved Recipes"
              className={cn(
                'relative flex md:hidden items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl transition-all duration-200 border touch-manipulation',
                location.pathname === '/saved'
                  ? 'bg-accent-primary text-white border-accent-primary shadow-card'
                  : 'bg-surface-card text-text-primary border-border-theme hover:border-border-strong shadow-card'
              )}
            >
              <Bookmark className={cn(
                'w-4 h-4 transition-transform active:scale-90',
                location.pathname === '/saved' ? 'fill-white text-white' : (savedRecipeIds.length > 0 ? 'fill-accent-primary text-accent-primary' : 'text-text-secondary')
              )} />
              {savedRecipeIds.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 shadow-xs bg-accent-primary text-white border-surface-card">
                  {savedRecipeIds.length}
                </span>
              )}
            </Link>

            {/* Profile Avatar Button */}
            <Link
              to="/profile"
              aria-label="Chef Profile"
              className={cn(
                'relative flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl transition-all duration-200 border touch-manipulation overflow-hidden',
                location.pathname === '/profile'
                  ? 'ring-2 ring-accent-primary border-accent-primary shadow-card bg-accent-soft'
                  : 'bg-surface-card border-border-theme hover:border-border-strong shadow-card'
              )}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-7 h-7 rounded-xl object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-text-secondary" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

