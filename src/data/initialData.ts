import { Network, Service, Variant, Combo, Coupon, Recommendation, GlobalSettings } from '../types';

export const initialNetworks: Network[] = [
  { id: 'ig', name: 'Instagram', icon: 'Instagram', color: 'pink-500', slug: 'instagram', active: true },
  { id: 'tk', name: 'TikTok', icon: 'Music2', color: 'neutral-900', slug: 'tiktok', active: true },
  { id: 'fb', name: 'Facebook', icon: 'Facebook', color: 'blue-600', slug: 'facebook', active: true },
  { id: 'yt', name: 'YouTube', icon: 'Youtube', color: 'red-600', slug: 'youtube', active: true }
];

export const initialServices: Service[] = [
  // Instagram Services
  { id: 'ig-followers', networkId: 'ig', name: 'Seguidores', description: 'Seguidores de alta calidad para posicionar tu cuenta de Instagram.', type: 'followers', active: true },
  { id: 'ig-likes', networkId: 'ig', name: 'Likes', description: 'Likes para tus publicaciones, fotos o Reels de Instagram.', type: 'likes', active: true },
  { id: 'ig-views', networkId: 'ig', name: 'Vistas de Reels', description: 'Aumenta el alcance de tus Reels con reproducciones rápidas.', type: 'views', active: true },
  { id: 'ig-comments', networkId: 'ig', name: 'Comentarios', description: 'Comentarios personalizados para generar conversación en tu perfil.', type: 'comments', active: true },

  // TikTok Services
  { id: 'tk-followers', networkId: 'tk', name: 'Seguidores', description: 'Aumenta tus seguidores de TikTok para desbloquear funciones live.', type: 'followers', active: true },
  { id: 'tk-likes', networkId: 'tk', name: 'Likes', description: 'Likes reales para empujar tus videos de TikTok al feed "Para Ti".', type: 'likes', active: true },
  { id: 'tk-views', networkId: 'tk', name: 'Vistas de Video', description: 'Vistas rápidas para mejorar el algoritmo de visualización de tus videos.', type: 'views', active: true },
  { id: 'tk-comments', networkId: 'tk', name: 'Comentarios', description: 'Comentarios reales para fomentar el debate y mejorar la viralidad de tus videos.', type: 'comments', active: true },

  // Facebook Services
  { id: 'fb-followers', networkId: 'fb', name: 'Seguidores de Página/Perfil', description: 'Consigue seguidores de alta fidelidad para tu Fanpage o perfil personal.', type: 'followers', active: true },
  { id: 'fb-likes', networkId: 'fb', name: 'Likes de Página/Post', description: 'Lleva confianza y reputación digital a tu Fanpage de Facebook.', type: 'likes', active: true },
  { id: 'fb-views', networkId: 'fb', name: 'Vistas de Video', description: 'Incrementa el alcance de tus videos y transmisiones de Facebook.', type: 'views', active: true },
  { id: 'fb-comments', networkId: 'fb', name: 'Comentarios de Post', description: 'Comentarios de alta calidad para dinamizar tus publicaciones.', type: 'comments', active: true },

  // YouTube Services
  { id: 'yt-subscribers', networkId: 'yt', name: 'Suscriptores', description: 'Suscriptores estables para monetizar tu canal de YouTube.', type: 'followers', active: true },
  { id: 'yt-likes', networkId: 'yt', name: 'Likes', description: 'Mejora la reputación y engagement de tus videos de YouTube con likes seguros.', type: 'likes', active: true },
  { id: 'yt-views', networkId: 'yt', name: 'Vistas de Video', description: 'Vistas premium de alta retención para tus videos de YouTube.', type: 'views', active: true },
  { id: 'yt-comments', networkId: 'yt', name: 'Comentarios', description: 'Comentarios personalizados de usuarios activos en YouTube.', type: 'comments', active: true }
];

