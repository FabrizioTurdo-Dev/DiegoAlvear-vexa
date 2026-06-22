import { supabase } from '../config/supabase';

const DEFAULT_CONFIG = {
  id: 'main',
  shop_name: 'Vexa',
  phone: '5491154922800',
  currency: 'ARS',
  welcome_msg: 'Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista',
  precio_visible: 'precio_reventa',
  min_order: 0,
};

export const configService = {
  async get() {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();
      if (error) {
        console.warn('Config query error, using defaults:', error.message);
        return DEFAULT_CONFIG;
      }
      return data || DEFAULT_CONFIG;
    } catch (err) {
      console.warn('Config fetch failed, using defaults:', err.message);
      return DEFAULT_CONFIG;
    }
  },

  async update(cfg) {
    const { data, error } = await supabase
      .from('config')
      .upsert({
        id: 'main',
        shop_name: cfg.shop_name,
        phone: cfg.phone,
        currency: cfg.currency,
        welcome_msg: cfg.welcome_msg,
        precio_visible: cfg.precio_visible,
        min_order: Number(cfg.min_order) || 0,
        updated_at: new Date().toISOString(),
      })
      .select();
    if (error) throw error;
    return data[0];
  },
};
