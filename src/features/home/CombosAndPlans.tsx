import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Flame, Check, Sparkles, MessageSquare, Plus, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CombosAndPlans: React.FC = () => {
  const { combos, plans, services, variants, networks, addItemToCart, settings } = useApp();
  const [addedComboId, setAddedComboId] = useState<string | null>(null);

  const handleAddCombo = (combo: typeof combos[0]) => {
    // Add all combo items into the shopping cart
    combo.items.forEach(item => {
      const actualService = services.find(s => s.id === item.serviceId);
      const actualVariant = variants.find(v => v.id === item.variantId);
      const networkObject = networks.find(n => n.id === item.networkId) || {
        id: item.networkId,
        name: item.networkId === 'yt' ? 'YouTube' : item.networkId === 'fb' ? 'Facebook' : item.networkId.toUpperCase(),
        icon: item.networkId === 'yt' ? 'Youtube' : item.networkId === 'fb' ? 'Facebook' : 'Globe',
        color: item.networkId === 'yt' ? 'red-600' : item.networkId === 'fb' ? 'blue-600' : 'indigo-600',
        slug: item.networkId,
        active: true
      };

      if (actualService && actualVariant) {
        addItemToCart({
          network: networkObject,
          service: actualService,
          variant: actualVariant
        });
      }
    });

    setAddedComboId(combo.id);
    setTimeout(() => {
      setAddedComboId(null);
    }, 2000);
  };

  const handleBuyPlan = (plan: typeof plans[0]) => {
    const text = `Hola ImpulsaNet 🚀. Me interesa contratar el *${plan.name}* (${plan.billing === 'mensual' ? 'Mensual' : 'Anual'}) por valor de $${plan.price.toLocaleString()} para impulsar mis redes sociales. ¿Cuáles son los siguientes pasos?`;
    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="combos" className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        
        {/* Combos segment */}
        <div>
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-amber-600 font-extrabold bg-amber-50 px-4 py-1.5 rounded-full">
              Paquetes Recomendados
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950 mt-4 mb-4">
              Combos de Crecimiento Acelerado
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base">
              Añade combinaciones estratégicas de seguidores, likes y reproducciones recomendadas por nuestros expertos con un solo clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {combos.filter(c => c.active).map((combo) => {
              const comboSavings = combo.originalPrice - combo.totalPrice;
              
              return (
                <div 
                  key={combo.id}
                  className="bg-zinc-50 border border-zinc-200/60 hover:border-black rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 relative group shadow-sm hover:shadow-xl"
                >
                  {combo.tag && (
                    <span className="absolute -top-3.5 left-8 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame size={12} fill="currentColor" /> {combo.tag}
                    </span>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight">
                        {combo.name}
                      </h3>
                      <p className="text-zinc-500 text-xs md:text-sm mt-1 leading-relaxed">
                        {combo.description}
                      </p>
                    </div>

                    {/* Combo Included Items list */}
                    <div className="space-y-3 bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Incluye el siguiente paquete:</span>
                      <ul className="space-y-2 mt-2">
                        {combo.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-800 font-semibold">
                            <span className="p-1 bg-indigo-50 text-indigo-600 rounded-full">
                              <Check size={12} strokeWidth={3} />
                            </span>
                            <span>{item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing segment */}
                  <div className="mt-8 pt-6 border-t border-zinc-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-zinc-950">${combo.totalPrice.toLocaleString()}</span>
                        <span className="text-xs text-zinc-400 line-through">${combo.originalPrice.toLocaleString()}</span>
                      </div>
                      {comboSavings > 0 && (
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">
                          🔥 ¡Ahorras ${comboSavings.toLocaleString()} hoy!
                        </p>
                      )}
                    </div>

                    <Button 
                      variant={addedComboId === combo.id ? 'success' : 'primary'}
                      onClick={() => handleAddCombo(combo)}
                      className="w-full sm:w-auto"
                    >
                      {addedComboId === combo.id ? (
                        <span className="flex items-center gap-1">¡Agregado!</span>
                      ) : (
                        <span className="flex items-center gap-1">Agregar Combo <Plus size={16} /></span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plans segment */}
        <div id="planes">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-indigo-600 font-extrabold bg-indigo-50 px-4 py-1.5 rounded-full">
              Suscripciones VIP
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950 mt-4 mb-4">
              Planes Mensuales de Impulso Continuo
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base">
              ¿Quieres delegar completamente el crecimiento? Desbloquea el crecimiento constante y la gestión profesional con nuestros planes recurrentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.filter(p => p.active !== false).map((plan) => (
              <div 
                key={plan.id}
                className="rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-xl"
                style={{ backgroundColor: '#18181B', color: '#FFFFFF' }}
              >
                {/* Visual accent circles */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-6 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-extrabold tracking-tight" style={{ color: '#FFFFFF' }}>{plan.name}</h3>
                    <span className="bg-white/10 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
                      VIP Plan
                    </span>
                  </div>

                  <div className="pb-4 border-b border-white/10" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <span className="text-3xl md:text-4xl font-black" style={{ color: '#FFFFFF' }}>${plan.price.toLocaleString()}</span>
                    <span className="text-xs font-bold ml-1.5" style={{ color: '#A1A1AA' }}>/ {plan.billing}</span>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-medium" style={{ color: '#E4E4E7' }}>
                        <span className="p-0.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#818CF8' }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span style={{ color: '#E4E4E7' }}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 relative">
                  <Button 
                    fullWidth 
                    variant="success" 
                    onClick={() => handleBuyPlan(plan)}
                    className="flex items-center justify-center gap-1.5 py-3.5 font-black rounded-2xl cursor-pointer"
                    style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}
                  >
                    Contratar Plan VIP <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
export default CombosAndPlans;