export const initialVariants: Variant[] = [
  // Instagram Followers
  { id: 'ig-fol-1k', serviceId: 'ig-followers', quantity: 1000, price: 30000, oldPrice: 45000, label: 'best_seller', isBestValue: false, active: true },
  { id: 'ig-fol-2k', serviceId: 'ig-followers', quantity: 2000, price: 45000, oldPrice: 90000, label: 'none', isBestValue: false, active: true },
  { id: 'ig-fol-5k', serviceId: 'ig-followers', quantity: 5000, price: 80000, oldPrice: 225000, label: 'none', isBestValue: false, active: true },
  { id: 'ig-fol-10k', serviceId: 'ig-followers', quantity: 10000, price: 110000, oldPrice: 450000, label: 'best_price', isBestValue: true, active: true },

  // Instagram Likes
  { id: 'ig-lik-1k', serviceId: 'ig-likes', quantity: 1000, price: 15000, oldPrice: 25000, label: 'none', isBestValue: false, active: true },
  { id: 'ig-lik-5k', serviceId: 'ig-likes', quantity: 5000, price: 40000, oldPrice: 125000, label: 'best_seller', isBestValue: false, active: true },
  { id: 'ig-lik-10k', serviceId: 'ig-likes', quantity: 10000, price: 65000, oldPrice: 250000, label: 'best_price', isBestValue: true, active: true },

  // Instagram Views
  { id: 'ig-viw-5k', serviceId: 'ig-views', quantity: 5000, price: 10000, oldPrice: 20000, label: 'none', isBestValue: false, active: true },
  { id: 'ig-viw-20k', serviceId: 'ig-views', quantity: 20000, price: 25000, oldPrice: 80000, label: 'best_seller', isBestValue: true, active: true },

  // Instagram Comments
  { id: 'ig-com-50', serviceId: 'ig-comments', quantity: 50, price: 20000, oldPrice: 35000, label: 'none', isBestValue: false, active: true },
  { id: 'ig-com-100', serviceId: 'ig-comments', quantity: 100, price: 35000, oldPrice: 70000, label: 'best_seller', isBestValue: true, active: true },

  // TikTok Followers
  { id: 'tk-fol-1k', serviceId: 'tk-followers', quantity: 1000, price: 35000, oldPrice: 50000, label: 'none', isBestValue: false, active: true },
  { id: 'tk-fol-5k', serviceId: 'tk-followers', quantity: 5000, price: 120000, oldPrice: 250000, label: 'best_seller', isBestValue: true, active: true },

  // TikTok Likes
  { id: 'tk-lik-1k', serviceId: 'tk-likes', quantity: 1000, price: 18000, oldPrice: 30000, label: 'none', isBestValue: false, active: true },
  { id: 'tk-lik-5k', serviceId: 'tk-likes', quantity: 5000, price: 55000, oldPrice: 150000, label: 'best_seller', isBestValue: true, active: true },

  // TikTok Views
  { id: 'tk-viw-10k', serviceId: 'tk-views', quantity: 10000, price: 8000, oldPrice: 15000, label: 'none', isBestValue: false, active: true },
  { id: 'tk-viw-50k', serviceId: 'tk-views', quantity: 50000, price: 25000, oldPrice: 75000, label: 'best_seller', isBestValue: true, active: true },

  // TikTok Comments
  { id: 'tk-com-50', serviceId: 'tk-comments', quantity: 50, price: 22000, oldPrice: 40000, label: 'none', isBestValue: false, active: true },
  { id: 'tk-com-100', serviceId: 'tk-comments', quantity: 100, price: 38000, oldPrice: 75000, label: 'best_seller', isBestValue: true, active: true },

  // Facebook Followers
  { id: 'fb-fol-1k', serviceId: 'fb-followers', quantity: 1000, price: 32000, oldPrice: 50000, label: 'none', isBestValue: false, active: true },
  { id: 'fb-fol-5k', serviceId: 'fb-followers', quantity: 5000, price: 110000, oldPrice: 220000, label: 'best_seller', isBestValue: true, active: true },

  // Facebook Likes
  { id: 'fb-lik-1k', serviceId: 'fb-likes', quantity: 1000, price: 22000, oldPrice: 35000, label: 'none', isBestValue: false, active: true },
  { id: 'fb-lik-5k', serviceId: 'fb-likes', quantity: 5000, price: 75000, oldPrice: 175000, label: 'best_seller', isBestValue: true, active: true },

  // Facebook Views
  { id: 'fb-viw-5k', serviceId: 'fb-views', quantity: 5000, price: 12000, oldPrice: 20000, label: 'none', isBestValue: false, active: true },
  { id: 'fb-viw-20k', serviceId: 'fb-views', quantity: 20000, price: 35000, oldPrice: 70000, label: 'best_seller', isBestValue: true, active: true },

  // Facebook Comments
  { id: 'fb-com-50', serviceId: 'fb-comments', quantity: 50, price: 24000, oldPrice: 45000, label: 'none', isBestValue: false, active: true },
  { id: 'fb-com-100', serviceId: 'fb-comments', quantity: 100, price: 42000, oldPrice: 80000, label: 'best_seller', isBestValue: true, active: true },

  // YouTube Subscribers
  { id: 'yt-sub-500', serviceId: 'yt-subscribers', quantity: 500, price: 60000, oldPrice: 90000, label: 'none', isBestValue: false, active: true },
  { id: 'yt-sub-1k', serviceId: 'yt-subscribers', quantity: 1000, price: 110000, oldPrice: 180000, label: 'best_seller', isBestValue: true, active: true },

  // YouTube Likes
  { id: 'yt-lik-500', serviceId: 'yt-likes', quantity: 500, price: 20000, oldPrice: 35000, label: 'none', isBestValue: false, active: true },
  { id: 'yt-lik-1k', serviceId: 'yt-likes', quantity: 1000, price: 35000, oldPrice: 60000, label: 'best_seller', isBestValue: true, active: true },

  // YouTube Views
  { id: 'yt-viw-2k', serviceId: 'yt-views', quantity: 2000, price: 30000, oldPrice: 50000, label: 'none', isBestValue: false, active: true },
  { id: 'yt-viw-10k', serviceId: 'yt-views', quantity: 10000, price: 120000, oldPrice: 250000, label: 'best_seller', isBestValue: true, active: true },

  // YouTube Comments
  { id: 'yt-com-50', serviceId: 'yt-comments', quantity: 50, price: 28000, oldPrice: 50000, label: 'none', isBestValue: false, active: true },
  { id: 'yt-com-100', serviceId: 'yt-comments', quantity: 100, price: 48000, oldPrice: 90000, label: 'best_seller', isBestValue: true, active: true }
];

