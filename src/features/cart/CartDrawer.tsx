import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  MessageCircle, 
  Gift, 
  Lightbulb,
  Check,
  Target
} from 'lucide-react';
import { sendToWhatsApp } from '../../utils/checkout'; // Wait, let's implement this utils file next, or write the whatsapp link generator in place!

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    appliedCoupon,
    customerGoal,
    setCustomerGoal,
    removeItemFromCart,
    updateCartItemQuantity,
    applyCouponCode,
    removeCoupon,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
    services,
    variants,
    addItemToCart,
    settings,
    addOrder,
    clearCart
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  
  // Goals array
  const goals = [
    { id: 'followers', text: 'Obtener más seguidores', icon: '👤' },
    { id: 'engagement', text: 'Mejorar la interacción (Likes/Comentarios)', icon: '❤️' },
    { id: 'reach', text: 'Aumentar el alcance de mis publicaciones', icon: '📈' },
    { id: 'business', text: 'Impulsar mi negocio/ventas', icon: '💼' },
    { id: 'aesthetic', text: 'Mejorar el aspecto estético de mi perfil', icon: '✨' }
  ];

  // Coupon handling
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCouponCode(couponInput);
    if (res.success) {
      setCouponMessage({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  // Recommendations: Based on cart contents & goals!
  // Rule: Never recommend a service that is already in the cart.
  const getSmartRecommendations = () => {
    const recommended: any[] = [];
    const cartServiceIds = cart.map(i => i.service.id);
    const cartNetworkIds = cart.map(i => i.network.id);

    // 1. Recommendation based on selected objective/goal
    if (customerGoal) {
      if (customerGoal.includes('seguidores') || customerGoal.includes('perfil')) {
        // Recommend followers if not added
        const igFollowers = services.find(s => s.id === 'ig-followers');
        if (igFollowers && !cartServiceIds.includes('ig-followers')) {
          recommended.push({
            id: 'rec-goal-ig-fol',
            service: igFollowers,
            networkName: 'Instagram',
            text: 'Recomendado para tu objetivo de crecimiento y perfil.',
            variant: variants.find(v => v.serviceId === 'ig-followers' && v.quantity === 1000)
          });
        }
      }
      if (customerGoal.includes('interacción') || customerGoal.includes('alcance')) {
        const igLikes = services.find(s => s.id === 'ig-likes');
        if (igLikes && !cartServiceIds.includes('ig-likes')) {
          recommended.push({
            id: 'rec-goal-ig-lik',
            service: igLikes,
            networkName: 'Instagram',
            text: 'Recomendado para impulsar interacción y alcance.',
            variant: variants.find(v => v.serviceId === 'ig-likes' && v.quantity === 1000)
          });
        }
      }
    }

    // 2. Cross-recommendation: If Instagram followers is added, recommend Instagram likes
    if (cartServiceIds.includes('ig-followers') && !cartServiceIds.includes('ig-likes')) {
      const igLikes = services.find(s => s.id === 'ig-likes');
      if (igLikes) {
        recommended.push({
          id: 'rec-cross-ig-likes',
          service: igLikes,
          networkName: 'Instagram',
          text: '¡Crecimiento natural! Combina tus seguidores con likes reales.',
          variant: variants.find(v => v.serviceId === 'ig-likes' && v.quantity === 1000)
        });
      }
    }

    // 3. TikTok Views in cart, recommend TikTok Likes
    if (cartServiceIds.includes('tk-views') && !cartServiceIds.includes('tk-likes')) {
      const tkLikes = services.find(s => s.id === 'tk-likes');
      if (tkLikes) {
        recommended.push({
          id: 'rec-cross-tk-likes',
          service: tkLikes,
          networkName: 'TikTok',
          text: 'Multiplica el engagement. Añade likes a tus vistas.',
          variant: variants.find(v => v.serviceId === 'tk-likes' && v.quantity === 1000)
        });
      }
    }

    // 4. Instagram but no TikTok or vice versa
    if (cartNetworkIds.includes('ig') && !cartNetworkIds.includes('tk')) {
      const tkFollowers = services.find(s => s.id === 'tk-followers');
      if (tkFollowers && !cartServiceIds.includes('tk-followers')) {
        recommended.push({
          id: 'rec-cross-tk-fol',
          service: tkFollowers,
          networkName: 'TikTok',
          text: '¡Expándete! Lleva tu presencia de Instagram también a TikTok.',
          variant: variants.find(v => v.serviceId === 'tk-followers' && v.quantity === 1000)
        });
      }
    }

    // Return unique items up to 2
    return recommended.filter((v, i, self) => self.findIndex(t => t.service.id === v.service.id) === i).slice(0, 2);
  };

  const smartRecommendations = getSmartRecommendations();

  // WhatsApp Message Generator & Real Server Order Creation
  const handleCheckout = () => {
    if (!customerNameInput.trim() || !customerPhoneInput.trim()) {
      alert('Por favor ingresa tu Nombre y Celular/WhatsApp para registrar tu pedido.');
      return;
    }

    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const total = getCartTotal();

    const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const itemsSummary = cart.map(item => `${item.customQuantity || 1}x ${item.variant.quantity} ${item.service.name} (${item.network.name})`).join(', ');

    // Register real order in persistent store
    addOrder({
      id: orderId,
      customerName: customerNameInput,
      customerPhone: customerPhoneInput,
      itemsSummary,
      goal: customerGoal || 'Crecimiento General',
      total,
      status: 'pendiente'
    });

    const phone = settings.whatsappNumber;
    let msg = `🚀 *NUEVO PEDIDO - IMPULSANET*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `🆔 *ID de Orden:* ${orderId}\n`;
    msg += `👤 *Cliente:* ${customerNameInput}\n`;
    msg += `📱 *WhatsApp:* ${customerPhoneInput}\n`;
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

    // Auto-clear cart and close drawer
    setTimeout(() => {
      clearCart();
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full md:max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-50 rounded-xl">
                  <ShoppingBag size={20} className="text-zinc-900" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-lg leading-tight">Mi Pedido</h3>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{cart.length} packs agregados</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-zinc-50 rounded-full text-zinc-400">
                    <ShoppingBag size={48} strokeWidth={1} />
                  </div>
                  <h4 className="font-black text-lg text-zinc-900">Tu carrito está vacío</h4>
                  <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                    Utiliza nuestro configurador interactivo para agregar tus primeros servicios de crecimiento.
                  </p>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Comenzar a armar
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Servicios seleccionados</h4>
                    <div className="space-y-3">
                      {cart.map((item) => {
                        const itemQty = item.customQuantity || 1;
                        const savings = item.variant.oldPrice ? (item.variant.oldPrice - item.variant.price) * itemQty : 0;
                        const totalPrice = item.variant.price * itemQty;
                        const totalOldPrice = item.variant.oldPrice ? item.variant.oldPrice * itemQty : undefined;
                        
                        return (
                          <div
                            key={item.id}
                            className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/50 flex gap-4 relative group hover:bg-zinc-100/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase">{item.network.name}</span>
                                {item.variant.label && item.variant.label !== 'none' && (
                                  <span className="bg-zinc-200 text-zinc-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {item.variant.label === 'best_seller' ? 'Top' : 'Ahorro'}
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-zinc-950 text-base mt-0.5">
                                {item.variant.quantity.toLocaleString()} {item.service.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-bold text-indigo-600 text-sm">
                                  ${totalPrice.toLocaleString()}
                                </span>
                                {totalOldPrice && (
                                  <span className="text-xs text-zinc-400 line-through">
                                    ${totalOldPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              
                              {/* Quantity Selector */}
                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-[11px] font-bold text-zinc-400">Packs:</span>
                                <div className="flex items-center border border-zinc-200 bg-white rounded-lg overflow-hidden h-7">
                                  <button
                                    onClick={() => {
                                      if (itemQty > 1) {
                                        updateCartItemQuantity(item.id, itemQty - 1);
                                      } else {
                                        removeItemFromCart(item.id);
                                      }
                                    }}
                                    className="px-2 h-full text-zinc-500 hover:bg-zinc-100 transition-colors flex items-center justify-center cursor-pointer"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="px-2 text-xs font-extrabold text-zinc-800 min-w-[24px] text-center select-none">
                                    {itemQty}
                                  </span>
                                  <button
                                    onClick={() => {
                                      updateCartItemQuantity(item.id, itemQty + 1);
                                    }}
                                    className="px-2 h-full text-zinc-500 hover:bg-zinc-100 transition-colors flex items-center justify-center cursor-pointer"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col justify-between items-end">
                              <button
                                onClick={() => removeItemFromCart(item.id)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-zinc-400 transition-colors cursor-pointer"
                                title="Eliminar servicio"
                              >
                                <Trash2 size={16} />
                              </button>
                              {savings > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Ahorras ${savings.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Smart Recommendations */}
                  {smartRecommendations.length > 0 && (
                    <div className="space-y-3 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                      <div className="flex items-center gap-2 text-indigo-900">
                        <Lightbulb size={16} className="text-indigo-600 fill-indigo-200" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Recomendaciones Inteligentes</h4>
                      </div>
                      <div className="space-y-3 mt-2">
                        {smartRecommendations.map((rec) => (
                          <div key={rec.id} className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-indigo-100">
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase block">{rec.networkName}</span>
                              <p className="font-bold text-xs text-zinc-950 truncate">
                                +{rec.variant?.quantity.toLocaleString()} {rec.service.name} (${rec.variant?.price.toLocaleString()})
                              </p>
                              <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">{rec.text}</p>
                            </div>
                            <button
                              onClick={() => addItemToCart({ network: rec.service.networkId === 'ig' ? { id: 'ig', name: 'Instagram', icon: 'Instagram', color: 'pink-500', slug: 'instagram', active: true } : { id: 'tk', name: 'TikTok', icon: 'Music2', color: 'neutral-900', slug: 'tiktok', active: true }, service: rec.service, variant: rec.variant })}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl transition-all cursor-pointer"
                              title="Agregar recomendación"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Goal / Objective Question */}
                  <div className="space-y-3 bg-zinc-50 p-5 rounded-3xl border border-zinc-200/50">
                    <div className="flex items-center gap-2 text-zinc-900">
                      <Target size={16} className="text-indigo-600" />
                      <h4 className="text-xs font-black uppercase tracking-widest">¿Qué deseas lograr con este pedido?</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {goals.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setCustomerGoal(g.text)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl text-left border text-xs font-semibold transition-all ${
                            customerGoal === g.text
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                             <span>{g.icon}</span>
                             <span>{g.text}</span>
                          </span>
                          {customerGoal === g.text && <Check size={14} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Datos de Contacto Form */}
                  <div className="space-y-4 bg-zinc-50 p-5 rounded-3xl border border-zinc-200/50">
                    <div className="flex items-center gap-2 text-zinc-900">
                      <Target size={16} className="text-indigo-600" />
                      <h4 className="text-xs font-black uppercase tracking-widest">Tus Datos de Contacto</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nombre Completo</label>
                        <input
                          type="text"
                          placeholder="Ej: Carlos Mendoza"
                          value={customerNameInput}
                          onChange={(e) => setCustomerNameInput(e.target.value)}
                          className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Celular / WhatsApp</label>
                        <input
                          type="text"
                          placeholder="Ej: 3012345678"
                          value={customerPhoneInput}
                          onChange={(e) => setCustomerPhoneInput(e.target.value)}
                          className="w-full bg-white border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coupon Form */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Cupones y Descuentos</h4>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-emerald-800">
                          <Gift size={18} className="text-emerald-600" />
                          <div>
                            <span className="font-extrabold text-sm">{appliedCoupon.code}</span>
                            <span className="text-xs text-emerald-600 block">
                              {appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% de descuento` : `$${appliedCoupon.value.toLocaleString()} de descuento aplicado`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-bold text-emerald-700 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Código de cupón (Ej: IMPULSA10)"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value);
                              setCouponMessage(null);
                            }}
                            className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 pl-10 pr-4 text-xs font-semibold outline-none transition-all uppercase"
                          />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                          Aplicar
                        </Button>
                      </form>
                    )}
                    {couponMessage && (
                      <p className={`text-xs font-semibold pl-1 ${couponMessage.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50">
                <div className="space-y-2.5 mb-6">
                  <div className="flex justify-between text-zinc-500 text-xs font-semibold">
                    <span>Subtotal del Pedido</span>
                    <span>${getCartSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 text-xs font-bold">
                      <span className="flex items-center gap-1">🎫 Descuento ({appliedCoupon.code})</span>
                      <span>-${getCartDiscount().toLocaleString()}</span>
                    </div>
                  )}

                  {/* Automated visual tier discount warning if applicable */}
                  <div className="flex justify-between text-zinc-900 text-sm font-black pt-2.5 border-t border-zinc-200">
                    <span className="text-base">Total a pagar</span>
                    <span className="text-lg text-indigo-600">${getCartTotal().toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  fullWidth 
                  variant="success" 
                  size="lg" 
                  onClick={handleCheckout}
                  className="flex items-center justify-center gap-2.5"
                >
                  <MessageCircle size={20} fill="currentColor" /> Finalizar por WhatsApp
                </Button>
                
                <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-wider mt-3">
                  Soporte seguro • Entrega en minutos • 100% Garantizado
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
