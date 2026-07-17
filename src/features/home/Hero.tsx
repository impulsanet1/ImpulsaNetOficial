import React from 'react';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Sparkles, Star, Shield, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const Hero: React.FC = () => {
  const { settings } = useApp();
  
  const handleScrollToConfigurator = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('configurador');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative bg-white pt-20 pb-28 px-6 overflow-hidden">
      {/* Decorative gradient blur background to feel like Stripe */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-radial from-indigo-50/70 to-transparent pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-8">
        
        {/* Top Feature Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs font-black uppercase tracking-wider">
          <Sparkles size={14} className="fill-indigo-100" />
          <span>Posicionamiento y Crecimiento Orgánico</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 max-w-4xl mx-auto leading-none">
          {settings?.heroTitle ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              {settings.heroTitle}
            </span>
          ) : (
            <>
              No solo vendemos seguidores.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Construimos autoridad.
              </span>
            </>
          )}
        </h1>

        {/* Elegant Subtitle */}
        <p className="text-zinc-500 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          {settings?.heroSubtitle || "La plataforma definitiva para creadores y marcas que buscan acelerar su crecimiento en redes sociales de forma segura, duradera y configurable."}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleScrollToConfigurator}
            className="w-full sm:w-auto flex items-center justify-center gap-2 group"
          >
            Arma tu Pedido <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => {
              const element = document.getElementById('combos');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto"
          >
            Conoce nuestros planes
          </Button>
        </div>

        {/* Real Proof Metrics Row */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center border-t border-zinc-100">
          <div>
            <span className="block text-2xl md:text-3xl font-black text-zinc-950">12k+</span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Pedidos Listos</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-zinc-950">99.8%</span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Tasa de Entrega</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-zinc-950">30 Min</span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Tiempo Promedio</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-black text-zinc-950">24/7</span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Soporte WhatsApp</span>
          </div>
        </div>

      </div>
    </header>
  );
};
export default Hero;
