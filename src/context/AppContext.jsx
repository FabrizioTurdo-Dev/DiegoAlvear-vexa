import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { productsService } from "../services/productsService";
import { ordersService } from "../services/ordersService";
import { configService } from "../services/configService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function loadData() {
    try {
      setLoadError(null);
      const [prods, cfg] = await Promise.all([
        productsService.getAll(),
        configService.get(),
      ]);
      setProducts(prods);
      setConfig(cfg);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadOrders() {
    try {
      const o = await ordersService.getAll();
      setOrders(o);
    } catch (err) {
      console.error("Error cargando pedidos:", err.message);
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function addOrder(orderData) {
    const order = await ordersService.create(orderData);
    setOrders(prev => [order, ...prev]);
    return order;
  }

  async function updateOrderStatus(id, status) {
    const updated = await ordersService.updateStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  }

  async function refreshProducts() {
    const prods = await productsService.getAll();
    setProducts(prods);
  }

  async function refreshConfig() {
    const cfg = await configService.get();
    setConfig(cfg);
  }

  return (
    <AppContext.Provider value={{
      products, setProducts, refreshProducts,
      orders, setOrders, loadOrders, addOrder, updateOrderStatus,
      config, setConfig, refreshConfig,
      loading, loadError, user, signIn, signOut, loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
