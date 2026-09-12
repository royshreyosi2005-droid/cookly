import React from 'react';
import { ChefHat, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-secondary border-t border-border-theme mt-12 sm:mt-20 pt-10 sm:pt-16 pb-28 md:pb-16 text-text-secondary transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 pb-10 border-b border-border-theme">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-accent-primary text-white flex items-center justify-center shadow-card">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-text-primary">
                Cookly<span className="text-accent-primary">.</span>
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              Empowering home chefs to reduce food waste and create restaurant-grade meals using the ingredients right in front of them.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-text-primary tracking-wide uppercase">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-text-secondary">
              <li><Link to="/" className="hover:text-accent-primary transition-colors py-1 inline-block">Pantry Matcher</Link></li>
              <li><Link to="/discover" className="hover:text-accent-primary transition-colors py-1 inline-block">Global Recipe Discovery</Link></li>
              <li><Link to="/healthy-picks" className="hover:text-color-secondary transition-colors py-1 inline-block">Healthy & Macro Picks</Link></li>
              <li><Link to="/ai-chef" className="hover:text-accent-primary transition-colors py-1 inline-block">AI Budget Chef</Link></li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-text-primary tracking-wide uppercase">
              Kitchen Tools
            </h4>
            <ul className="space-y-1.5 text-xs font-medium text-text-secondary">
              <li><Link to="/pantry" className="hover:text-accent-primary transition-colors py-1 inline-block">Interactive Pantry</Link></li>
              <li><Link to="/saved" className="hover:text-accent-primary transition-colors py-1 inline-block">My Cookbook</Link></li>
              <li><Link to="/shopping-list" className="hover:text-accent-primary transition-colors py-1 inline-block">Shopping List</Link></li>
              <li><Link to="/profile" className="hover:text-accent-primary transition-colors py-1 inline-block">Chef Profile</Link></li>
            </ul>
          </div>

          {/* Column 4: Culinary ethos */}
          <div className="space-y-2.5 bg-surface-card p-4 sm:p-5 rounded-3xl border border-border-theme shadow-sm">
            <div className="flex items-center gap-2 text-accent-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Culinary Promise</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-serif italic">
              “Every meal begins with whatever is in your fridge. Good cooking is not about having everything — it’s about knowing what to do with what you have.”
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Cookly. All rights reserved.</p>
          <div className="flex items-center gap-1 justify-center">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-accent-primary fill-accent-primary mx-0.5 inline" />
            <span>for passionate home cooks.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

