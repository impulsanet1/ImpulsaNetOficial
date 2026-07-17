import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Instagram, Send, ShieldAlert, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 px-6 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand column */}
        <div className="space-y-4">
          <span className="text-xl font-black tracking-tighter text-white flex items-center gap-1">
            🚀 {settings?.logoText || 'IMPULSANET'}<span className="text-indigo-500 font-extrabold">.</span>
          </span>
          <p className="text-zinc-500 text-xs leading-relaxed font-semibold">
            {settings?.footerText || 'La plataforma oficial para impulsar la reputación digital, autoridad y posicionamiento de marcas y creadores en toda Latinoamérica.'}
          </p>
        </div>

        {/* Access links column */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Accesos Rápidos</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><a href="#configurador" className="hover:text-white transition-colors">Configurador de Pedidos</a></li>
            <li><a href="#combos" className="hover:text-white transition-colors">Combos Virales</a></li>
            <li><a href="#beneficios" className="hover:text-white transition-colors">Beneficios ImpulsaNet</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
          </ul>
        </div>

        {/* Contact/Channels column */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Contacto Oficial</h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            {settings.whatsappNumber && (
              <li>
                <a 
                  href={`https://wa.me/${settings.whatsappNumber}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle size={16} className="text-emerald-500" fill="currentColor" />
                  <span>WhatsApp de Soporte</span>
                </a>
              </li>
            )}
            {settings.instagramUrl && (
              <li>
                <a 
                  href={settings.instagramUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Instagram size={16} className="text-pink-500" />
                  <span>Instagram Oficial</span>
                </a>
              </li>
            )}
            {settings.whatsappChannelUrl && (
              <li>
                <a 
                  href={settings.whatsappChannelUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Send size={16} className="text-blue-400" />
                  <span>Canal Oficial de WhatsApp</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Quality declaration column */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Impulsando tu Negocio</h4>
          <p className="text-zinc-600 text-[11px] leading-relaxed font-semibold">
            Desarrollado con altos estándares de ingeniería de software. Nuestra arquitectura modular permite incorporar servicios ilimitados sin interrumpir la operación de tus tiendas móviles.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 text-center">
        <span>&copy; {new Date().getFullYear()} {settings?.logoText || 'ImpulsaNet'}. Todos los derechos reservados.</span>
        <span className="flex items-center gap-1 justify-center">
          Hecho con <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" /> para impulsar creadores digitales.
        </span>
      </div>
    </footer>
  );
};
export default Footer;
