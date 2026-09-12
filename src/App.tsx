import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PantryProvider } from './context/PantryContext';
import { ShoppingListProvider } from './context/ShoppingListContext';
import { ProfileProvider } from './context/ProfileContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { HomePage } from './pages/HomePage';
import { AIChefPage } from './pages/AIChefPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { PantryPage } from './pages/PantryPage';
import { SavedPage } from './pages/SavedPage';
import { HealthyPicksPage } from './pages/HealthyPicksPage';
import { ProfilePage } from './pages/ProfilePage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top automatically on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <PantryProvider>
            <ShoppingListProvider>
              <ProfileProvider>
                <ScrollToTop />
                <AuthModal />
                <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary selection:bg-accent-soft selection:text-accent-primary transition-colors duration-200">
                  <Navbar />
                  
                  <div className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/ai-chef" element={<AIChefPage />} />
                      <Route path="/discover" element={<DiscoverPage />} />
                      <Route path="/pantry" element={<PantryPage />} />
                      <Route path="/saved" element={<SavedPage />} />
                      <Route path="/healthy-picks" element={<HealthyPicksPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/shopping-list" element={<ShoppingListPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </div>

                  <Footer />
                  <MobileNav />
                </div>
              </ProfileProvider>
            </ShoppingListProvider>
          </PantryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};


export default App;
