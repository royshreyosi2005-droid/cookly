import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useShoppingList } from '../context/ShoppingListContext';
import { Button } from '../components/common/Button';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_STAPLES = [
  { name: 'Eggs', amount: '6 pcs', category: 'Dairy' },
  { name: 'Whole Milk', amount: '1 L', category: 'Dairy' },
  { name: 'Fresh Tomatoes', amount: '4 pcs', category: 'Produce' },
  { name: 'Garlic Bulbs', amount: '2 heads', category: 'Produce' },
  { name: 'Red Onions', amount: '3 pcs', category: 'Produce' },
  { name: 'Olive Oil', amount: '500 ml', category: 'Pantry' },
  { name: 'Basmati Rice', amount: '1 kg', category: 'Pantry' },
  { name: 'Pasta', amount: '500 g', category: 'Pantry' }
];

const UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'bunch', 'tbsp', 'cup', 'pack', 'can'];
const CATEGORIES = ['Produce', 'Dairy', 'Pantry', 'Proteins', 'Bakery', 'General'];

export const ShoppingListPage: React.FC = () => {
  const {
    items,
    addItem,
    toggleItem,
    removeItem,
    clearCompleted,
    clearAll,
    remainingCount,
    completedCount,
    totalCount,
    progressPercentage
  } = useShoppingList();

  const [inputName, setInputName] = useState('');
  const [inputAmount, setInputAmount] = useState('1');
  const [inputUnit, setInputUnit] = useState('pcs');
  const [inputCategory, setInputCategory] = useState('Produce');
  const [showPurchased, setShowPurchased] = useState(true);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const formattedAmount = `${inputAmount.trim()} ${inputUnit}`.trim();
    addItem(inputName.trim(), formattedAmount, inputUnit, inputCategory);
    setInputName('');
    setInputAmount('1');
  };

  const pendingItems = items.filter(item => !item.checked);
  const purchasedItems = items.filter(item => item.checked);

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-border-theme shadow-card">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary text-white flex items-center justify-center shadow-card">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Shopping List
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-muted font-medium">
              Keep track of missing ingredients and kitchen staples for effortless grocery runs.
            </p>
          </div>

          {/* Quick Progress Banner */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:items-end min-w-[220px] bg-bg-secondary p-3.5 rounded-2xl border border-border-theme">
              <div className="flex items-center justify-between w-full text-xs font-bold text-text-primary mb-1.5">
                <span>{remainingCount} {remainingCount === 1 ? 'item' : 'items'} remaining</span>
                <span className="text-accent-primary">{progressPercentage}% done</span>
              </div>
              <div className="w-full bg-border-theme h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-color-accent to-color-secondary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (List + Quick Input) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Add Item Form Bar */}
            <form onSubmit={handleAddItem} className="bg-surface-card p-3.5 sm:p-4 rounded-3xl border border-border-theme shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-grow w-full">
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Add ingredient (e.g. Tomatoes, Olive Oil, Paneer)..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="Qty"
                    className="w-16 px-2.5 py-2.5 text-center rounded-2xl border border-border-theme bg-bg-secondary text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                  />

                  <select
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value)}
                    className="px-2.5 py-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-xs font-bold text-text-primary focus:outline-none"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>

                  <select
                    value={inputCategory}
                    onChange={(e) => setInputCategory(e.target.value)}
                    className="hidden sm:block px-2.5 py-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-xs font-bold text-text-primary focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <Button
                    type="submit"
                    variant="spice"
                    size="md"
                    className="rounded-2xl shrink-0 min-h-[44px] shadow-xs px-4"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="text-xs sm:text-sm font-bold">Add</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* Empty State */}
            {totalCount === 0 ? (
              <div className="bg-surface-card rounded-3xl border border-border-theme p-8 text-center space-y-4 shadow-card">
                <div className="w-16 h-16 rounded-3xl bg-bg-secondary text-text-muted flex items-center justify-center mx-auto shadow-2xs">
                  <ShoppingBag className="w-8 h-8 opacity-60 text-text-muted" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="font-serif text-lg font-bold text-text-primary">Your Shopping List is Empty</h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Add missing ingredients directly from any recipe card, or tap quick staples below to fill your checklist.
                  </p>
                </div>

                {/* Quick Add Suggestions Grid */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-3">
                    Tap to Quick Add Common Staples:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                    {QUICK_STAPLES.map((staple) => (
                      <button
                        key={staple.name}
                        onClick={() => addItem(staple.name, staple.amount, 'pcs', staple.category)}
                        className="px-3.5 py-2 rounded-2xl bg-bg-secondary hover:bg-accent-soft text-text-primary hover:text-accent-primary border border-border-theme hover:border-accent-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{staple.name}</span>
                        <span className="text-[10px] text-text-muted">({staple.amount})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Items Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <span>To Buy</span>
                      <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent-primary text-[10px] font-extrabold">
                        {pendingItems.length}
                      </span>
                    </h3>
                  </div>

                  {pendingItems.length === 0 ? (
                    <div className="p-6 bg-color-secondary-soft border border-color-secondary/25 rounded-3xl text-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-color-secondary mx-auto" />
                      <p className="text-xs font-bold text-color-secondary">All caught up! No items to buy.</p>
                      <p className="text-[11px] text-text-muted">Check completed items below or add new ingredients.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-surface-card border border-border-theme hover:border-border-strong shadow-2xs transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleItem(item.id)}
                              aria-label={`Mark ${item.name} as purchased`}
                              className="w-7 h-7 rounded-xl border-2 border-border-strong hover:border-accent-primary bg-bg-secondary hover:bg-accent-soft flex items-center justify-center transition-all shrink-0 touch-manipulation shadow-2xs"
                            >
                              {item.checked && <Check className="w-4 h-4 text-white bg-accent-primary rounded-lg" />}
                            </button>

                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-text-primary block truncate">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                {item.category && (
                                  <span className="text-[10px] font-semibold text-text-muted bg-bg-secondary px-2 py-0.2 rounded-md">
                                    {item.category}
                                  </span>
                                )}
                                {item.recipeSource && (
                                  <span className="text-[10px] text-accent-primary bg-accent-soft px-1.5 py-0.2 rounded-md font-medium truncate max-w-[150px]">
                                    from: {item.recipeSource}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-xs font-extrabold text-text-primary bg-bg-secondary px-2.5 py-1 rounded-xl border border-border-theme">
                              {item.amount}
                            </span>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="w-8 h-8 rounded-xl text-text-muted hover:text-status-error hover:bg-status-error/10 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Purchased / Completed Section */}
                {purchasedItems.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPurchased(!showPurchased)}
                      className="flex items-center justify-between w-full px-1 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-color-secondary" />
                        <span>Purchased Items ({purchasedItems.length})</span>
                      </div>
                      {showPurchased ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showPurchased && (
                      <div className="space-y-2">
                        {purchasedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-color-secondary-soft border border-color-secondary/20 shadow-2xs opacity-80 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleItem(item.id)}
                                aria-label={`Uncheck ${item.name}`}
                                className="w-7 h-7 rounded-xl bg-color-secondary text-white flex items-center justify-center transition-colors shrink-0 touch-manipulation"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>

                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-text-secondary line-through block truncate">
                                  {item.name}
                                </span>
                                {item.recipeSource && (
                                  <span className="text-[10px] text-text-muted block truncate">
                                    from: {item.recipeSource}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span className="text-xs font-bold text-text-muted bg-surface-card px-2.5 py-1 rounded-xl border border-color-secondary/20 line-through">
                                {item.amount}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                                className="w-8 h-8 rounded-xl text-text-muted hover:text-status-error hover:bg-status-error/10 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side Panel (Desktop Overview & Quick Tools) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Actions Card */}
            <div className="bg-surface-card p-5 rounded-3xl border border-border-theme shadow-card space-y-4">
              <h3 className="font-serif text-base font-bold text-text-primary flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent-primary" />
                <span>List Summary</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-bg-secondary rounded-2xl border border-border-theme">
                  <span className="block text-xl font-bold text-text-primary">{remainingCount}</span>
                  <span className="text-[11px] font-semibold text-text-muted uppercase">To Buy</span>
                </div>
                <div className="p-3 bg-herb-500/10 rounded-2xl border border-herb-500/20">
                  <span className="block text-xl font-bold text-status-success">{completedCount}</span>
                  <span className="text-[11px] font-semibold text-status-success uppercase">Purchased</span>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="space-y-2 pt-1 border-t border-border-theme">
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={clearCompleted}
                    className="w-full py-2.5 px-3 rounded-2xl border border-border-theme text-text-primary hover:bg-bg-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                    <span>Clear Completed ({completedCount})</span>
                  </button>
                )}

                {totalCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="w-full py-2.5 px-3 rounded-2xl border border-status-error/30 text-status-error hover:bg-status-error/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear All Items</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Staples Card */}
            <div className="bg-surface-card p-5 rounded-3xl border border-border-theme shadow-card space-y-3.5">
              <h4 className="font-serif text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-primary" />
                <span>Quick Add Essentials</span>
              </h4>
              <p className="text-xs text-text-muted">
                Tap to quickly append standard kitchen staples to your shopping checklist.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_STAPLES.map((staple) => (
                  <button
                    key={staple.name}
                    type="button"
                    onClick={() => addItem(staple.name, staple.amount, 'pcs', staple.category)}
                    className="px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-accent-soft text-text-primary hover:text-accent-primary border border-border-theme text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-text-muted" />
                    <span>{staple.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Next Step Link */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-accent-primary/10 via-bg-secondary to-herb-500/10 border border-border-theme text-center space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Ready to Cook?
              </h4>
              <p className="text-xs text-text-secondary">
                Explore recipes matching the ingredients you already have in stock.
              </p>
              <Link
                to="/pantry"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:text-accent-hover mt-1"
              >
                <span>Go to My Pantry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
