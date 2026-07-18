import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Network, Service, Variant } from '../../types';
import { Button } from '../../components/ui/Button';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Music2, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  CheckCircle, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Eye,
  Plus,
  Check,
  ShoppingBag,
  Lightbulb
} from 'lucide-react';

export const OrderConfigurator: React.FC = () => {
  const { 
    networks, 
    services, 
    variants, 
    addItemToCart, 
    removeItemFromCart,
    cart,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
    appliedCoupon,
    customerGoal,
    setCustomerGoal,
    addOrder,
    settings,
    clearCart,
    recommendations
  } = useApp();
  
  const [step, setStep] = useState<number>(1);
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('impulsanet_customer_name') || '';
  });
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('impulsanet_customer_phone') || '';
  });

  // Filter networks that are active
  const activeNetworks = networks.filter(n => n.active);

  // Get selected networks
  const selectedNetworks = networks.filter(n => selectedNetworkIds.includes(n.id) && n.active);

  // Get selected services
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id) && s.active);

  const getNetworkIcon = (iconName: string, color: string) => {
    const size = 32;
    // Map Tailwind color classes safely
    const colorMap: Record<string, string> = {
      'pink-500': 'text-pink-500',
      'neutral-900': 'text-zinc-900',
      'blue-600': 'text-blue-600',
      'red-600': 'text-red-600',
      'indigo-600': 'text-indigo-600'
    };
    const classes = colorMap[color] || 'text-indigo-600';

    switch (iconName) {
      case 'Instagram':
        return <Instagram size={size} className={classes} />;
      case 'Music2':
        return <Music2 size={size} className={classes} />;
      case 'Facebook':
        return <Facebook size={size} className={classes} />;
      case 'Youtube':
        return <Youtube size={size} className={classes} />;
      default:
        return <Sparkles size={size} className={classes} />;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'followers':
        return <TrendingUp size={18} className="text-zinc-600" />;
      case 'likes':
        return <ThumbsUp size={18} className="text-zinc-600" />;
      case 'views':
        return <Eye size={18} className="text-zinc-600" />;
      case 'comments':
        return <MessageSquare size={18} className="text-zinc-600" />;
      default:
        return <Sparkles size={18} className="text-zinc-600" />;
    }
  };

  const handleToggleNetwork = (netId: string) => {
    const isSelected = selectedNetworkIds.includes(netId);
    if (isSelected) {
      setSelectedNetworkIds(prev => prev.filter(id => id !== netId));
      
      // Deselect services belonging to this network
      const serviceIdsToDeselect = services
        .filter(s => s.networkId === netId)
        .map(s => s.id);
      setSelectedServiceIds(prev => prev.filter(id => !serviceIdsToDeselect.includes(id)));
      
      // Clean cart of variants for that network
      cart.forEach(item => {
        if (item.network.id === netId) {
          removeItemFromCart(item.id);
        }
      });
    } else {
      setSelectedNetworkIds(prev => [...prev, netId]);
    }
  };

  const handleToggleService = (servId: string) => {
    const isSelected = selectedServiceIds.includes(servId);
    if (isSelected) {
      setSelectedServiceIds(prev => prev.filter(id => id !== servId));
      
      // Clean cart of variants for this service
      cart.forEach(item => {
        if (item.service.id === servId) {
          removeItemFromCart(item.id);
        }
      });
    } else {
      setSelectedServiceIds(prev => [...prev, servId]);
    }
  };

  const handleToggleVariant = (v: Variant, serv: Service, net: Network) => {
    const isSelected = cart.some(item => item.variant.id === v.id);
    if (isSelected) {
      const cartItem = cart.find(item => item.variant.id === v.id);
      if (cartItem) {
        removeItemFromCart(cartItem.id);
      }
    } else {
      addItemToCart({
        network: net,
        service: serv,
        variant: v
      });
    }
  };

  const getSmartRecommendations = () => {
    const recommended: any[] = [];
    const cartServiceIds = cart.map(i => i.service.id);
    const cartNetworkIds = cart.map(i => i.network.id);

    // 1. Database-driven dynamic recommendations (filtered to same network)
    if (recommendations && recommendations.length > 0) {
      recommendations.forEach(rec => {
        if (!rec.active) return;
        
        // Find if any cart item matches this trigger
        const triggeringItem = cart.find(item => 
          item.service.type === rec.triggerServiceType || 
          item.network.id === rec.triggerServiceType ||
          item.service.id === rec.triggerServiceType
        );

        // ONLY suggest if we have a trigger AND the suggested service is in the SAME network as the triggering cart item!
        if (triggeringItem && !cartServiceIds.includes(rec.suggestedServiceId)) {
          const sugService = services.find(s => s.id === rec.suggestedServiceId && s.active);
          if (sugService && sugService.networkId === triggeringItem.network.id) {
            const serviceVariants = variants.filter(v => v.serviceId === sugService.id && v.active);
            if (serviceVariants.length > 0) {
              const sugVariant = serviceVariants.find(v => v.label === 'best_seller') || 
                                 serviceVariants.find(v => v.quantity === 1000) || 
                                 serviceVariants[0];
              
              const parentNet = networks.find(n => n.id === sugService.networkId);
              recommended.push({
                id: `db-rec-${rec.id}`,
                service: sugService,
                networkName: parentNet ? parentNet.name : sugService.networkId,
                text: rec.message,
                variant: sugVariant
              });
            }
          }
        }
      });
    }

    // 2. Goal-based dynamic recommendations (restricted to the same networks in the cart)
    if (customerGoal) {
      const lowerGoal = customerGoal.toLowerCase();
      const wantsGrowth = lowerGoal.includes('seguidores') || lowerGoal.includes('perfil') || lowerGoal.includes('crecimiento');
      const wantsEngagement = lowerGoal.includes('interacción') || lowerGoal.includes('alcance') || lowerGoal.includes('clientes');

      if (wantsGrowth) {
        // Instagram
        const igFollowers = services.find(s => s.id === 'ig-followers' && s.active);
        if (igFollowers && !cartServiceIds.includes('ig-followers') && cartNetworkIds.includes('ig')) {
          recommended.push({
            id: 'rec-goal-ig-fol',
            service: igFollowers,
            networkName: 'Instagram',
            text: 'Recomendado para tu objetivo de crecimiento y perfil.',
            variant: variants.find(v => v.serviceId === 'ig-followers' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'ig-followers' && v.active)
          });
        }
        // TikTok
        const tkFollowers = services.find(s => s.id === 'tk-followers' && s.active);
        if (tkFollowers && !cartServiceIds.includes('tk-followers') && cartNetworkIds.includes('tk')) {
          recommended.push({
            id: 'rec-goal-tk-fol',
            service: tkFollowers,
            networkName: 'TikTok',
            text: 'Recomendado para desbloquear lives y potenciar tu perfil.',
            variant: variants.find(v => v.serviceId === 'tk-followers' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'tk-followers' && v.active)
          });
        }
        // YouTube
        const ytSubscribers = services.find(s => s.id === 'yt-subscribers' && s.active);
        if (ytSubscribers && !cartServiceIds.includes('yt-subscribers') && cartNetworkIds.includes('yt')) {
          recommended.push({
            id: 'rec-goal-yt-sub',
            service: ytSubscribers,
            networkName: 'YouTube',
            text: 'Recomendado para acelerar la monetización de tu canal.',
            variant: variants.find(v => v.serviceId === 'yt-subscribers' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'yt-subscribers' && v.active)
          });
        }
        // Facebook
        const fbFollowers = services.find(s => s.id === 'fb-followers' && s.active);
        if (fbFollowers && !cartServiceIds.includes('fb-followers') && cartNetworkIds.includes('fb')) {
          recommended.push({
            id: 'rec-goal-fb-fol',
            service: fbFollowers,
            networkName: 'Facebook',
            text: 'Recomendado para ampliar la reputación de tu página.',
            variant: variants.find(v => v.serviceId === 'fb-followers' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'fb-followers' && v.active)
          });
        }
      }

      if (wantsEngagement) {
        // Instagram
        const igLikes = services.find(s => s.id === 'ig-likes' && s.active);
        if (igLikes && !cartServiceIds.includes('ig-likes') && cartNetworkIds.includes('ig')) {
          recommended.push({
            id: 'rec-goal-ig-lik',
            service: igLikes,
            networkName: 'Instagram',
            text: 'Recomendado para impulsar interacción y alcance.',
            variant: variants.find(v => v.serviceId === 'ig-likes' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'ig-likes' && v.active)
          });
        }
        // TikTok
        const tkLikes = services.find(s => s.id === 'tk-likes' && s.active);
        if (tkLikes && !cartServiceIds.includes('tk-likes') && cartNetworkIds.includes('tk')) {
          recommended.push({
            id: 'rec-goal-tk-lik',
            service: tkLikes,
            networkName: 'TikTok',
            text: 'Recomendado para empujar tus videos al feed Para Ti.',
            variant: variants.find(v => v.serviceId === 'tk-likes' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'tk-likes' && v.active)
          });
        }
        // YouTube
        const ytLikes = services.find(s => s.id === 'yt-likes' && s.active);
        if (ytLikes && !cartServiceIds.includes('yt-likes') && cartNetworkIds.includes('yt')) {
          recommended.push({
            id: 'rec-goal-yt-lik',
            service: ytLikes,
            networkName: 'YouTube',
            text: 'Recomendado para mejorar la visibilidad de tus videos.',
            variant: variants.find(v => v.serviceId === 'yt-likes' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'yt-likes' && v.active)
          });
        }
        // Facebook
        const fbLikes = services.find(s => s.id === 'fb-likes' && s.active);
        if (fbLikes && !cartServiceIds.includes('fb-likes') && cartNetworkIds.includes('fb')) {
          recommended.push({
            id: 'rec-goal-fb-lik',
            service: fbLikes,
            networkName: 'Facebook',
            text: 'Recomendado para dinamizar tus publicaciones.',
            variant: variants.find(v => v.serviceId === 'fb-likes' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'fb-likes' && v.active)
          });
        }
      }
    }

    // 3. Fallback Cross-recommendations (all restricted to the same network!)
    if (cartServiceIds.includes('ig-followers') && !cartServiceIds.includes('ig-likes')) {
      const igLikes = services.find(s => s.id === 'ig-likes' && s.active);
      if (igLikes) {
        recommended.push({
          id: 'rec-cross-ig-likes',
          service: igLikes,
          networkName: 'Instagram',
          text: '¡Crecimiento natural! Combina tus seguidores con likes reales.',
          variant: variants.find(v => v.serviceId === 'ig-likes' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'ig-likes' && v.active)
        });
      }
    }

    if (cartServiceIds.includes('tk-views') && !cartServiceIds.includes('tk-likes')) {
      const tkLikes = services.find(s => s.id === 'tk-likes' && s.active);
      if (tkLikes) {
        recommended.push({
          id: 'rec-cross-tk-likes',
          service: tkLikes,
          networkName: 'TikTok',
          text: 'Multiplica el engagement. Añade likes a tus vistas.',
          variant: variants.find(v => v.serviceId === 'tk-likes' && v.quantity === 1000 && v.active) || variants.find(v => v.serviceId === 'tk-likes' && v.active)
        });
      }
    }

    return recommended.filter((v, i, self) => self.findIndex(t => t.service.id === v.service.id) === i).slice(0, 2);
  };

  const handleCheckoutConfigurator = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor ingresa tu Nombre y Celular/WhatsApp para registrar tu pedido.');
      return;
    }

    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const total = getCartTotal();

    const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const itemsSummary = cart.map(item => `${item.customQuantity || 1}x ${item.variant.quantity} ${item.service.name} (${item.network.name})`).join(', ');

    // Register order in Firebase
    addOrder({
      id: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      itemsSummary,
      goal: customerGoal || 'Crecimiento General',
      total,
      status: 'pendiente'
    });

    const phone = settings?.whatsappNumber || '573012345678';
    let msg = `🚀 *NUEVO PEDIDO - IMPULSANET*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `🆔 *ID de Orden:* ${orderId}\n`;
    msg += `👤 *Cliente:* ${customerName}\n`;
    msg += `📱 *WhatsApp:* ${customerPhone}\n`;
    msg += `🎯 *Objetivo:* ${customerGoal || 'Crecimiento General'}\n\n`;
    
    cart.forEach((item, i) => {
      const q = item.customQuantity || 1;
      const totalItemPrice = item.variant.price * q;
      msg += `📦 *${item.network.name}* (${item.service.name})\n`;
      msg += `   • Paquete: ${item.variant.quantity.toLocaleString()}\n`;
      msg += `   • Cantidad de packs: ${q}\n`;
      msg += `   • Subtotal: $${totalItemPrice.toLocaleString()}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Subtotal: $${subtotal.toLocaleString()}\n`;
    if (appliedCoupon) {
      msg += `🎫 Cupón: ${appliedCoupon.code} (-$${discount.toLocaleString()})\n`;
    }
    msg += `💰 *TOTAL A PAGAR: $${total.toLocaleString()}*\n\n`;
    msg += `📱 _Pedido generado de forma segura desde el Configurador Oficial._`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');

    setOrderCompleted(true);
    setTimeout(() => {
      setOrderCompleted(false);
      clearCart();
      setStep(1);
      setSelectedNetworkIds([]);
      setSelectedServiceIds([]);
    }, 2500);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const total = getCartTotal();
  const smartRecommendations = getSmartRecommendations();

  return (
    <div id="configurador" className="w-full py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-extrabold bg-indigo-50 px-4 py-1.5 rounded-full">
            Configurador Inteligente Multi-Red
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 mt-4 mb-4">
            Arma tu Carrito de Impulso
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base">
            Selecciona varias redes sociales y servicios de una sola vez. Construye tu pedido a la medida y finaliza la compra directamente por WhatsApp.
          </p>
        </div>

        {/* Outer Configurator Card */}
        <div className="relative bg-zinc-50 border border-zinc-200/60 rounded-[2.5rem] shadow-xl shadow-zinc-100 p-6 md:p-12 overflow-hidden min-h-[500px] flex flex-col justify-between">
          
          {/* Header/Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-8">
              {step > 1 ? (
                <button 
                  onClick={goBack} 
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors font-semibold"
                >
                  <ArrowLeft size={16} /> Volver
                </button>
              ) : (
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Paso 1 de 4
                </span>
              )}
              
              {step > 1 && (
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Paso {step} de 4
                </span>
              )}
            </div>

            {/* Stepper Dots */}
            <div className="flex gap-2.5 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    step >= i ? 'bg-indigo-600' : 'bg-zinc-200'
                  }`} 
                />
              ))}
            </div>
          </div>

          {/* Step Contents */}
          <div className="flex-1 flex flex-col justify-center my-4">
            <AnimatePresence mode="wait">
              {orderCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-md shadow-emerald-100 animate-bounce">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 mb-2">¡Pedido enviado con éxito!</h3>
                  <p className="text-zinc-500 text-sm">Abriendo WhatsApp para procesar tu pedido de inmediato...</p>
                </motion.div>
              ) : step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight">
                      ¿Qué redes sociales deseas impulsar?
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">Puedes elegir todas las que quieras al mismo tiempo.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeNetworks.map((net) => {
                      const isSel = selectedNetworkIds.includes(net.id);
                      return (
                        <button
                          key={net.id}
                          onClick={() => handleToggleNetwork(net.id)}
                          className={`group flex flex-col items-center justify-center p-6 bg-white border rounded-3xl transition-all duration-300 shadow-sm hover:shadow-lg text-center cursor-pointer no-tap relative ${
                            isSel ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-zinc-200/60 hover:border-zinc-400'
                          }`}
                        >
                          {isSel && (
                            <div className="absolute top-3 right-3 text-indigo-600">
                              <CheckCircle size={20} fill="currentColor" className="text-white fill-indigo-600" />
                            </div>
                          )}
                          <div className="p-4 bg-zinc-50 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-zinc-100 transition-all">
                            {getNetworkIcon(net.icon, net.color)}
                          </div>
                          <span className="font-bold text-zinc-800 group-hover:text-black tracking-tight text-base">
                            {net.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      onClick={goNext}
                      disabled={selectedNetworkIds.length === 0}
                      className="gap-2 font-bold py-3 px-6 rounded-2xl flex items-center"
                    >
                      Continuar <ArrowRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              ) : step === 2 ? (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight">
                      ¿Qué tipo de impulso necesitas?
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">Puedes seleccionar múltiples servicios para cada red social elegida.</p>
                  </div>

                  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2">
                    {selectedNetworks.map(net => {
                      const netServices = services.filter(s => s.networkId === net.id && s.active);
                      if (netServices.length === 0) return null;
                      
                      return (
                        <div key={net.id} className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60">
                            <span className="p-1 bg-zinc-100 rounded-lg">{getNetworkIcon(net.icon, net.color)}</span>
                            <span className="font-black text-zinc-800 text-sm uppercase tracking-wider">{net.name}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {netServices.map(serv => {
                              const isSel = selectedServiceIds.includes(serv.id);
                              return (
                                <button
                                  key={serv.id}
                                  onClick={() => handleToggleService(serv.id)}
                                  className={`group flex items-start gap-4 p-5 bg-white border rounded-3xl transition-all duration-300 text-left cursor-pointer no-tap shadow-sm hover:shadow-md relative ${
                                    isSel ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-zinc-200/60 hover:border-zinc-400'
                                  }`}
                                >
                                  {isSel && (
                                    <div className="absolute top-3 right-3 text-indigo-600">
                                      <CheckCircle size={18} fill="currentColor" className="text-white fill-indigo-600" />
                                    </div>
                                  )}
                                  <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-zinc-100 transition-colors">
                                    {getServiceIcon(serv.type)}
                                  </div>
                                  <div className="flex-1 pr-4">
                                    <h4 className="font-bold text-zinc-900 text-base group-hover:text-indigo-600 transition-colors">
                                      {serv.name}
                                    </h4>
                                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                                      {serv.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nav actions */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="secondary"
                      onClick={goBack}
                      className="gap-2 font-bold py-3 px-6 rounded-2xl flex items-center"
                    >
                      <ArrowLeft size={16} /> Volver
                    </Button>
                    <Button
                      variant="primary"
                      onClick={goNext}
                      disabled={selectedServiceIds.length === 0}
                      className="gap-2 font-bold py-3 px-6 rounded-2xl flex items-center"
                    >
                      Continuar <ArrowRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              ) : step === 3 ? (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight">
                      Selecciona las cantidades para tu impulso
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">Puedes elegir uno o varios paquetes. Se agregarán juntos a tu pedido de forma automática.</p>
                  </div>

                  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2">
                    {selectedServices.map(serv => {
                      const net = networks.find(n => n.id === serv.networkId);
                      const servVariants = variants.filter(v => v.serviceId === serv.id && v.active);
                      if (!net || servVariants.length === 0) return null;
                      
                      return (
                        <div key={serv.id} className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60">
                            <span className="p-1 bg-zinc-100 rounded-lg">{getNetworkIcon(net.icon, net.color)}</span>
                            <span className="font-extrabold text-zinc-800 text-sm">{net.name} • {serv.name}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {servVariants.map(v => {
                              const isSel = cart.some(item => item.variant.id === v.id);
                              const unitCost = v.price / v.quantity;
                              const savings = v.oldPrice ? v.oldPrice - v.price : 0;
                              
                              return (
                                <div
                                  key={v.id}
                                  onClick={() => handleToggleVariant(v, serv, net)}
                                  className={`relative flex flex-col justify-between p-5 bg-white border rounded-3xl cursor-pointer transition-all duration-300 group no-tap hover:shadow-lg ${
                                    isSel ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm' : 'border-zinc-200/60 hover:border-indigo-600'
                                  }`}
                                >
                                  {/* Badges */}
                                  {v.label === 'best_seller' && (
                                    <span className="absolute -top-3 right-6 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                      <Flame size={10} fill="currentColor" /> Más Vendido
                                    </span>
                                  )}
                                  {v.label === 'best_price' && (
                                    <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                      <Sparkles size={10} fill="currentColor" /> Mejor Precio
                                    </span>
                                  )}
                                  
                                  {isSel && (
                                    <div className="absolute top-3 right-3 text-indigo-600">
                                      <CheckCircle size={18} fill="currentColor" className="text-white fill-indigo-600" />
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-2xl font-black text-zinc-900 tracking-tight block leading-none">
                                        {v.quantity.toLocaleString()}
                                      </span>
                                      <span className="text-zinc-500 font-semibold text-xs mt-1 block">
                                        {serv.name}
                                      </span>
                                      <p className="text-zinc-400 text-[9px] font-bold mt-1">
                                        Costo por unidad: ${unitCost.toFixed(1)}
                                      </p>
                                    </div>

                                    <div className="text-right pr-6">
                                      <span className="text-lg font-black text-zinc-950 block">
                                        ${v.price.toLocaleString()}
                                      </span>
                                      {v.oldPrice && (
                                        <span className="text-xs text-zinc-400 line-through">
                                          ${v.oldPrice.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Savings & selection status */}
                                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-emerald-600">
                                      {savings > 0 ? `🔥 Ahorras $${savings.toLocaleString()}` : '⚡ Impulso Premium'}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                      {isSel ? '✓ Agregado' : '＋ Agregar'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nav actions */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="secondary"
                      onClick={goBack}
                      className="gap-2 font-bold py-3 px-6 rounded-2xl flex items-center"
                    >
                      <ArrowLeft size={16} /> Volver
                    </Button>
                    <Button
                      variant="primary"
                      onClick={goNext}
                      disabled={cart.length === 0}
                      className="gap-2 font-bold py-3 px-6 rounded-2xl flex items-center"
                    >
                      Continuar al Resumen <ArrowRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight">
                      Resumen del Pedido y Datos de Contacto
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">Revisa tu carrito de compras de impulso y compártenos tus datos para redirigirte de inmediato a WhatsApp.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Invoice Summary */}
                    <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 space-y-6 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 mb-4">
                          <ShoppingBag size={18} className="text-zinc-600" />
                          <h4 className="font-extrabold text-zinc-900 text-base">Servicios Seleccionados</h4>
                        </div>
                        
                        {cart.length === 0 ? (
                          <p className="text-zinc-400 text-xs">Tu carrito está vacío.</p>
                        ) : (
                          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                            {cart.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-xs pb-2.5 border-b border-zinc-50">
                                <div>
                                  <span className="font-bold text-zinc-800 block">
                                    {item.variant.quantity.toLocaleString()} {item.service.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                                    {item.network.name}
                                  </span>
                                </div>
                                <span className="font-extrabold text-zinc-950">
                                  ${item.variant.price.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Smart Recommendations */}
                      {smartRecommendations.length > 0 && (
                        <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center gap-1.5 text-indigo-950">
                            <Lightbulb size={16} className="text-indigo-600 fill-indigo-100 shrink-0" />
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-950">Te Recomendamos:</h5>
                          </div>
                          <div className="space-y-2">
                            {smartRecommendations.map((rec) => (
                              <div key={rec.id} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-indigo-100">
                                <div className="flex-1 min-w-0">
                                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block leading-none mb-1">{rec.networkName}</span>
                                  <p className="font-extrabold text-[11px] text-zinc-950 truncate leading-tight">
                                    +{rec.variant?.quantity.toLocaleString()} {rec.service.name} (${rec.variant?.price.toLocaleString()})
                                  </p>
                                  <p className="text-[9px] text-zinc-400 font-medium leading-snug mt-0.5">{rec.text}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const net = networks.find(n => n.id === rec.service.networkId) || {
                                      id: rec.service.networkId,
                                      name: rec.service.networkId === 'ig' ? 'Instagram' : rec.service.networkId === 'tk' ? 'TikTok' : rec.service.networkId === 'fb' ? 'Facebook' : 'YouTube',
                                      icon: 'Sparkles',
                                      color: 'indigo-600',
                                      slug: rec.service.networkId,
                                      active: true
                                    };
                                    addItemToCart({ network: net, service: rec.service, variant: rec.variant });
                                  }}
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl transition-all cursor-pointer shrink-0"
                                  title="Agregar recomendación"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-zinc-100 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-zinc-500">
                          <span>Subtotal</span>
                          <span>${subtotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-xs font-bold text-emerald-600">
                            <span>Descuento de Cupón</span>
                            <span>-${discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-black pt-2.5 border-t border-zinc-100 text-zinc-900">
                          <span>TOTAL A PAGAR</span>
                          <span className="text-indigo-600">${total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Forms */}
                    <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 space-y-5 flex flex-col justify-between shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
                          <MessageSquare size={18} className="text-zinc-600" />
                          <h4 className="font-extrabold text-zinc-900 text-base">Completa tu Registro</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Nombre Completo</label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => {
                                setCustomerName(e.target.value);
                                localStorage.setItem('impulsanet_customer_name', e.target.value);
                              }}
                              placeholder="Ej. Emely Ruiz"
                              className="w-full bg-zinc-50 border border-zinc-200/60 hover:border-zinc-300 focus:border-indigo-600 focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold text-zinc-800 outline-none transition-all placeholder:text-zinc-400"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Celular / WhatsApp</label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => {
                                setCustomerPhone(e.target.value);
                                localStorage.setItem('impulsanet_customer_phone', e.target.value);
                              }}
                              placeholder="Ej. +57 312 345 6789"
                              className="w-full bg-zinc-50 border border-zinc-200/60 hover:border-zinc-300 focus:border-indigo-600 focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold text-zinc-800 outline-none transition-all placeholder:text-zinc-400"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Objetivo del Canal</label>
                            <select
                              value={customerGoal}
                              onChange={(e) => {
                                setCustomerGoal(e.target.value);
                              }}
                              className="w-full bg-zinc-50 border border-zinc-200/60 hover:border-zinc-300 focus:border-indigo-600 focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold text-zinc-800 outline-none transition-all cursor-pointer"
                            >
                              <option value="Crecimiento General">📈 Crecimiento General de Marca</option>
                              <option value="Conseguir Clientes">💼 Atraer Clientes Potenciales</option>
                              <option value="Monetización">💰 Preparar Canal para Monetizar</option>
                              <option value="Posicionamiento">🔥 Mejorar mi Autoridad / Reputación</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={handleCheckoutConfigurator}
                        className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                        disabled={cart.length === 0}
                      >
                        Enviar WhatsApp <MessageSquare size={14} fill="currentColor" />
                      </Button>
                    </div>
                  </div>

                  {/* Nav actions */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="secondary"
                      onClick={goBack}
                      className="gap-2 font-bold py-3 px-6 rounded-2xl flex items-center"
                    >
                      <ArrowLeft size={16} /> Volver
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Info / Assist footer */}
          <div className="mt-8 pt-6 border-t border-zinc-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-semibold">
            <span className="flex items-center gap-1 text-zinc-400">
              ✨ Descuentos escalonados integrados automáticamente en todos los paquetes.
            </span>
            <a
              href={`https://wa.me/${settings?.whatsappNumber || '573012345678'}?text=${encodeURIComponent('Hola ImpulsaNet 🚀. Me interesa solicitar un plan personalizado a la medida para mis redes sociales. ¿Me darían más información?')}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline cursor-pointer transition-all font-black"
            >
              {settings?.whatsappSectionText || '¿Necesitas un plan personalizado? Contáctanos por WhatsApp.'}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfigurator;
