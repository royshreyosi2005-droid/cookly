import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { X, ChefHat, Sparkles, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, authPromptMessage, closeAuthModal, login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode with context when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your name');
        if (!email.trim()) throw new Error('Please enter your email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signup(name, email, password);
      } else {
        if (!email.trim()) throw new Error('Please enter your email');
        if (!password) throw new Error('Please enter your password');
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-surface-card rounded-3xl border border-border-theme shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-accent-soft text-accent-primary mb-1 border border-accent-primary/20 shadow-xs">
            <ChefHat className="w-7 h-7" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            {mode === 'signup' ? 'Join Cookly' : 'Welcome Back'}
          </h2>

          <p className="text-xs sm:text-sm text-text-secondary">
            {authPromptMessage || (mode === 'signup'
              ? 'Create your free account to save recipes, sync your pantry & generate tailored meal plans.'
              : 'Sign in to access your persistent pantry, saved recipes, and personal cookbook.')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-status-error/10 border border-status-error/30 text-status-error text-xs font-semibold animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Name</label>
              <Input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-text-muted" />}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
            <Input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-text-muted" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="spice"
            size="lg"
            className="w-full font-bold shadow-md rounded-2xl text-sm mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-text-secondary border-t border-border-theme">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="font-bold text-accent-primary hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className="font-bold text-accent-primary hover:underline"
              >
                Create One Free
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
