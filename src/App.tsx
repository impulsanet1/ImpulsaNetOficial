import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './features/home/Hero';
import { OrderConfigurator } from './features/configurator/OrderConfigurator';
import { CombosAndPlans } from './features/home/CombosAndPlans';
import { Benefits } from './features/home/Benefits';
import { ResellersSection } from './features/home/ResellersSection';
import { FAQ } from './features/home/FAQ';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './features/cart/CartDrawer';
import { AdminLogin } from './features/admin/AdminLogin';
import { AdminLayout } from './features/admin/AdminLayout';

function MainAppContent() {
  const { isAdminLoggedIn, settings } = useApp();
  const [view, setView] = useState<'shop' | 'admin' | 'admin-login'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Router simulator
  if (view === 'admin-login') {
    return (
      <AdminLogin 
        onSuccess={() => setView('admin')} 
        onCancel={() => setView('shop')} 
      />
    );
  }

  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <AdminLayout 
        onBackToClient={() => setView('shop')} 
      />
    );
  }

  // Fallback to shop view if admin logged out
  const handleNavigateToAdmin = () => {
    if (isAdminLoggedIn) {
      setView('admin');
    } else {
      setView('admin-login');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-between">
      {/* Dynamic colors stylesheet */}
      <style>{`
        :root {
          --dynamic-primary: ${settings?.colorPrimary || '#4F46E5'};
          --dynamic-secondary: ${settings?.colorSecondary || '#7C3AED'};
          --dynamic-buttons: ${settings?.colorButtons || '#4F46E5'};
          --dynamic-texts: ${settings?.colorTexts || '#09090B'};
          --dynamic-bg: ${settings?.colorBg || '#F8F9FA'};
          --dynamic-menu: ${settings?.colorMenu || '#FFFFFF'};
        }
        body {
          background-color: var(--dynamic-bg, #F8F9FA) !important;
          color: var(--dynamic-texts, #09090B) !important;
        }
        nav {
          background-color: ${settings?.colorMenu || '#FFFFFF'}CC !important;
        }
      `}</style>
      <div>
        <Navbar 
          onOpenCart={() => setIsCartOpen(true)} 
          onNavigateToAdmin={handleNavigateToAdmin} 
        />
        
        {/* Main Sections */}
        <Hero />
        <OrderConfigurator />
        <CombosAndPlans />
        <Benefits />
        <ResellersSection />
        <FAQ />
      </div>
      
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
