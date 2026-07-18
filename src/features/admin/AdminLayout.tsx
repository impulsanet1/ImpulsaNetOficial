import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Network, Service, Variant, Combo, Coupon, Recommendation, GlobalSettings } from '../../types';
import { ResellerRecord, PlanRecord } from '../../data/simulatedAdminData';
import { 
  LayoutDashboard, 
  Globe, 
  Tag, 
  Users, 
  Settings, 
  LogOut, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles,
  Layers,
  ArrowLeft,
  FileText,
  Palette,
  Eye,
  Sliders,
  Award,
  Copy,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToClient: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToClient }) => {
  const {
    networks, services, variants, combos, coupons, recommendations, settings, orders, clients, resellers, plans, loading,
    updateNetworks, updateServices, updateVariants, updateCombos, updateCoupons, updateRecommendations, updateSettings,
    updateOrderStatus, updateClients, updateResellers, updatePlans, adminLogout
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'networks' | 'combos' | 'coupons' | 'clients' | 'settings'>('dashboard');

  // --- MODAL / FORM STATES ---
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<'network' | 'service' | 'variant' | 'combo' | 'coupon' | 'reseller' | 'plan' | 'recommendation' | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // General state variables for forms
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Network form fields
  const [formIcon, setFormIcon] = useState('📸');
  const [formColor, setFormColor] = useState('indigo-600');

  // Service form fields
  const [serviceNetworkId, setServiceNetworkId] = useState('ig');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceType, setServiceType] = useState('followers');
  const [servicePlatformTab, setServicePlatformTab] = useState<string>('all');

  // Variant form fields
  const [selectedServiceIdForVariants, setSelectedServiceIdForVariants] = useState<string>(services[0]?.id || '');
  const [formQuantity, setFormQuantity] = useState(1000);
  const [formPrice, setFormPrice] = useState(30000);
  const [formOldPrice, setFormOldPrice] = useState(45000);
  const [formLabel, setFormLabel] = useState<'best_seller' | 'best_price' | 'none'>('none');

  // Coupon form fields
  const [formCode, setFormCode] = useState('');

  // --- CUSTOM CONFIRM MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // --- DRAG & DROP REORDERING STATES & HANDLERS ---
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<'network' | 'service' | 'variant' | 'combo' | null>(null);

  const [tempNetworks, setTempNetworks] = useState<Network[] | null>(null);
  const [tempServices, setTempServices] = useState<Service[] | null>(null);
  const [tempVariants, setTempVariants] = useState<Variant[] | null>(null);
  const [tempCombos, setTempCombos] = useState<Combo[] | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, type: 'network' | 'service' | 'variant' | 'combo') => {
    setDraggedIndex(index);
    setDraggedType(type);
    setTempNetworks(networks);
    setTempServices(services);
    setTempVariants(variants);
    setTempCombos(combos);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number, type: 'network' | 'service' | 'variant' | 'combo') => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === overIndex) return;

    if (type === 'network' && tempNetworks) {
      const list = [...tempNetworks];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(overIndex, 0, draggedItem);
      setDraggedIndex(overIndex);
      setTempNetworks(list);
    } else if (type === 'service' && tempServices) {
      const list = [...tempServices];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(overIndex, 0, draggedItem);
      setDraggedIndex(overIndex);
      setTempServices(list);
    } else if (type === 'variant' && tempVariants) {
      const activeVariants = tempVariants.filter(v => v.serviceId === selectedServiceIdForVariants);
      const otherVariants = tempVariants.filter(v => v.serviceId !== selectedServiceIdForVariants);
      const draggedItem = activeVariants[draggedIndex];
      const list = [...activeVariants];
      list.splice(draggedIndex, 1);
      list.splice(overIndex, 0, draggedItem);
      setDraggedIndex(overIndex);
      setTempVariants([...list, ...otherVariants]);
    } else if (type === 'combo' && tempCombos) {
      const list = [...tempCombos];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(overIndex, 0, draggedItem);
      setDraggedIndex(overIndex);
      setTempCombos(list);
    }
  };

  const handleDragEnd = () => {
    if (draggedType === 'network' && tempNetworks) {
      updateNetworks(tempNetworks);
    } else if (draggedType === 'service' && tempServices) {
      updateServices(tempServices);
    } else if (draggedType === 'variant' && tempVariants) {
      updateVariants(tempVariants);
    } else if (draggedType === 'combo' && tempCombos) {
      updateCombos(tempCombos);
    }

    setDraggedIndex(null);
    setDraggedType(null);
    setActiveDragId(null);
    setTempNetworks(null);
    setTempServices(null);
    setTempVariants(null);
    setTempCombos(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down', type: 'network' | 'service' | 'variant' | 'combo') => {
    const overIndex = direction === 'up' ? index - 1 : index + 1;

    if (type === 'network') {
      if (overIndex < 0 || overIndex >= networks.length) return;
      const list = [...networks];
      const draggedItem = list[index];
      list.splice(index, 1);
      list.splice(overIndex, 0, draggedItem);
      updateNetworks(list);
    } else if (type === 'service') {
      if (overIndex < 0 || overIndex >= services.length) return;
      const list = [...services];
      const draggedItem = list[index];
      list.splice(index, 1);
      list.splice(overIndex, 0, draggedItem);
      updateServices(list);
    } else if (type === 'variant') {
      const activeVariants = variants.filter(v => v.serviceId === selectedServiceIdForVariants);
      if (overIndex < 0 || overIndex >= activeVariants.length) return;
      const otherVariants = variants.filter(v => v.serviceId !== selectedServiceIdForVariants);
      const draggedItem = activeVariants[index];
      const list = [...activeVariants];
      list.splice(index, 1);
      list.splice(overIndex, 0, draggedItem);
      updateVariants([...list, ...otherVariants]);
    } else if (type === 'combo') {
      if (overIndex < 0 || overIndex >= combos.length) return;
      const list = [...combos];
      const draggedItem = list[index];
      list.splice(index, 1);
      list.splice(overIndex, 0, draggedItem);
      updateCombos(list);
    }
  };
  const [formCouponType, setFormCouponType] = useState<'percent' | 'fixed'>('percent');
  const [formValue, setFormValue] = useState(10);
  const [formExpiry, setFormExpiry] = useState('');
  const [formLimit, setFormLimit] = useState(100);

  // Reseller form fields
  const [resName, setResName] = useState('');
  const [resCity, setResCity] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resStatus, setResStatus] = useState<'activo' | 'inactivo'>('activo');
  const [resImage, setResImage] = useState('');
  const [resOrder, setResOrder] = useState(1);

  // Plan form fields
  const [planPrice, setPlanPrice] = useState(150000);
  const [planBilling, setPlanBilling] = useState<'mensual' | 'anual'>('mensual');
  const [planFeatures, setPlanFeatures] = useState('');

  // Recommendation form fields
  const [recTriggerType, setRecTriggerType] = useState('followers');
  const [recSuggestedServiceId, setRecSuggestedServiceId] = useState('');
  const [recMessage, setRecMessage] = useState('');

  // Combo form fields
  const [comboDesc, setComboDesc] = useState('');
  const [comboPrice, setComboPrice] = useState(95000);
  const [comboOriginalPrice, setComboOriginalPrice] = useState(110000);
  const [comboTag, setComboTag] = useState('');
  const [comboItems, setComboItems] = useState<any[]>([]);
  const [selectedVariantIdForComboAdd, setSelectedVariantIdForComboAdd] = useState('');

  // Settings form local state (pre-filled on mount or settings load)
  const [settingsForm, setSettingsForm] = useState<GlobalSettings>({ ...settings });

  // Update local settings form whenever AppContext settings refresh
  React.useEffect(() => {
    if (settings) {
      setSettingsForm({ ...settings });
    }
  }, [settings]);

  // Auto-select first service for variant packages when services list loads
  React.useEffect(() => {
    if (services.length > 0 && (!selectedServiceIdForVariants || !services.some(s => s.id === selectedServiceIdForVariants))) {
      setSelectedServiceIdForVariants(services[0].id);
    }
  }, [services, selectedServiceIdForVariants]);

  // --- ACTIONS HANDLERS ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert('¡Configuración guardada en el servidor y aplicada en tiempo real!');
  };

  const closeModal = () => {
    setEditingItem(null);
    setEditingType(null);
    setIsCreating(false);
  };

  // --- NETWORKS CRUD ---
  const handleCreateNetwork = () => {
    setIsCreating(true);
    setEditingType('network');
    setFormName('');
    setFormIcon('📸');
    setFormColor('indigo-600');
    setFormActive(true);
  };

  const handleEditNetwork = (net: Network) => {
    setIsCreating(false);
    setEditingItem(net);
    setEditingType('network');
    setFormName(net.name);
    setFormIcon(net.icon);
    setFormColor(net.color);
    setFormActive(net.active);
  };

  const handleSaveNetwork = () => {
    if (!formName.trim()) return;
    if (isCreating) {
      const newNet: Network = {
        id: Math.random().toString(36).substring(2, 9),
        name: formName,
        icon: formIcon,
        color: formColor,
        slug: formName.toLowerCase().replace(/\s+/g, '-'),
        active: formActive
      };
      updateNetworks([...networks, newNet]);
    } else {
      updateNetworks(networks.map(n => n.id === editingItem.id ? { ...n, name: formName, icon: formIcon, color: formColor, active: formActive } : n));
    }
    closeModal();
  };

  const handleDeleteNetwork = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar red social?',
      message: 'Se eliminarán también todos sus servicios y paquetes asociados de forma permanente.',
      onConfirm: () => {
        updateNetworks(networks.filter(n => n.id !== id));
        updateServices(services.filter(s => s.networkId !== id));
      }
    });
  };

  const handleDuplicateNetwork = (net: Network) => {
    const newNetworkId = Math.random().toString(36).substring(2, 9);
    const duplicatedNetwork: Network = {
      ...net,
      id: newNetworkId,
      name: `${net.name} (Copia)`,
      slug: `${net.slug}-copia-${Math.random().toString(36).substring(2, 5)}`,
      active: net.active
    };

    const originalServices = services.filter(s => s.networkId === net.id);
    const duplicatedServices: Service[] = [];
    const allDuplicatedVariants: Variant[] = [];

    originalServices.forEach(s => {
      const newServiceId = `${newNetworkId}-${Math.random().toString(36).substring(2, 6)}`;
      const dupS: Service = {
        ...s,
        id: newServiceId,
        networkId: newNetworkId,
        name: s.name,
        active: s.active
      };
      duplicatedServices.push(dupS);

      const serviceVars = variants.filter(v => v.serviceId === s.id);
      serviceVars.forEach(v => {
        const dupV: Variant = {
          ...v,
          id: Math.random().toString(36).substring(2, 9),
          serviceId: newServiceId,
          active: v.active
        };
        allDuplicatedVariants.push(dupV);
      });
    });

    updateNetworks([...networks, duplicatedNetwork]);
    if (duplicatedServices.length > 0) {
      updateServices([...services, ...duplicatedServices]);
    }
    if (allDuplicatedVariants.length > 0) {
      updateVariants([...variants, ...allDuplicatedVariants]);
    }
  };

  // --- SERVICES CRUD ---
  const handleCreateService = () => {
    setIsCreating(true);
    setEditingType('service');
    setFormName('');
    setServiceNetworkId(networks[0]?.id || 'ig');
    setServiceDesc('');
    setServiceType('followers');
    setFormActive(true);
  };

  const handleEditService = (s: Service) => {
    setIsCreating(false);
    setEditingItem(s);
    setEditingType('service');
    setFormName(s.name);
    setServiceNetworkId(s.networkId);
    setServiceDesc(s.description);
    setServiceType(s.type);
    setFormActive(s.active);
  };

  const handleSaveService = () => {
    if (!formName.trim()) return;
    if (isCreating) {
      const newS: Service = {
        id: `${serviceNetworkId}-${Math.random().toString(36).substring(2, 6)}`,
        networkId: serviceNetworkId,
        name: formName,
        description: serviceDesc,
        type: serviceType,
        active: formActive
      };
      updateServices([...services, newS]);
    } else {
      updateServices(services.map(s => s.id === editingItem.id ? { 
        ...s, 
        name: formName, 
        networkId: serviceNetworkId, 
        description: serviceDesc, 
        type: serviceType, 
        active: formActive 
      } : s));
    }
    closeModal();
  };

  const handleDeleteService = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar servicio?',
      message: '¿Seguro que deseas eliminar este servicio? Se borrarán sus paquetes asociados de forma permanente.',
      onConfirm: () => {
        updateServices(services.filter(s => s.id !== id));
        updateVariants(variants.filter(v => v.serviceId !== id));
      }
    });
  };

  const handleDuplicateService = (s: Service) => {
    const newServiceId = `${s.networkId}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicatedService: Service = {
      ...s,
      id: newServiceId,
      name: `${s.name} (Copia)`,
      active: s.active
    };

    const originalVariants = variants.filter(v => v.serviceId === s.id);
    const duplicatedVariants = originalVariants.map(v => ({
      ...v,
      id: Math.random().toString(36).substring(2, 9),
      serviceId: newServiceId,
      active: v.active
    }));

    updateServices([...services, duplicatedService]);
    if (duplicatedVariants.length > 0) {
      updateVariants([...variants, ...duplicatedVariants]);
    }
  };

  // --- QUANTITIES / VARIANTS CRUD ---
  const handleCreateVariant = () => {
    setIsCreating(true);
    setEditingType('variant');
    setFormQuantity(1000);
    setFormPrice(30000);
    setFormOldPrice(45000);
    setFormLabel('none');
    setFormActive(true);
  };

  const handleEditVariant = (v: Variant) => {
    setIsCreating(false);
    setEditingItem(v);
    setEditingType('variant');
    setFormQuantity(v.quantity);
    setFormPrice(v.price);
    setFormOldPrice(v.oldPrice || 0);
    setFormLabel(v.label || 'none');
    setFormActive(v.active);
  };

  const handleSaveVariant = () => {
    if (formQuantity <= 0 || formPrice <= 0) return;
    if (isCreating) {
      const newV: Variant = {
        id: Math.random().toString(36).substring(2, 9),
        serviceId: selectedServiceIdForVariants,
        quantity: formQuantity,
        price: formPrice,
        oldPrice: formOldPrice > 0 ? formOldPrice : undefined,
        label: formLabel === 'none' ? undefined : formLabel,
        isBestValue: formLabel === 'best_price',
        active: formActive
      };
      updateVariants([...variants, newV]);
    } else {
      updateVariants(variants.map(v => v.id === editingItem.id ? {
        ...v,
        quantity: formQuantity,
        price: formPrice,
        oldPrice: formOldPrice > 0 ? formOldPrice : undefined,
        label: formLabel === 'none' ? undefined : formLabel,
        isBestValue: formLabel === 'best_price',
        active: formActive
      } : v));
    }
    closeModal();
  };

  const handleDeleteVariant = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar paquete?',
      message: '¿Seguro que deseas eliminar este paquete de precio de forma permanente?',
      onConfirm: () => {
        updateVariants(variants.filter(v => v.id !== id));
      }
    });
  };

  // --- COUPONS CRUD ---
  const handleCreateCoupon = () => {
    setIsCreating(true);
    setEditingType('coupon');
    setFormCode('');
    setFormCouponType('percent');
    setFormValue(10);
    setFormExpiry('2026-12-31');
    setFormLimit(100);
    setFormActive(true);
  };

  const handleEditCoupon = (c: Coupon) => {
    setIsCreating(false);
    setEditingItem(c);
    setEditingType('coupon');
    setFormCode(c.code);
    setFormCouponType(c.type);
    setFormValue(c.value);
    setFormExpiry(c.expiryDate);
    setFormLimit(c.usageLimit);
    setFormActive(c.active);
  };

  const handleSaveCoupon = () => {
    if (!formCode.trim() || formValue <= 0) return;
    if (isCreating) {
      const newC: Coupon = {
        id: Math.random().toString(36).substring(2, 9),
        code: formCode.toUpperCase().trim(),
        type: formCouponType,
        value: formValue,
        expiryDate: formExpiry,
        usageLimit: formLimit,
        currentUsage: 0,
        active: formActive
      };
      updateCoupons([...coupons, newC]);
    } else {
      updateCoupons(coupons.map(c => c.id === editingItem.id ? {
        ...c,
        code: formCode.toUpperCase().trim(),
        type: formCouponType,
        value: formValue,
        expiryDate: formExpiry,
        usageLimit: formLimit,
        active: formActive
      } : c));
    }
    closeModal();
  };

  const handleDeleteCoupon = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar cupón?',
      message: '¿Seguro que deseas eliminar este cupón de descuento?',
      onConfirm: () => {
        updateCoupons(coupons.filter(c => c.id !== id));
      }
    });
  };

  // --- RESELLERS CRUD ---
  const handleCreateReseller = () => {
    setIsCreating(true);
    setEditingType('reseller');
    setResName('');
    setResCity('');
    setResPhone('');
    setResDesc('');
    setResStatus('activo');
    setResImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256');
    setResOrder(resellers.length + 1);
  };

  const handleEditReseller = (r: ResellerRecord) => {
    setIsCreating(false);
    setEditingItem(r);
    setEditingType('reseller');
    setResName(r.name);
    setResCity(r.city);
    setResPhone(r.phone);
    setResDesc(r.description);
    setResStatus(r.status);
    setResImage(r.image);
    setResOrder(r.order);
  };

  const handleSaveReseller = () => {
    if (!resName.trim() || !resCity.trim() || !resPhone.trim()) return;
    if (isCreating) {
      const newR: ResellerRecord = {
        id: `RES-${Math.floor(100 + Math.random() * 900)}`,
        name: resName,
        city: resCity,
        phone: resPhone,
        description: resDesc,
        status: resStatus,
        image: resImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        order: Number(resOrder)
      };
      updateResellers([...resellers, newR]);
    } else {
      updateResellers(resellers.map(r => r.id === editingItem.id ? {
        ...r,
        name: resName,
        city: resCity,
        phone: resPhone,
        description: resDesc,
        status: resStatus,
        image: resImage,
        order: Number(resOrder)
      } : r));
    }
    closeModal();
  };

  const handleDeleteReseller = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar revendedor?',
      message: '¿Seguro que deseas eliminar este revendedor de la lista pública?',
      onConfirm: () => {
        updateResellers(resellers.filter(r => r.id !== id));
      }
    });
  };

  // --- MONTHLY PLANS CRUD ---
  const handleCreatePlan = () => {
    setIsCreating(true);
    setEditingType('plan');
    setFormName('');
    setPlanPrice(150000);
    setPlanBilling('mensual');
    setPlanFeatures('Gestión básica de redes\n10,000 visualizaciones de apoyo\nSoporte por WhatsApp');
    setFormActive(true);
  };

  const handleEditPlan = (p: PlanRecord) => {
    setIsCreating(false);
    setEditingItem(p);
    setEditingType('plan');
    setFormName(p.name);
    setPlanPrice(p.price);
    setPlanBilling(p.billing);
    setPlanFeatures(p.features.join('\n'));
    setFormActive(p.active !== false);
  };

  const handleSavePlan = () => {
    if (!formName.trim() || planPrice <= 0) return;
    const featuresList = planFeatures.split('\n').filter(f => f.trim() !== '');
    if (isCreating) {
      const newP: PlanRecord = {
        id: `plan-${Math.random().toString(36).substring(2, 6)}`,
        name: formName,
        price: planPrice,
        billing: planBilling,
        features: featuresList,
        active: formActive
      };
      updatePlans([...plans, newP]);
    } else {
      updatePlans(plans.map(p => p.id === editingItem.id ? {
        ...p,
        name: formName,
        price: planPrice,
        billing: planBilling,
        features: featuresList,
        active: formActive
      } : p));
    }
    closeModal();
  };

  const handleDeletePlan = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar plan mensual?',
      message: '¿Seguro que deseas eliminar este plan de suscripción mensual?',
      onConfirm: () => {
        updatePlans(plans.filter(p => p.id !== id));
      }
    });
  };

  // --- COMBOS CRUD ---
  const handleAddVariantToCombo = (variantId: string) => {
    const v = variants.find(x => x.id === variantId);
    if (!v) return;
    const service = services.find(s => s.id === v.serviceId);
    const network = service ? networks.find(n => n.id === service.networkId) : null;
    
    const newItem = {
      networkId: network?.id || '',
      serviceId: service?.id || '',
      variantId: v.id,
      quantity: v.quantity,
      name: `${v.quantity.toLocaleString()} ${service?.name || ''} ${network?.name || ''}`
    };

    setComboItems(prev => [...prev, newItem]);
  };

  const handleRemoveItemFromCombo = (idx: number) => {
    setComboItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateCombo = () => {
    setIsCreating(true);
    setEditingType('combo');
    setFormName('');
    setComboDesc('');
    setComboTag('Combo Viral');
    setComboPrice(50000);
    setComboOriginalPrice(75000);
    setComboItems([]);
    setFormActive(true);
  };

  const handleEditCombo = (c: Combo) => {
    setIsCreating(false);
    setEditingItem(c);
    setEditingType('combo');
    setFormName(c.name);
    setComboDesc(c.description);
    setComboTag(c.tag || '');
    setComboPrice(c.totalPrice);
    setComboOriginalPrice(c.originalPrice);
    setComboItems([...c.items]);
    setFormActive(c.active);
  };

  const handleSaveCombo = () => {
    if (!formName.trim() || comboPrice <= 0) return;
    
    const savedCombo: Combo = {
      id: isCreating ? `combo-${Math.random().toString(36).substring(2, 6)}` : editingItem.id,
      name: formName,
      description: comboDesc,
      tag: comboTag,
      totalPrice: comboPrice,
      originalPrice: comboOriginalPrice,
      active: formActive,
      items: comboItems
    };

    if (isCreating) {
      updateCombos([...combos, savedCombo]);
    } else {
      updateCombos(combos.map(c => c.id === editingItem.id ? savedCombo : c));
    }
    closeModal();
  };

  const handleDeleteCombo = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar combo multiplataforma?',
      message: '¿Seguro que deseas eliminar este combo multiplataforma?',
      onConfirm: () => {
        updateCombos(combos.filter(c => c.id !== id));
      }
    });
  };

  // --- RECOMMENDATIONS CRUD ---
  const handleCreateRec = () => {
    setIsCreating(true);
    setEditingType('recommendation');
    setRecTriggerType('followers');
    setRecSuggestedServiceId(services[0]?.id || '');
    setRecMessage('');
    setFormActive(true);
  };

  const handleEditRec = (r: Recommendation) => {
    setIsCreating(false);
    setEditingItem(r);
    setEditingType('recommendation');
    setRecTriggerType(r.triggerServiceType);
    setRecSuggestedServiceId(r.suggestedServiceId);
    setRecMessage(r.message);
    setFormActive(r.active);
  };

  const handleSaveRec = () => {
    if (!recMessage.trim() || !recSuggestedServiceId) return;
    if (isCreating) {
      const newRec: Recommendation = {
        id: `rec-${Math.random().toString(36).substring(2, 6)}`,
        triggerServiceType: recTriggerType,
        suggestedServiceId: recSuggestedServiceId,
        message: recMessage,
        active: formActive
      };
      updateRecommendations([...recommendations, newRec]);
    } else {
      updateRecommendations(recommendations.map(r => r.id === editingItem.id ? {
        ...r,
        triggerServiceType: recTriggerType,
        suggestedServiceId: recSuggestedServiceId,
        message: recMessage,
        active: formActive
      } : r));
    }
    closeModal();
  };

  const handleDeleteRec = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar recomendación?',
      message: '¿Seguro que deseas eliminar esta recomendación de venta cruzada?',
      onConfirm: () => {
        updateRecommendations(recommendations.filter(r => r.id !== id));
      }
    });
  };

  // --- STATS LOGIC ---
  const totalRevenue = orders.filter(o => o.status === 'entregado').reduce((acc, o) => acc + o.total, 0);
  const activeCouponsCount = coupons.filter(c => c.active).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row relative font-sans">
      
      {/* Sidebar Panel Navigation */}
      <aside className="w-full md:w-72 bg-zinc-950 text-zinc-400 flex flex-col p-6 border-r border-zinc-900 md:sticky md:top-0 md:h-screen">
        <div className="flex items-center justify-between mb-10 px-2">
          <span className="text-lg font-black tracking-tighter text-white flex items-center gap-1.5">
            🚀 IMPULSANET<span className="text-indigo-500 font-extrabold">.</span>ADMIN
          </span>
          <button 
            onClick={onBackToClient}
            className="md:hidden p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-left focus:outline-none ${
              activeTab === 'dashboard' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('networks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-left focus:outline-none ${
              activeTab === 'networks' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Globe size={18} />
            <span>Redes y Servicios</span>
          </button>

          <button
            onClick={() => setActiveTab('combos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-left focus:outline-none ${
              activeTab === 'combos' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Package size={18} />
            <span>Combos y Planes</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-left focus:outline-none ${
              activeTab === 'coupons' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Tag size={18} />
            <span>Cupones</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-left focus:outline-none ${
              activeTab === 'clients' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Users size={18} />
            <span>Socios & Revendedores</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 text-left focus:outline-none ${
              activeTab === 'settings' ? 'bg-white text-zinc-950 shadow-sm' : 'hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Settings size={18} />
            <span>Configuración Web</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-zinc-900 space-y-2">
          <button
            onClick={onBackToClient}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-zinc-900 rounded-2xl transition-all text-left focus:outline-none"
          >
            <ArrowLeft size={18} /> Volver a la Tienda
          </button>
          <button
            onClick={adminLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-2xl transition-all text-left focus:outline-none"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <h2 className="text-3xl font-black text-zinc-950 capitalize tracking-tight">
                {activeTab === 'networks' ? 'Redes Sociales y Catálogos' : activeTab === 'combos' ? 'Combos y Suscripciones' : activeTab === 'settings' ? 'Branding & Paleta de Colores' : activeTab}
              </h2>
              <p className="text-zinc-500 text-xs font-semibold mt-1">Panel de control integral para administradores de ImpulsaNet.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl font-bold">
                Conexión Segura: Activa
              </span>
            </div>
          </div>

          {/* TAB CONTENT: DASHBOARD STATS & ORDERS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Stats overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Check size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ventas Entregadas</span>
                    <h4 className="text-2xl font-black text-zinc-950">${totalRevenue.toLocaleString()} COP</h4>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <Sliders size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Órdenes Pendientes</span>
                    <h4 className="text-2xl font-black text-zinc-950">
                      {orders.filter(o => o.status === 'pendiente').length} órdenes
                    </h4>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Tag size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cupones de Descuento</span>
                    <h4 className="text-2xl font-black text-zinc-950">{activeCouponsCount} activos</h4>
                  </div>
                </div>
              </div>

              {/* Orders table list */}
              <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <h3 className="font-extrabold text-zinc-950 text-lg">Historial y Flujo de Pedidos</h3>
                  <span className="text-xs bg-zinc-100 text-zinc-500 font-bold px-3 py-1.5 rounded-full">
                    {orders.length} pedidos totales
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs font-black uppercase bg-zinc-50/30">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">Cliente / Celular</th>
                        <th className="p-4">Resumen del Carrito</th>
                        <th className="p-4">Objetivo</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 pr-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-800">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-50/40">
                          <td className="p-4 pl-6 font-mono text-zinc-400">{o.id}</td>
                          <td className="p-4">
                            <div>{o.customerName}</div>
                            <span className="text-[11px] text-zinc-400">{o.customerPhone}</span>
                          </td>
                          <td className="p-4 max-w-xs truncate">{o.itemsSummary}</td>
                          <td className="p-4 text-xs font-bold text-indigo-600">{o.goal || 'No definido'}</td>
                          <td className="p-4 font-extrabold text-zinc-950">${o.total.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              o.status === 'entregado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              o.status === 'cancelado' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right space-x-1.5">
                            {o.status === 'pendiente' && (
                              <button 
                                onClick={() => updateOrderStatus(o.id, 'entregado')}
                                className="text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-all font-bold"
                              >
                                Marcar Entregado
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: NETWORKS & SERVICES & PACKAGES */}
          {activeTab === 'networks' && (
            <div className="space-y-12">
              {/* Networks CRUD */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-extrabold text-zinc-950 text-lg">Plataformas / Redes Sociales</h3>
                  <Button variant="secondary" size="sm" onClick={handleCreateNetwork} className="flex items-center gap-1">
                    <Plus size={16} /> Nueva Red Social
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(tempNetworks || networks).map((net, idx) => (
                    <div 
                      key={net.id} 
                      draggable={activeDragId === net.id} 
                      onDragStart={(e) => handleDragStart(e, idx, 'network')}
                      onDragOver={(e) => handleDragOver(e, idx, 'network')}
                      onDragEnd={handleDragEnd}
                      className={`p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between transition-all ${
                        draggedIndex === idx && draggedType === 'network' ? 'opacity-40 scale-95 border-dashed border-indigo-400' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-zinc-400">
                          <span 
                            onMouseDown={() => setActiveDragId(net.id)}
                            onTouchStart={() => setActiveDragId(net.id)}
                            onMouseUp={() => setActiveDragId(null)}
                            onTouchEnd={() => setActiveDragId(null)}
                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-200/50 rounded shrink-0" 
                            title="Arrastrar para reordenar"
                          >
                            <GripVertical size={16} />
                          </span>
                          <div className="flex flex-col">
                            <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up', 'network'); }} disabled={idx === 0} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                              <ChevronUp size={12} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down', 'network'); }} disabled={idx === (tempNetworks || networks).length - 1} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        </div>
                        <span className="text-2xl">{net.icon}</span>
                        <div>
                          <h4 className="font-extrabold text-zinc-950 text-sm leading-tight">{net.name}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${net.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                            {net.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); handleDuplicateNetwork(net); }} title="Duplicar red social" className="p-2 hover:bg-white rounded-lg text-indigo-500 hover:text-indigo-700 transition-colors">
                          <Copy size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEditNetwork(net); }} className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNetwork(net.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services CRUD */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-extrabold text-zinc-950 text-lg">Servicios por Plataforma</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Configura los servicios ofrecidos (Seguidores, Likes, Comentarios, etc.)</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreateService} className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
                    <Plus size={16} /> Nuevo Servicio
                  </Button>
                </div>

                {/* Platform Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-zinc-100">
                  <button
                    onClick={() => setServicePlatformTab('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      servicePlatformTab === 'all'
                        ? 'bg-zinc-950 text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800'
                    }`}
                  >
                    Todos
                  </button>
                  {networks.map(net => (
                    <button
                      key={net.id}
                      onClick={() => setServicePlatformTab(net.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        servicePlatformTab === net.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800'
                      }`}
                    >
                      {net.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(tempServices || services)
                    .filter(s => servicePlatformTab === 'all' || s.networkId === servicePlatformTab)
                    .map((s) => {
                      const originalIdx = (tempServices || services).findIndex(item => item.id === s.id);
                      const parentNet = networks.find(n => n.id === s.networkId);
                      return (
                        <div 
                          key={s.id} 
                          draggable={activeDragId === s.id} 
                          onDragStart={(e) => handleDragStart(e, originalIdx, 'service')}
                          onDragOver={(e) => handleDragOver(e, originalIdx, 'service')}
                          onDragEnd={handleDragEnd}
                          className={`p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between space-y-4 transition-all ${
                            draggedIndex === originalIdx && draggedType === 'service' ? 'opacity-40 scale-95 border-dashed border-indigo-400' : 'hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5 text-zinc-400">
                                <span 
                                  onMouseDown={() => setActiveDragId(s.id)}
                                  onTouchStart={() => setActiveDragId(s.id)}
                                  onMouseUp={() => setActiveDragId(null)}
                                  onTouchEnd={() => setActiveDragId(null)}
                                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-200/50 rounded shrink-0" 
                                  title="Arrastrar para reordenar"
                                >
                                  <GripVertical size={14} />
                                </span>
                                <div className="flex flex-col mr-1">
                                  <button onClick={(e) => { e.stopPropagation(); moveItem(originalIdx, 'up', 'service'); }} disabled={originalIdx === 0} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                                    <ChevronUp size={10} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); moveItem(originalIdx, 'down', 'service'); }} disabled={originalIdx === (tempServices || services).length - 1} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                                    <ChevronDown size={10} />
                                  </button>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest bg-zinc-200/60 text-zinc-700 px-2 py-0.5 rounded ml-1">
                                  {parentNet ? parentNet.name : s.networkId}
                                </span>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${s.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                {s.active ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-zinc-950 text-base mt-2">{s.name}</h4>
                            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{s.description}</p>
                            <span className="inline-block mt-2 text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                              ID Tipo: {s.type}
                            </span>
                          </div>
                          <div className="flex gap-1.5 justify-end border-t border-zinc-200/50 pt-3">
                            <button onClick={(e) => { e.stopPropagation(); handleDuplicateService(s); }} title="Duplicar servicio" className="p-2 hover:bg-white rounded-lg text-indigo-500 hover:text-indigo-700 transition-colors">
                              <Copy size={15} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleEditService(s); }} className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-colors">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteService(s.id); }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Quantities / Packages Variants CRUD */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-zinc-950 text-lg">Configurador de Cantidades y Precios Decrecientes</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Elige un servicio para cambiar, añadir o eliminar sus paquetes de venta.</p>
                  </div>
                  
                  <div className="flex gap-2.5">
                    <select
                      value={selectedServiceIdForVariants}
                      onChange={(e) => setSelectedServiceIdForVariants(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-zinc-800 outline-none"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {networks.find(n => n.id === s.networkId)?.name} - {s.name}
                        </option>
                      ))}
                    </select>

                    <Button variant="secondary" size="sm" onClick={handleCreateVariant} className="flex items-center gap-1.5">
                      <Plus size={16} /> Nuevo Paquete
                    </Button>
                  </div>
                </div>

                {/* Variants Table list */}
                <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs font-black uppercase bg-zinc-50">
                        <th className="p-4 pl-6 w-24">Orden</th>
                        <th className="p-4">Cantidad</th>
                        <th className="p-4">Precio Final</th>
                        <th className="p-4">Precio Anterior (Tachado)</th>
                        <th className="p-4">Etiqueta Badge</th>
                        <th className="p-4">Costo por Unidad</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 pr-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 font-semibold text-zinc-800">
                      {(tempVariants || variants).filter(v => v.serviceId === selectedServiceIdForVariants).map((v, idx) => {
                        const unitCost = v.price / v.quantity;
                        const activeVariantsCount = (tempVariants || variants).filter(va => va.serviceId === selectedServiceIdForVariants).length;
                        return (
                          <tr 
                            key={v.id} 
                            draggable={activeDragId === v.id} 
                            onDragStart={(e) => handleDragStart(e, idx, 'variant')}
                            onDragOver={(e) => handleDragOver(e, idx, 'variant')}
                            onDragEnd={handleDragEnd}
                            className={`hover:bg-zinc-50/30 transition-all ${
                              draggedIndex === idx && draggedType === 'variant' ? 'opacity-40 bg-zinc-100' : ''
                            }`}
                          >
                            <td className="p-4 pl-6 text-zinc-400 flex items-center gap-1">
                              <span 
                                onMouseDown={() => setActiveDragId(v.id)}
                                onTouchStart={() => setActiveDragId(v.id)}
                                onMouseUp={() => setActiveDragId(null)}
                                onTouchEnd={() => setActiveDragId(null)}
                                className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-200/50 rounded shrink-0" 
                                title="Arrastrar para reordenar"
                              >
                                <GripVertical size={14} />
                              </span>
                              <div className="flex flex-col">
                                <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up', 'variant'); }} disabled={idx === 0} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                                  <ChevronUp size={10} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down', 'variant'); }} disabled={idx === activeVariantsCount - 1} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                                  <ChevronDown size={10} />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 font-black text-base">{v.quantity.toLocaleString()}</td>
                            <td className="p-4 text-indigo-600 font-extrabold">${v.price.toLocaleString()} COP</td>
                            <td className="p-4 text-zinc-400 text-xs line-through">{v.oldPrice ? `$${v.oldPrice.toLocaleString()}` : 'Ninguno'}</td>
                            <td className="p-4">
                              {v.label && v.label !== 'none' ? (
                                <span className="bg-zinc-100 text-zinc-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                  {v.label === 'best_seller' ? 'Más vendido' : 'Mejor precio'}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-xs font-mono text-zinc-400">${unitCost.toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`text-xs ${v.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                {v.active ? 'Visible' : 'Oculto'}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right space-x-1.5">
                              <button onClick={(e) => { e.stopPropagation(); handleEditVariant(v); }} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-black transition-colors cursor-pointer" title="Editar paquete">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteVariant(v.id); }} className="p-2 hover:bg-red-50 hover:text-red-700 text-red-500 rounded-lg transition-colors cursor-pointer" title="Eliminar paquete">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cross-Selling Recommendations CRUD */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-zinc-950 text-lg">Recomendaciones Cruzadas en Carrito</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Gestiona el Smart-Selling que sugiere servicios adicionales basados en el carrito.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreateRec} className="flex items-center gap-1.5">
                    <Plus size={16} /> Nueva Recomendación
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => {
                    const suggestedServ = services.find(s => s.id === rec.suggestedServiceId);
                    return (
                      <div key={rec.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                              Disparador: {
                                rec.triggerServiceType === 'followers' ? 'Seguidores' :
                                rec.triggerServiceType === 'likes' ? 'Likes' :
                                rec.triggerServiceType === 'views' ? 'Reproducciones' :
                                rec.triggerServiceType === 'comments' ? 'Comentarios' :
                                (networks.find(n => n.id === rec.triggerServiceType)?.name || rec.triggerServiceType)
                              }
                            </span>
                            <span className={`text-xs font-bold ${rec.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                              {rec.active ? 'Activo' : 'Oculto'}
                            </span>
                          </div>
                          <p className="text-zinc-900 font-bold text-xs mt-3 leading-relaxed">"{rec.message}"</p>
                          <div className="text-[11px] text-zinc-400 mt-2 font-semibold">
                            Servicio sugerido: <span className="text-zinc-700 font-extrabold">{suggestedServ ? suggestedServ.name : rec.suggestedServiceId}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 justify-end border-t border-zinc-200/50 pt-3 mt-4">
                          <button onClick={() => handleEditRec(rec)} className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-colors">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDeleteRec(rec.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: COMBOS & PLANS */}
          {activeTab === 'combos' && (
            <div className="space-y-12">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-zinc-950 text-lg">Combos Virales Multiplataforma</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Sincroniza y crea combos pre-armados para tus redes sociales.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreateCombo} className="flex items-center gap-1.5">
                    <Plus size={16} /> Nuevo Combo
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(tempCombos || combos).map((combo, idx) => (
                    <div 
                      key={combo.id} 
                      draggable={activeDragId === combo.id} 
                      onDragStart={(e) => handleDragStart(e, idx, 'combo')}
                      onDragOver={(e) => handleDragOver(e, idx, 'combo')}
                      onDragEnd={handleDragEnd}
                      className={`p-6 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-4 flex flex-col justify-between transition-all ${
                        draggedIndex === idx && draggedType === 'combo' ? 'opacity-40 scale-95 border-dashed border-indigo-400' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <span 
                              onMouseDown={() => setActiveDragId(combo.id)}
                              onTouchStart={() => setActiveDragId(combo.id)}
                              onMouseUp={() => setActiveDragId(null)}
                              onTouchEnd={() => setActiveDragId(null)}
                              className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-200/50 rounded shrink-0" 
                              title="Arrastrar para reordenar"
                            >
                              <GripVertical size={14} />
                            </span>
                            <div className="flex flex-col mr-1">
                              <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up', 'combo'); }} disabled={idx === 0} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                                <ChevronUp size={10} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down', 'combo'); }} disabled={idx === (tempCombos || combos).length - 1} className="p-0.5 hover:bg-zinc-200/50 rounded disabled:opacity-30 cursor-pointer">
                                <ChevronDown size={10} />
                              </button>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                              {combo.tag || 'Combo'}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${combo.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                            {combo.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <h4 className="font-black text-zinc-950 text-lg leading-tight">{combo.name}</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed font-semibold">{combo.description}</p>
                        
                        <div className="space-y-1.5 border-t border-b border-zinc-200/60 py-3">
                          {combo.items.map((item, index) => (
                            <div key={index} className="text-xs text-zinc-600 font-bold flex justify-between">
                              <span>• {item.name}</span>
                              <span className="text-zinc-400">({item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-200/50 pt-4 mt-2">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-semibold line-through block">${combo.originalPrice.toLocaleString()} COP</span>
                          <span className="text-indigo-600 text-lg font-black">${combo.totalPrice.toLocaleString()} COP</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleEditCombo(combo); }} className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-colors" title="Editar Combo">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteCombo(combo.id); }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Eliminar Combo">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Subscriptions / Plans CRUD */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-zinc-950 text-lg">Suscripciones / Planes Mensuales</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Configura las opciones de acompañamiento recurrente.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreatePlan} className="flex items-center gap-1">
                    <Plus size={16} /> Nuevo Plan
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plans.map((p) => (
                    <div key={p.id} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                            Suscripción {p.billing}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${p.active !== false ? 'text-emerald-600' : 'text-zinc-400'}`}>
                            {p.active !== false ? 'Visible' : 'Oculto'}
                          </span>
                        </div>
                        <h4 className="font-black text-zinc-950 text-lg mt-2">{p.name}</h4>
                        <div className="text-zinc-950 font-black text-2xl mt-1">${p.price.toLocaleString()} COP</div>
                        
                        <ul className="mt-4 space-y-2">
                          {p.features.map((feat, idx) => (
                            <li key={idx} className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                              <span className="text-emerald-500">✓</span> {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex gap-1.5 justify-end border-t border-zinc-200/50 pt-4">
                        <button onClick={() => handleEditPlan(p)} className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-colors">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDeletePlan(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-lg">Cupones de Descuento Especiales</h3>
                  <p className="text-zinc-500 text-xs font-semibold">Configura códigos promocionales para fidelizar compras.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCreateCoupon} className="flex items-center gap-1.5">
                  <Plus size={16} /> Nuevo Cupón
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map((coup) => (
                  <div key={coup.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-zinc-950 tracking-wider font-mono bg-zinc-200 px-2.5 py-0.5 rounded-lg uppercase">
                          {coup.code}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${coup.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                          {coup.active ? 'Activo' : 'Oculto'}
                        </span>
                      </div>
                      <p className="text-indigo-600 text-xs font-extrabold mt-2.5">
                        Descuento: {coup.type === 'percent' ? `${coup.value}%` : `$${coup.value.toLocaleString()} COP`}
                      </p>
                      <p className="text-zinc-500 text-[11px] font-bold mt-1">
                        Usos: {coup.currentUsage} / {coup.usageLimit} • Expira: {coup.expiryDate}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditCoupon(coup)} className="p-2 hover:bg-white rounded-lg text-zinc-500">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteCoupon(coup.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: CLIENTS & RESELLERS */}
          {activeTab === 'clients' && (
            <div className="space-y-12">
              {/* Clients record list */}
              <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-extrabold text-zinc-950 text-lg">Base de Clientes</h3>
                  <p className="text-zinc-500 text-xs font-semibold">Registro de clientes captados de WhatsApp.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs font-black uppercase bg-zinc-50/30">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">WhatsApp</th>
                        <th className="p-4">Pedidos Concretados</th>
                        <th className="p-4">Dinero Invertido</th>
                        <th className="p-4 pr-6">Categoría</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-800">
                      {clients.map((cli) => (
                        <tr key={cli.id} className="hover:bg-zinc-50/40">
                          <td className="p-4 pl-6 font-mono text-zinc-400">{cli.id}</td>
                          <td className="p-4 font-extrabold">{cli.name}</td>
                          <td className="p-4">{cli.phone}</td>
                          <td className="p-4 text-center">{cli.ordersCount}</td>
                          <td className="p-4 font-extrabold text-zinc-950">${cli.totalSpent.toLocaleString()} COP</td>
                          <td className="p-4 pr-6">
                            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              cli.tier === 'Socio VIP' ? 'bg-indigo-50 text-indigo-700' :
                              cli.tier === 'Revendedor' ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {cli.tier}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resellers CRUD */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-zinc-950 text-lg">Agencias de Revendedores Autorizados</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Gestiona el posicionamiento de tus revendedores afiliados que se muestran al cliente.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreateReseller} className="flex items-center gap-1">
                    <Plus size={16} /> Nuevo Revendedor
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resellers.map((res) => (
                    <div key={res.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between space-y-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={res.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'} 
                          alt={res.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 bg-white flex-shrink-0 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <h4 className="font-black text-zinc-950 text-base leading-tight">{res.name}</h4>
                          <p className="text-zinc-400 text-xs font-extrabold">Ciudad: {res.city} • Tel: {res.phone}</p>
                          <p className="text-zinc-500 text-xs leading-relaxed font-semibold">{res.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-zinc-200/50 pt-3">
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          Orden Visual: #{res.order}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mr-2 ${
                            res.status === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            {res.status}
                          </span>
                          <button onClick={() => handleEditReseller(res)} className="p-2 hover:bg-white rounded-lg text-zinc-500 transition-colors">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDeleteReseller(res.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GLOBAL SETTINGS & DESIGN PALETTE */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Form Settings */}
              <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
                <h3 className="font-black text-zinc-950 text-lg flex items-center gap-2 pb-3 border-b border-zinc-100">
                  <Sliders size={20} className="text-indigo-600" /> Configuración Comercial
                </h3>
                
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Número de WhatsApp de Soporte (con código país)</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3.5 px-4 text-xs font-semibold outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-400">Ejemplo: 573012345678 (Colombia sin el símbolo +)</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Instagram del Negocio (Enlace completo)</label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3.5 px-4 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Canal de WhatsApp (Enlace completo)</label>
                    <input
                      type="text"
                      value={settingsForm.whatsappChannelUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappChannelUrl: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3.5 px-4 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Mensaje de Banner Promocional de la Tienda</label>
                    <input
                      type="text"
                      value={settingsForm.bannerPromoText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerPromoText: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3.5 px-4 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <div>
                      <span className="font-extrabold text-sm text-zinc-900 block">Mostrar banner promocional</span>
                      <span className="text-zinc-400 text-xs">Mostrar el anuncio destacado arriba de la tienda</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.bannerPromoActive || false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerPromoActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-black"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-200">
                    <div>
                      <span className="font-extrabold text-sm text-red-900 block">Modo de Mantenimiento</span>
                      <span className="text-red-700 text-xs">Oculta temporalmente la tienda al cliente</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.maintenanceMode || false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 text-red-600 border-zinc-300 rounded focus:ring-red-500"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full py-4 rounded-xl font-bold">
                    Guardar Configuración
                  </Button>
                </form>
              </div>

              {/* Right Column: Colors & Copyediting Texts */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Palette color selection */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                  <h3 className="font-black text-zinc-950 text-lg flex items-center gap-2 pb-3 border-b border-zinc-100">
                    <Palette size={20} className="text-indigo-600" /> Paleta de Colores de la Web
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Color Primario</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">{settingsForm.colorPrimary || '#4F46E5'}</span>
                        <input 
                          type="color" 
                          value={settingsForm.colorPrimary || '#4F46E5'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettingsForm(prev => ({ ...prev, colorPrimary: val }));
                          }}
                          className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Color Secundario</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">{settingsForm.colorSecondary || '#7C3AED'}</span>
                        <input 
                          type="color" 
                          value={settingsForm.colorSecondary || '#7C3AED'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettingsForm(prev => ({ ...prev, colorSecondary: val }));
                          }}
                          className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Botones & Acciones</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">{settingsForm.colorButtons || '#4F46E5'}</span>
                        <input 
                          type="color" 
                          value={settingsForm.colorButtons || '#4F46E5'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettingsForm(prev => ({ ...prev, colorButtons: val }));
                          }}
                          className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Color de Fondo Web</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">{settingsForm.colorBg || '#F8F9FA'}</span>
                        <input 
                          type="color" 
                          value={settingsForm.colorBg || '#F8F9FA'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettingsForm(prev => ({ ...prev, colorBg: val }));
                          }}
                          className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Fondo Barra de Menú</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">{settingsForm.colorMenu || '#FFFFFF'}</span>
                        <input 
                          type="color" 
                          value={settingsForm.colorMenu || '#FFFFFF'} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettingsForm(prev => ({ ...prev, colorMenu: val }));
                          }}
                          className="w-9 h-9 border border-zinc-200 rounded-lg cursor-pointer outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({
                          ...settingsForm,
                          colorPrimary: "#4F46E5",
                          colorSecondary: "#7C3AED",
                          colorButtons: "#4F46E5",
                          colorTexts: "#09090B",
                          colorBg: "#F8F9FA",
                          colorMenu: "#FFFFFF"
                        });
                        alert('Colores restablecidos a los valores por defecto.');
                      }}
                      className="text-xs text-zinc-500 hover:text-black font-extrabold block text-center w-full pt-3 border-t border-zinc-100"
                    >
                      Restablecer Colores por Defecto
                    </button>
                  </div>
                </div>

                {/* Typography / Copyediting Custom Texts */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                  <h3 className="font-black text-zinc-950 text-lg flex items-center gap-2 pb-3 border-b border-zinc-100">
                    <FileText size={20} className="text-indigo-600" /> Copys y Textos de la Web
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Texto del Logo / Marca</label>
                      <input 
                        type="text" 
                        value={settingsForm.logoText || 'IMPULSANET'} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl py-2 px-3 text-xs font-semibold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Título Principal Hero</label>
                      <textarea 
                        rows={2}
                        value={settingsForm.heroTitle || 'No solo vendemos seguidores. Construimos autoridad.'} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl py-2 px-3 text-xs font-semibold outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subtítulo Hero</label>
                      <textarea 
                        rows={3}
                        value={settingsForm.heroSubtitle || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl py-2 px-3 text-xs font-semibold outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Texto de Pie de Página (Footer)</label>
                      <textarea 
                        rows={3}
                        value={settingsForm.footerText || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl py-2 px-3 text-xs font-semibold outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Texto Sección de WhatsApp</label>
                      <input 
                        type="text" 
                        value={settingsForm.whatsappSectionText || '¿Necesitas un plan personalizado? Contáctanos por WhatsApp.'} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappSectionText: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl py-2 px-3 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* ADMIN EDITING MODAL WINDOW */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-2xl p-6 md:p-8 w-full max-w-md space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <h3 className="font-black text-zinc-950 text-lg">
                {isCreating ? 'Crear' : 'Editar'} {
                  editingType === 'network' ? 'Red Social' : 
                  editingType === 'service' ? 'Servicio' : 
                  editingType === 'variant' ? 'Paquete de Cantidad' : 
                  editingType === 'coupon' ? 'Cupón' : 
                  editingType === 'reseller' ? 'Revendedor' :
                  editingType === 'recommendation' ? 'Recomendación' : 
                  editingType === 'combo' ? 'Combo' : 'Plan Mensual'
                }
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 focus:outline-none">
                <X size={18} />
              </button>
            </div>

            {/* Network form fields */}
            {editingType === 'network' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Nombre de la red social</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: YouTube, Threads"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Emoji Icono</label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: 🎥, 📸, 🎵"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">¿Mostrar en la Tienda?</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Service form fields */}
            {editingType === 'service' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Red Social</label>
                  <select
                    value={serviceNetworkId}
                    onChange={(e) => setServiceNetworkId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold text-zinc-800 outline-none"
                  >
                    {networks.map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Nombre del Servicio</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: Seguidores VIP"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Descripción de Venta</label>
                  <textarea
                    rows={2}
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none resize-none"
                    placeholder="Ej: Seguidores con foto de perfil activos..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Categoría / Tipo Técnico</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold text-zinc-800 outline-none"
                  >
                    <option value="followers">Seguidores</option>
                    <option value="likes">Me gusta / Likes</option>
                    <option value="views">Reproducciones / Vistas</option>
                    <option value="comments">Comentarios</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">¿Servicio Habilitado?</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Variant Package form fields */}
            {editingType === 'variant' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Cantidad de impulso</label>
                  <input
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Precio con Descuento ($ COP)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Precio Anterior Tachado ($ COP)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Dejar en 0 para no mostrar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Etiqueta Especial Badge</label>
                  <select
                    value={formLabel}
                    onChange={(e: any) => setFormLabel(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold text-zinc-800 outline-none"
                  >
                    <option value="none">Sin Etiqueta</option>
                    <option value="best_seller">Más vendido 🔥</option>
                    <option value="best_price">Mejor precio ⭐</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Habilitar este paquete</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Coupon form fields */}
            {editingType === 'coupon' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Código del cupón</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none uppercase"
                    placeholder="Ej: REGALOPROMO"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Tipo de Descuento</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input type="radio" checked={formCouponType === 'percent'} onChange={() => setFormCouponType('percent')} />
                      <span>Porcentual %</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input type="radio" checked={formCouponType === 'fixed'} onChange={() => setFormCouponType('fixed')} />
                      <span>Valor Fijo $</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Valor del Descuento</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Fecha de Expiración</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Límite de Usos</label>
                  <input
                    type="number"
                    value={formLimit}
                    onChange={(e) => setFormLimit(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Cupón Activo</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Reseller form fields */}
            {editingType === 'reseller' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Nombre de la Agencia</label>
                  <input
                    type="text"
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: MediaBoost"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Ciudad</label>
                  <input
                    type="text"
                    value={resCity}
                    onChange={(e) => setResCity(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: Bogotá"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: +57 315..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Descripción</label>
                  <textarea
                    rows={2}
                    value={resDesc}
                    onChange={(e) => setResDesc(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none resize-none"
                    placeholder="Escribe el perfil o especialidad..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">URL de Imagen / Logo</label>
                  <input
                    type="text"
                    value={resImage}
                    onChange={(e) => setResImage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Enlace de imagen pública de logo"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Orden de Aparición Visual</label>
                  <input
                    type="number"
                    value={resOrder}
                    onChange={(e) => setResOrder(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Estado</label>
                  <select
                    value={resStatus}
                    onChange={(e: any) => setResStatus(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  >
                    <option value="activo">Activo / Visible</option>
                    <option value="inactivo">Inactivo / Oculto</option>
                  </select>
                </div>
              </div>
            )}

            {/* Plan Subscription form fields */}
            {editingType === 'plan' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Nombre del Plan</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: Plan Crecimiento Acelerado"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Precio Recurrente ($ COP)</label>
                  <input
                    type="number"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Facturación</label>
                  <select
                    value={planBilling}
                    onChange={(e: any) => setPlanBilling(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Características (Una por línea)</label>
                  <textarea
                    rows={4}
                    value={planFeatures}
                    onChange={(e) => setPlanFeatures(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold outline-none resize-none"
                    placeholder="Gestión de 1 Red Social&#10;Consultoría de Marca&#10;Apoyo Visual"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Habilitado y visible</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Combo form fields */}
            {editingType === 'combo' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Nombre del Combo</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: Combo Instagram Famoso"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Descripción de Venta</label>
                  <textarea
                    rows={2}
                    value={comboDesc}
                    onChange={(e) => setComboDesc(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none resize-none"
                    placeholder="Ej: Impulsa tu engagement con seguidores, likes y vistas de Reels..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Etiqueta Badge</label>
                  <input
                    type="text"
                    value={comboTag}
                    onChange={(e) => setComboTag(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    placeholder="Ej: Combo Viral, Súper Ahorro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-zinc-500 uppercase">Precio Combo ($ COP)</label>
                    <input
                      type="number"
                      value={comboPrice}
                      onChange={(e) => setComboPrice(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-zinc-500 uppercase">Precio Original ($ COP)</label>
                    <input
                      type="number"
                      value={comboOriginalPrice}
                      onChange={(e) => setComboOriginalPrice(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3 px-4 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Items contained in Combo */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase block">Paquetes Incluidos en el Combo</label>
                  
                  {/* List of current items */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                    {comboItems.length === 0 ? (
                      <span className="text-[10px] text-zinc-400 font-bold block text-center py-2">Ningún paquete añadido aún.</span>
                    ) : (
                      comboItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white border border-zinc-100 p-2 rounded-xl shadow-sm">
                          <span className="font-extrabold text-zinc-700">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromCombo(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add new item controller */}
                  <div className="space-y-2 border border-dashed border-zinc-200 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-zinc-400 block">Agregar Paquete al Combo</span>
                    <div className="flex gap-2">
                      <select
                        value={selectedVariantIdForComboAdd}
                        onChange={(e) => setSelectedVariantIdForComboAdd(e.target.value)}
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-800 outline-none max-w-[70%]"
                      >
                        <option value="">-- Seleccionar Paquete --</option>
                        {variants.map(v => {
                          const service = services.find(s => s.id === v.serviceId);
                          const network = service ? networks.find(n => n.id === service.networkId) : null;
                          return (
                            <option key={v.id} value={v.id}>
                              {network?.name} - {service?.name} ({v.quantity.toLocaleString()})
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedVariantIdForComboAdd) {
                            handleAddVariantToCombo(selectedVariantIdForComboAdd);
                            setSelectedVariantIdForComboAdd('');
                          }
                        }}
                        className="bg-black hover:bg-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-extrabold flex items-center gap-1 flex-1 justify-center"
                      >
                        <Plus size={14} /> Añadir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Combo Activo (Visible)</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            {/* Recommendation form fields */}
            {editingType === 'recommendation' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Tipo disparador (trigger type)</label>
                  <select
                    value={recTriggerType}
                    onChange={(e) => setRecTriggerType(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold text-zinc-800 outline-none"
                  >
                    <option value="followers">Al añadir Seguidores (Cualquier Red)</option>
                    <option value="likes">Al añadir Likes (Cualquier Red)</option>
                    <option value="views">Al añadir Reproducciones (Cualquier Red)</option>
                    <option value="comments">Al añadir Comentarios (Cualquier Red)</option>
                    <optgroup label="Por Red Social">
                      {networks.map(n => (
                        <option key={n.id} value={n.id}>Al añadir cualquier servicio de {n.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Servicio Sugerido</label>
                  <select
                    value={recSuggestedServiceId}
                    onChange={(e) => setRecSuggestedServiceId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-xs font-semibold text-zinc-800 outline-none"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {networks.find(n => n.id === s.networkId)?.name} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">Mensaje de recomendación (Smart-Selling Copy)</label>
                  <textarea
                    rows={3}
                    value={recMessage}
                    onChange={(e) => setRecMessage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs font-semibold outline-none resize-none"
                    placeholder="Ej: ¡Recomendado! Añade likes para balancear tu crecimiento..."
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-extrabold text-zinc-500 uppercase">¿Recomendación Activa?</label>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-zinc-100">
              <Button variant="secondary" className="flex-1" onClick={closeModal}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => {
                if (editingType === 'network') handleSaveNetwork();
                if (editingType === 'service') handleSaveService();
                if (editingType === 'variant') handleSaveVariant();
                if (editingType === 'coupon') handleSaveCoupon();
                if (editingType === 'reseller') handleSaveReseller();
                if (editingType === 'plan') handleSavePlan();
                if (editingType === 'recommendation') handleSaveRec();
                if (editingType === 'combo') handleSaveCombo();
              }}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-2xl p-6 md:p-8 w-full max-w-sm space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-zinc-950 text-lg leading-tight">
                {confirmModal.title}
              </h3>
              <p className="text-zinc-500 text-sm font-semibold leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 active:bg-zinc-100 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs transition-all shadow-md shadow-red-600/10 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminLayout;
