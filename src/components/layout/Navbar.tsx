import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onNavigateToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onNavigateToAdmin }) => {
  const { cart, settings } = useApp();
  const totalItems = cart.length;

  return (
    <>
      {/* Top Promotional Promo Banner */}
      {settings.bannerPromoActive && settings.bannerPromoText && (
        <div className="w-full bg-indigo-600 text-white text-center py-2.5 px-4 text-xs font-bold tracking-tight flex items-center justify-center gap-2">
          <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            Promo
          </span>
          <span>{settings.bannerPromoText}</span>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.location.reload()}>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-zinc-950 flex items-center gap-1">
              🚀 {settings?.logoText || 'IMPULSANET'}<span className="text-indigo-600 font-extrabold">.</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-500">
            <a href="#configurador" className="hover:text-black transition-colors">Configurador</a>
            <a href="#combos" className="hover:text-black transition-colors">Combos Destacados</a>
            <a href="#beneficios" className="hover:text-black transition-colors">Beneficios</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            
            {/* Admin trigger */}
            <button
              onClick={onNavigateToAdmin}
              className="hidden sm:flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-black transition-colors focus:outline-none"
              title="Panel de Administración"
            >
              <UserCheck size={16} /> Admin Portal
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 hover:text-black rounded-2xl border border-zinc-200/50 transition-all flex items-center gap-2 focus:outline-none"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline text-xs font-extrabold uppercase tracking-wider text-zinc-700">Mi Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
