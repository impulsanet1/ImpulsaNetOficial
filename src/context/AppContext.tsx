import React, { createContext, useContext, useState, useEffect } from 'react';
import { Network, Service, Variant, Combo, Coupon, Recommendation, GlobalSettings, CartItem } from '../types';
import { initialNetworks, initialServices, initialVariants, initialCombos, initialCoupons, initialRecommendations, defaultSettings } from '../data/initialData';
import { OrderRecord, ClientRecord, ResellerRecord, PlanRecord, initialOrders, initialClients, initialResellers, initialPlans } from '../data/simulatedAdminData';
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface AppContextType {
  networks: Network[];
  services: Service[];
  variants: Variant[];
  combos: Combo[];
  coupons: Coupon[];
  recommendations: Recommendation[];
  settings: GlobalSettings;
  orders: OrderRecord[];
  clients: ClientRecord[];
  resellers: ResellerRecord[];
  plans: PlanRecord[];
  loading: boolean;
  
  // Cart
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  customerGoal: string;
  setCustomerGoal: (goal: string) => void;
  addItemToCart: (item: Omit<CartItem, 'id'>) => void;
  removeItemFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;

  // CRUD handlers
  updateNetworks: (newNets: Network[]) => void;
  updateServices: (newServs: Service[]) => void;
  updateVariants: (newVars: Variant[]) => void;
  updateCombos: (newCombos: Combo[]) => void;
  updateCoupons: (newCoups: Coupon[]) => void;
  updateRecommendations: (newRecs: Recommendation[]) => void;
  updateSettings: (newSettings: GlobalSettings) => void;
  addOrder: (order: OrderRecord) => void;
  updateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  updateClients: (newClients: ClientRecord[]) => void;
  updateResellers: (newResellers: ResellerRecord[]) => void;
  updatePlans: (newPlans: PlanRecord[]) => void;

  // Authentication
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminRegister: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const cleanForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj));
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networks, setNetworksState] = useState<Network[]>(initialNetworks);
  const [services, setServicesState] = useState<Service[]>(initialServices);
  const [variants, setVariantsState] = useState<Variant[]>(initialVariants);
  const [combos, setCombosState] = useState<Combo[]>(initialCombos);
  const [coupons, setCouponsState] = useState<Coupon[]>(initialCoupons);
  const [recommendations, setRecommendationsState] = useState<Recommendation[]>(initialRecommendations);
  const [settings, setSettingsState] = useState<GlobalSettings>(defaultSettings);
  const [orders, setOrdersState] = useState<OrderRecord[]>(initialOrders);
  const [clients, setClientsState] = useState<ClientRecord[]>(initialClients);
  const [resellers, setResellersState] = useState<ResellerRecord[]>(initialResellers);
  const [plans, setPlansState] = useState<PlanRecord[]>(initialPlans);
  const [loading, setLoading] = useState<boolean>(true);

  // Shopping Cart & Client Goal state (kept as local state since they are client-session specific)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('impulsanet_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('impulsanet_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [customerGoal, setCustomerGoal] = useState<string>(() => {
    return localStorage.getItem('impulsanet_customer_goal') || '';
  });

  // Admin Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('impulsanet_admin_logged') === 'true';
  });

  // --- PRIVATE ADMIN DATA FETCHING & AUTOMATIC SEEDING ---
  const fetchAdminData = async () => {
    try {
      console.log('Fetching admin collections (orders, clients) from Firestore...');
      const [ordersSnap, clientsSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'clients'))
      ]);
      setOrdersState(ordersSnap.docs.map(d => d.data() as OrderRecord));
      setClientsState(clientsSnap.docs.map(d => d.data() as ClientRecord));
    } catch (err) {
      console.warn("Could not fetch admin collections from Firestore:", err);
    }
  };

  const checkAndSeedDatabase = async () => {
    try {
      console.log('Checking if database needs seeding...');
      
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      if (!settingsSnap.exists()) {
        console.log('Seeding global settings document...');
        await setDoc(doc(db, 'settings', 'global'), cleanForFirestore(defaultSettings));
        setSettingsState(defaultSettings);
      }

      const checkAndSeedCollection = async (colName: string, defaultItems: any[], setter: (val: any[]) => void) => {
        try {
          const snap = await getDocs(collection(db, colName));
          if (snap.empty) {
            console.log(`Collection "${colName}" is empty. Seeding defaults...`);
            for (const item of defaultItems) {
              await setDoc(doc(db, colName, item.id), cleanForFirestore(item));
            }
            setter(defaultItems);
          }
        } catch (colErr) {
          console.warn(`Could not verify/seed collection "${colName}":`, colErr);
        }
      };

      await Promise.all([
        checkAndSeedCollection('networks', initialNetworks, setNetworksState),
        checkAndSeedCollection('services', initialServices, setServicesState),
        checkAndSeedCollection('variants', initialVariants, setVariantsState),
        checkAndSeedCollection('combos', initialCombos, setCombosState),
        checkAndSeedCollection('coupons', initialCoupons, setCouponsState),
        checkAndSeedCollection('recommendations', initialRecommendations, setRecommendationsState),
        checkAndSeedCollection('orders', initialOrders, setOrdersState),
        checkAndSeedCollection('clients', initialClients, setClientsState),
        checkAndSeedCollection('resellers', initialResellers, setResellersState),
        checkAndSeedCollection('plans', initialPlans, setPlansState)
      ]);
      console.log('Database verification and seeding checks completed.');
    } catch (err) {
      console.error("Error during automatic database seeding:", err);
    }
  };

  // --- INITIAL DATABASE SYNCHRONIZATION WITH REAL-TIME ONSNAPSHOT ---
  useEffect(() => {
    console.log('Setting up real-time Firestore listeners (onSnapshot)...');
    
    const unsubscribes = [
      onSnapshot(doc(db, 'settings', 'global'), (snap) => {
        if (snap.exists()) {
          setSettingsState({ ...defaultSettings, ...(snap.data() as GlobalSettings) });
        } else {
          setSettingsState(defaultSettings);
        }
        setLoading(false);
      }, (err) => {
        console.warn("Real-time sync error on settings:", err);
        setLoading(false);
      }),

      onSnapshot(collection(db, 'networks'), (snap) => {
        setNetworksState(snap.empty ? initialNetworks : snap.docs.map(d => d.data() as Network));
      }, (err) => {
        console.warn("Real-time sync error on networks:", err);
      }),

      onSnapshot(collection(db, 'services'), (snap) => {
        setServicesState(snap.empty ? initialServices : snap.docs.map(d => d.data() as Service));
      }, (err) => {
        console.warn("Real-time sync error on services:", err);
      }),

      onSnapshot(collection(db, 'variants'), (snap) => {
        setVariantsState(snap.empty ? initialVariants : snap.docs.map(d => d.data() as Variant));
      }, (err) => {
        console.warn("Real-time sync error on variants:", err);
      }),

      onSnapshot(collection(db, 'combos'), (snap) => {
        setCombosState(snap.empty ? initialCombos : snap.docs.map(d => d.data() as Combo));
      }, (err) => {
        console.warn("Real-time sync error on combos:", err);
      }),

      onSnapshot(collection(db, 'coupons'), (snap) => {
        setCouponsState(snap.empty ? initialCoupons : snap.docs.map(d => d.data() as Coupon));
      }, (err) => {
        console.warn("Real-time sync error on coupons:", err);
      }),

      onSnapshot(collection(db, 'recommendations'), (snap) => {
        setRecommendationsState(snap.empty ? initialRecommendations : snap.docs.map(d => d.data() as Recommendation));
      }, (err) => {
        console.warn("Real-time sync error on recommendations:", err);
      }),

      onSnapshot(collection(db, 'resellers'), (snap) => {
        setResellersState(snap.empty ? initialResellers : snap.docs.map(d => d.data() as ResellerRecord).sort((a, b) => a.order - b.order));
      }, (err) => {
        console.warn("Real-time sync error on resellers:", err);
      }),

      onSnapshot(collection(db, 'plans'), (snap) => {
        setPlansState(snap.empty ? initialPlans : snap.docs.map(d => d.data() as PlanRecord));
      }, (err) => {
        console.warn("Real-time sync error on plans:", err);
      })
    ];

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Sync client-specific cart state locally
  useEffect(() => { localStorage.setItem('impulsanet_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('impulsanet_applied_coupon', JSON.stringify(appliedCoupon)); }, [appliedCoupon]);
  useEffect(() => { localStorage.setItem('impulsanet_customer_goal', customerGoal); }, [customerGoal]);

  // Persistent Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const cleanedEmail = user.email?.trim().toLowerCase();
        if (cleanedEmail === 'admin@impulsanet.com' || cleanedEmail === 'estebanruiz.12vrgassergio@gmail.com') {
          setIsAdminLoggedIn(true);
          localStorage.setItem('impulsanet_admin_logged', 'true');
          localStorage.setItem('impulsanet_admin_email', user.email || '');
          
          await checkAndSeedDatabase();
          await fetchAdminData();
        } else {
          // Check if UID exists in admins collection
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
              setIsAdminLoggedIn(true);
              localStorage.setItem('impulsanet_admin_logged', 'true');
              localStorage.setItem('impulsanet_admin_email', user.email || '');
              
              await checkAndSeedDatabase();
              await fetchAdminData();
            } else {
              setIsAdminLoggedIn(false);
            }
          } catch (err) {
            setIsAdminLoggedIn(false);
          }
        }
      } else {
        setIsAdminLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Generic sync collection helper to keep lists aligned and handle deletions
  const syncCollection = async (collectionName: string, newItems: any[]) => {
    try {
      const snap = await getDocs(collection(db, collectionName));
      const existingIds = snap.docs.map(d => d.id);
      const newIds = new Set(newItems.map(item => item.id));

      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, collectionName, id));
        }
      }

      for (const item of newItems) {
        await setDoc(doc(db, collectionName, item.id), cleanForFirestore(item));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, collectionName);
    }
  };

  const updateNetworks = (newNets: Network[]) => {
    setNetworksState(newNets);
    syncCollection('networks', newNets);
  };

  const updateServices = (newServs: Service[]) => {
    setServicesState(newServs);
    syncCollection('services', newServs);
  };

  const updateVariants = (newVars: Variant[]) => {
    setVariantsState(newVars);
    syncCollection('variants', newVars);
  };

  const updateCombos = (newCombos: Combo[]) => {
    setCombosState(newCombos);
    syncCollection('combos', newCombos);
  };

  const updateCoupons = (newCoups: Coupon[]) => {
    setCouponsState(newCoups);
    syncCollection('coupons', newCoups);
  };

  const updateRecommendations = (newRecs: Recommendation[]) => {
    setRecommendationsState(newRecs);
    syncCollection('recommendations', newRecs);
  };

  const updateSettings = async (newSettings: GlobalSettings) => {
    setSettingsState(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'global'), cleanForFirestore(newSettings));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    }
  };

  const addOrder = async (order: OrderRecord) => {
    setOrdersState(prev => [order, ...prev]);
    try {
      await setDoc(doc(db, 'orders', order.id), cleanForFirestore(order));
      
      let clientUpdated = false;
      try {
        const clientQuery = query(collection(db, 'clients'), where('phone', '==', order.customerPhone));
        const clientSnap = await getDocs(clientQuery);
        
        if (clientSnap && !clientSnap.empty) {
          const clientDoc = clientSnap.docs[0];
          const clientData = clientDoc.data() as ClientRecord;
          const updatedClient = {
            ...clientData,
            ordersCount: clientData.ordersCount + 1,
            totalSpent: clientData.totalSpent + order.total
          };
          await setDoc(doc(db, 'clients', clientDoc.id), cleanForFirestore(updatedClient));
          clientUpdated = true;
        }
      } catch (clientErr) {
        console.log("Could not query client directory (expected for guests due to privacy rules):", clientErr);
      }

      if (!clientUpdated) {
        // Create new client profile for guest checkout
        const newClientId = `CLI-${Math.floor(100 + Math.random() * 900)}`;
        const newClient: ClientRecord = {
          id: newClientId,
          name: order.customerName,
          phone: order.customerPhone,
          ordersCount: 1,
          totalSpent: order.total,
          tier: "Regular"
        };
        try {
          await setDoc(doc(db, 'clients', newClientId), cleanForFirestore(newClient));
        } catch (createClientErr) {
          console.warn("Could not write guest client profile to Firestore:", createClientErr);
        }
      }

      // Sync latest values from Firestore ONLY if the user is an authenticated admin
      if (isAdminLoggedIn) {
        try {
          const [ordersSnap, clientsSnap] = await Promise.all([
            getDocs(collection(db, 'orders')),
            getDocs(collection(db, 'clients'))
          ]);
          setOrdersState(ordersSnap.docs.map(d => d.data() as OrderRecord));
          setClientsState(clientsSnap.docs.map(d => d.data() as ClientRecord));
        } catch (syncErr) {
          console.warn("Could not sync latest collections for admin:", syncErr);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderRecord['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrdersState(updated);
    try {
      await setDoc(doc(db, 'orders', orderId), cleanForFirestore({
        ...(orders.find(o => o.id === orderId) || {}),
        status
      }), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const updateClients = (newClients: ClientRecord[]) => {
    setClientsState(newClients);
    syncCollection('clients', newClients);
  };

  const updateResellers = (newResellers: ResellerRecord[]) => {
    setResellersState(newResellers);
    syncCollection('resellers', newResellers);
  };

  const updatePlans = (newPlans: PlanRecord[]) => {
    setPlansState(newPlans);
    syncCollection('plans', newPlans);
  };

  // --- CART CONTROLLER LOGIC ---
  const addItemToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      const matchIndex = prev.findIndex(
        i => i.network.id === item.network.id && 
             i.service.id === item.service.id && 
             i.variant.id === item.variant.id
      );
      if (matchIndex >= 0) {
        return prev.map((it, idx) => {
          if (idx === matchIndex) {
            return {
              ...it,
              customQuantity: (it.customQuantity || 1) + 1
            };
          }
          return it;
        });
      }
      return [...prev, { ...item, id: Math.random().toString(36).substring(2, 9), customQuantity: 1 }];
    });
  };

  const removeItemFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartItemQuantity = (id: string, customQuantity: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, customQuantity } : item));
  };

  const applyCouponCode = (code: string) => {
    const trimmedCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmedCode && c.active);
    if (!found) {
      return { success: false, message: 'Cupón inválido o inactivo' };
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (found.expiryDate && found.expiryDate < today) {
      return { success: false, message: 'Cupón expirado' };
    }

    if (found.usageLimit && found.currentUsage >= found.usageLimit) {
      return { success: false, message: 'Cupón con límite de usos agotado' };
    }

    setAppliedCoupon(found);
    return { success: true, message: 'Cupón aplicado con éxito!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCustomerGoal('');
  };

  const getCartSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.variant.price * (item.customQuantity || 1)), 0);
  };

  const getCartDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartSubtotal();
    if (appliedCoupon.type === 'percent') {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      return appliedCoupon.value;
    }
  };

  const getCartTotal = () => {
    const total = getCartSubtotal() - getCartDiscount();
    return Math.max(0, total);
  };

  // --- FIREBASE DIRECT AUTHENTICATION ---
  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const cleanedEmail = email.trim().toLowerCase();
      
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, pass);
      } catch (signInErr: any) {
        // Auto-register admin if default credentials are used in a new empty auth project
        if (
          signInErr.code === 'auth/user-not-found' || 
          signInErr.code === 'auth/invalid-credential' || 
          signInErr.code === 'auth/wrong-password'
        ) {
          if (
            (cleanedEmail === 'admin@impulsanet.com' && pass === 'admin_password_2026') ||
            (cleanedEmail === 'estebanruiz.12vrgassergio@gmail.com')
          ) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, cleanedEmail, pass);
              await setDoc(doc(db, 'admins', userCredential.user.uid), cleanForFirestore({
                email: cleanedEmail,
                role: 'admin'
              }));
            } catch (createErr: any) {
              console.error("Auto-registration of admin failed:", createErr);
              // If the email is already in use, it means the user exists but typed the wrong password!
              if (createErr?.code === 'auth/email-already-in-use') {
                throw signInErr;
              }
              // Otherwise, throw the actual create error (e.g. auth/operation-not-allowed or auth/weak-password)
              throw createErr;
            }
          } else {
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      if (userCredential && userCredential.user) {
        let adminDocExists = false;
        try {
          const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
          adminDocExists = adminDoc.exists();
        } catch (errDoc) {
          console.warn("Could not check admin document in Firestore collection, falling back to email check.", errDoc);
        }

        const isUserAdmin = adminDocExists || 
                           userCredential.user.email === 'admin@impulsanet.com' ||
                           userCredential.user.email === 'estebanruiz.12vrgassergio@gmail.com';
        
        if (isUserAdmin) {
          setIsAdminLoggedIn(true);
          localStorage.setItem('impulsanet_admin_logged', 'true');
          localStorage.setItem('impulsanet_admin_email', cleanedEmail);
          return true;
        } else {
          await signOut(auth);
          throw new Error('No tienes permisos de administrador en la colección admins.');
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      throw err;
    }
    return false;
  };

  const adminRegister = async (email: string, pass: string): Promise<boolean> => {
    try {
      const cleanedEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanedEmail, pass);
      await setDoc(doc(db, 'admins', userCredential.user.uid), cleanForFirestore({
        email: cleanedEmail,
        role: 'admin'
      }));
      setIsAdminLoggedIn(true);
      localStorage.setItem('impulsanet_admin_logged', 'true');
      localStorage.setItem('impulsanet_admin_email', cleanedEmail);
      await checkAndSeedDatabase();
      await fetchAdminData();
      return true;
    } catch (err) {
      console.error("Authentication registration error:", err);
      throw err;
    }
  };

  const adminLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
    setIsAdminLoggedIn(false);
    localStorage.removeItem('impulsanet_admin_logged');
    localStorage.removeItem('impulsanet_admin_email');
  };

  return (
    <AppContext.Provider value={{
      networks, services, variants, combos, coupons, recommendations, settings, orders, clients, resellers, plans, loading,
      cart, appliedCoupon, customerGoal, setCustomerGoal,
      addItemToCart, removeItemFromCart, updateCartItemQuantity, applyCouponCode, removeCoupon, clearCart,
      getCartSubtotal, getCartDiscount, getCartTotal,
      updateNetworks, updateServices, updateVariants, updateCombos, updateCoupons, updateRecommendations, updateSettings,
      addOrder, updateOrderStatus, updateClients, updateResellers, updatePlans,
      isAdminLoggedIn, adminLogin, adminRegister, adminLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

