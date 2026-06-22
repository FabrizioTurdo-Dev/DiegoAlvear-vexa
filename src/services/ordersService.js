import { supabase } from '../config/supabase';

export const ordersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(orderData) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        cliente_nombre: orderData.cliente_nombre || 'Cliente',
        cliente_telefono: orderData.cliente_telefono || '',
        items: orderData.items || [],
        total: orderData.total || 0,
        status: 'pendiente',
        notas: orderData.notas || '',
      }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateNotas(id, notas) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ notas })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
};
