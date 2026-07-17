export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  itemsSummary: string;
  total: number;
  status: 'pendiente' | 'entregado' | 'cancelado';
  goal: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  tier: 'Regular' | 'Socio VIP' | 'Revendedor';
}

export interface ResellerRecord {
  id: string;
  name: string;
  city: string; // Ciudad
  phone: string; // Teléfono
  description: string; // Descripción
  status: 'activo' | 'inactivo'; // Estado
  image: string; // Imagen
  order: number; // Orden
  email?: string;
  discountRate?: number;
}

export interface PlanRecord {
  id: string;
  name: string;
  price: number;
  billing: 'mensual' | 'anual';
  features: string[];
  active: boolean;
}

export const initialOrders: OrderRecord[] = [
  { id: 'ORD-1049', customerName: 'Carlos Mendoza', customerPhone: '+57 312 876 5432', date: '2026-07-15 14:32', itemsSummary: 'Instagram (Seguidores Premium) x5,000, Instagram (Likes Reales) x1,000', total: 95000, status: 'pendiente', goal: 'Impulsar mi negocio' },
  { id: 'ORD-1048', customerName: 'Valeria Gómez', customerPhone: '+57 300 456 7890', date: '2026-07-14 09:15', itemsSummary: 'Combo TikTok Creator Especial', total: 98000, status: 'entregado', goal: 'Más interacción' },
  { id: 'ORD-1047', customerName: 'Andrés Felipe', customerPhone: '+57 321 765 4321', date: '2026-07-13 18:44', itemsSummary: 'Instagram (Seguidores Premium) x10,000', total: 110000, status: 'entregado', goal: 'Mejorar mi perfil' }
];

export const initialClients: ClientRecord[] = [
  { id: 'CLI-001', name: 'Carlos Mendoza', phone: '+57 312 876 5432', ordersCount: 4, totalSpent: 240000, tier: 'Socio VIP' },
  { id: 'CLI-002', name: 'Valeria Gómez', phone: '+57 300 456 7890', ordersCount: 1, totalSpent: 98000, tier: 'Regular' },
  { id: 'CLI-003', name: 'Sergio Vargas', phone: '+57 311 999 8888', ordersCount: 12, totalSpent: 850000, tier: 'Revendedor' }
];

export const initialResellers: ResellerRecord[] = [
  { 
    id: 'RES-001', 
    name: 'Sergio Vargas Agency', 
    city: 'Medellín', 
    phone: '+57 311 999 8888', 
    description: 'Agencia de marketing premium dedicada a impulsar cuentas de creadores de contenido de alto impacto.', 
    status: 'activo', 
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256', 
    order: 1, 
    email: 'sergio@vargasagency.co', 
    discountRate: 20 
  },
  { 
    id: 'RES-002', 
    name: 'MediaBoost Colombia', 
    city: 'Bogotá', 
    phone: '+57 315 222 3333', 
    description: 'Expertos en posicionamiento acelerado y campañas virales para comercio electrónico y marcas personales.', 
    status: 'activo', 
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256', 
    order: 2, 
    email: 'contacto@mediaboost.co', 
    discountRate: 15 
  }
];

export const initialPlans: PlanRecord[] = [
  { id: 'plan-basic', name: 'Plan Crecimiento Inicial', price: 150000, billing: 'mensual', features: ['Gestión básica de 1 red social', '10,000 Vistas garantizadas al mes', 'Soporte prioritario por WhatsApp', 'Reporte mensual de rendimiento'], active: true },
  { id: 'plan-pro', name: 'Plan Autoridad Absoluta', price: 350000, billing: 'mensual', features: ['Gestión completa de 2 redes sociales', '30,000 Vistas + 5,000 Likes al mes', 'Estrategia de hashtags optimizada', 'Diseño de 4 publicaciones profesionales', 'Soporte prioritario 24/7'], active: true }
];
