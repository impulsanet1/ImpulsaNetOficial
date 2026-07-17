import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, MessageSquare, MapPin, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ResellersSection: React.FC = () => {
  const { resellers, settings } = useApp();

  // Filter and sort active resellers by their assigned order field
  const activeResellers = resellers
    .filter(r => r.status === 'activo')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (activeResellers.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-extrabold bg-indigo-50 px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 w-max mx-auto">
            <Award size={14} className="text-indigo-600" /> Red de Agencias Afiliadas
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950">
            Revendedores y Socios Autorizados
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-sm md:text-base">
            Impulsa tus perfiles y solicita soporte local con nuestra selecta red de agencias de marketing y revendedores oficiales que distribuyen nuestra infraestructura con total confianza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeResellers.map((res) => {
            const waText = `Hola ${res.name} 👋. Te contacto por medio de la plataforma oficial de ImpulsaNet 🚀. Me interesa solicitar servicios de posicionamiento y asesoría para mis redes sociales.`;
            const waUrl = `https://wa.me/${res.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

            return (
              <div
                key={res.id}
                className="bg-white border border-zinc-200/60 rounded-[2.5rem] p-8 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
              >
                <div className="space-y-6">
                  {/* Reseller Profile Frame */}
                  <div className="flex items-center gap-4">
                    <img
                      src={res.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                      alt={res.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 bg-zinc-50 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-zinc-950 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                        {res.name}
                      </h3>
                      <div className="flex items-center gap-1 text-zinc-400 text-xs font-bold">
                        <MapPin size={12} className="text-indigo-500" />
                        <span>{res.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reseller bio */}
                  <p className="text-zinc-500 text-xs leading-relaxed font-semibold">
                    {res.description || 'Socio oficial calificado de ImpulsaNet. Ofrece servicios de asesoría y provisión de crecimiento orgánico garantizado.'}
                  </p>
                </div>

                {/* Direct Action */}
                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-zinc-50 hover:bg-emerald-50 text-zinc-900 hover:text-emerald-700 py-3 rounded-2xl border border-zinc-200/50 hover:border-emerald-200 transition-all text-xs font-black uppercase tracking-wider"
                  >
                    <MessageSquare size={16} fill="currentColor" className="text-emerald-500 group-hover:text-emerald-600" />
                    <span>Contactar Agencia</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
export default ResellersSection;