export const initialCombos: Combo[] = [
  {
    id: 'combo-viral-ig',
    name: 'Combo Instagram Viral',
    description: 'El kit perfecto para que tu video de Instagram alcance la pestaña Explorar y se viralice.',
    items: [
      { networkId: 'ig', serviceId: 'ig-followers', variantId: 'ig-fol-2k', quantity: 2000, name: '2,000 Seguidores Instagram' },
      { networkId: 'ig', serviceId: 'ig-likes', variantId: 'ig-lik-5k', quantity: 5000, name: '5,000 Likes de Instagram' },
      { networkId: 'ig', serviceId: 'ig-views', variantId: 'ig-viw-20k', quantity: 20000, name: '20,000 Vistas de Reels' }
    ],
    totalPrice: 95000, // Regular sum: 45000 + 40000 + 25000 = 110,000. Big savings!
    originalPrice: 110000,
    active: true,
    tag: 'Combo Viral'
  },
  {
    id: 'combo-tiktok-creator',
    name: 'Combo Creador TikTok',
    description: 'Aumenta tus números de forma balanceada y sube el engagement de tu cuenta de TikTok.',
    items: [
      { networkId: 'tk', serviceId: 'tk-followers', variantId: 'tk-fol-1k', quantity: 1000, name: '1,000 Seguidores TikTok' },
      { networkId: 'tk', serviceId: 'tk-likes', variantId: 'tk-lik-5k', quantity: 5000, name: '5,000 Likes de TikTok' },
      { networkId: 'tk', serviceId: 'tk-views', variantId: 'tk-viw-50k', quantity: 50000, name: '50,000 Vistas de Video' }
    ],
    totalPrice: 98000, // Regular sum: 35000 + 55000 + 25000 = 115,000
    originalPrice: 115000,
    active: true,
    tag: 'Empuje Algoritmo'
  }
];

export const initialCoupons: Coupon[] = [
  { id: 'c1', code: 'IMPULSA10', type: 'percent', value: 10, expiryDate: '2026-12-31', usageLimit: 500, currentUsage: 23, active: true },
  { id: 'c2', code: 'BIENVENIDO', type: 'fixed', value: 15000, expiryDate: '2026-12-31', usageLimit: 100, currentUsage: 12, active: true }
];

export const initialRecommendations: Recommendation[] = [
  { id: 'rec-1', triggerServiceType: 'followers', suggestedServiceId: 'ig-likes', message: '¡Recomendado! Añade likes reales para balancear tu crecimiento de forma orgánica.', active: true },
  { id: 'rec-2', triggerServiceType: 'followers', suggestedServiceId: 'ig-views', message: 'Los Reels populares necesitan reproducciones. ¡Añade vistas para potenciar tu alcance!', active: true },
  { id: 'rec-3', triggerServiceType: 'likes', suggestedServiceId: 'ig-followers', message: '¿Tienes interacción pero no seguidores? Consigue un perfil sólido sumando nuevos fans.', active: true }
];

export const defaultSettings: GlobalSettings = {
  whatsappNumber: '573208354198',
  instagramUrl: 'https://instagram.com/impulsanet_oficial',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VaZ8g7B9Bb6v8xX0A83A',
  bannerPromoText: '🔥 ¡PROMO SEMANAL! Usa el cupón IMPULSA10 para un 10% de descuento en todo tu carrito.',
  bannerPromoActive: true,
  maintenanceMode: false
};
