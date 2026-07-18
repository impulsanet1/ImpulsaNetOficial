export interface Network {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g. "Instagram", "Video", "Facebook", "Youtube"
  color: string; // Tailwind accent color class, e.g. "pink-500", "cyan-400", "blue-600", "red-600"
  slug: string;
  active: boolean;
  order?: number;
}

export interface Service {
  id: string;
  networkId: string;
  name: string;
  description: string;
  type: 'followers' | 'likes' | 'views' | 'comments' | 'custom';
  active: boolean;
  order?: number;
}

export interface Variant {
  id: string;
  serviceId: string;
  quantity: number;
  price: number;
  oldPrice?: number;
  label?: 'best_seller' | 'best_price' | 'none'; // displayed as badges e.g. "Más vendido" or "Mejor precio"
  isBestValue?: boolean;
  active: boolean;
  order?: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  items: {
    networkId: string;
    serviceId: string;
    variantId: string;
    quantity: number;
    name: string; // descriptive name like "2000 Seguidores Instagram"
  }[];
  totalPrice: number;
  originalPrice: number;
  active: boolean;
  tag?: string; // e.g. "Combo Viral"
  order?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expiryDate: string; // YYYY-MM-DD
  usageLimit: number;
  currentUsage: number;
  active: boolean;
}

export interface Recommendation {
  id: string;
  triggerServiceType: string; // e.g. "followers" or networkId like "ig"
  suggestedServiceId: string; // service to recommend
  message: string;
  active: boolean;
}

export interface GlobalSettings {
  whatsappNumber: string;
  instagramUrl: string;
  whatsappChannelUrl: string;
  bannerPromoText: string;
  bannerPromoActive: boolean;
  maintenanceMode: boolean;
  
  // Custom design & branding texts
  logoText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  footerText?: string;
  whatsappSectionText?: string;
  
  // Custom design colors
  colorPrimary?: string;
  colorSecondary?: string;
  colorButtons?: string;
  colorTexts?: string;
  colorBg?: string;
  colorMenu?: string;
}

export interface CartItem {
  id: string; // unique item id in cart
  network: Network;
  service: Service;
  variant: Variant;
  customQuantity?: number; // fallback or multiplier
}
