import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChefHat, User, Mail, Clock, Users } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { Button } from '../common/Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [skillLevel, setSkillLevel] = useState(profile.skillLevel);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [defaultServings, setDefaultServings] = useState(profile.defaultServings);
  const [maxCookTimeMinutes, setMaxCookTimeMinutes] = useState(profile.maxCookTimeMinutes);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name,
      email: email.trim() || profile.email,
      bio: bio.trim(),
      skillLevel,
      avatarUrl: avatarUrl.trim() || profile.avatarUrl,
      defaultServings,
      maxCookTimeMinutes
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-surface-card rounded-3xl shadow-elevated border border-border-theme overflow-hidden z-10 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme bg-bg-secondary/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-primary flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Chef Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-bg-secondary hover:bg-surface-hover text-text-secondary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-grow">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Chef Avatar
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl || AVATAR_PRESETS[0]}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-primary shadow-sm shrink-0"
                />
                <div className="flex flex-wrap gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                        avatarUrl === preset ? 'border-accent-primary ring-2 ring-accent-soft' : 'border-border-theme opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-all"
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-all"
                  placeholder="e.g. alex@cookly.app"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Bio & Cooking Philosophy
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full p-3.5 rounded-2xl border border-border-theme bg-bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-all resize-none"
                placeholder="Share a short note about your cooking passion..."
              />
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Culinary Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Pro Home Cook'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillLevel(level)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      skillLevel === level
                        ? 'bg-accent-primary text-white border-accent-primary shadow-xs'
                        : 'bg-bg-secondary text-text-primary border-border-theme hover:bg-surface-hover'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Defaults (Servings & Time) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Default Servings
                  </span>
                </label>
                <select
                  value={defaultServings}
                  onChange={(e) => setDefaultServings(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                >
                  {[1, 2, 3, 4, 6, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Max Cook Time
                  </span>
                </label>
                <select
                  value={maxCookTimeMinutes}
                  onChange={(e) => setMaxCookTimeMinutes(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl border border-border-theme bg-bg-secondary text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                >
                  <option value={15}>15 minutes (Quick)</option>
                  <option value={25}>25 minutes (Standard)</option>
                  <option value={35}>35 minutes (Balanced)</option>
                  <option value={60}>60 minutes (Elaborate)</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-border-theme flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="spice"
                size="md"
                className="rounded-2xl shadow-card"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
