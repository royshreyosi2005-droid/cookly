-- Cookly Database Schema
PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  skill_level TEXT DEFAULT 'Intermediate',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  food_preferences TEXT DEFAULT '[]',
  dietary_preferences TEXT DEFAULT '[]',
  nutrition_goals TEXT DEFAULT '[]',
  allergies TEXT DEFAULT '[]',
  foods_to_avoid TEXT DEFAULT '[]',
  cooking_skill TEXT DEFAULT 'Intermediate',
  preferred_cuisines TEXT DEFAULT '[]',
  preferred_meal_types TEXT DEFAULT '[]',
  default_servings INTEGER DEFAULT 2,
  max_cook_time_minutes INTEGER DEFAULT 30,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Saved Recipes Table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  source TEXT DEFAULT 'curated',
  recipe_title TEXT NOT NULL,
  recipe_image TEXT DEFAULT '',
  recipe_data TEXT DEFAULT '{}',
  saved_at TEXT NOT NULL,
  UNIQUE(user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. User Pantry Items Table
CREATE TABLE IF NOT EXISTS pantry_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  ingredient TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  unit TEXT DEFAULT '',
  category TEXT DEFAULT 'Pantry',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, ingredient),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Shopping List Items Table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount TEXT DEFAULT '1 portion',
  quantity REAL DEFAULT 1,
  unit TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  checked INTEGER DEFAULT 0,
  recipe_source TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Cooking History Table
CREATE TABLE IF NOT EXISTS cooking_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_image TEXT DEFAULT '',
  servings INTEGER DEFAULT 2,
  rating INTEGER DEFAULT 5,
  source TEXT DEFAULT '',
  cooked_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance and quick tenant lookups
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_user ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_user ON cooking_history(user_id);
