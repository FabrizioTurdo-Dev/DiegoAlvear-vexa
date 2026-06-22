import { supabase } from '../config/supabase';

const BUCKET = 'productos';

export const productsService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('linea', { ascending: true })
        .order('producto', { ascending: true });
      if (error) {
        console.error('Products query error:', error.message, error.details);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Products fetch failed:', err.message);
      return [];
    }
  },

  async create(productData) {
    const { data, error } = await supabase
      .from('productos')
      .insert([{
        linea: productData.linea,
        producto: productData.producto,
        tipo: productData.tipo,
        ph: productData.ph || '-',
        tamanio: productData.tamanio,
        precio_bacha: Number(productData.precio_bacha) || 0,
        precio_reventa: Number(productData.precio_reventa) || 0,
        precio_salon: Number(productData.precio_salon) || 0,
        precio_sugerido: Number(productData.precio_sugerido) || 0,
        precio_visible: productData.precio_visible || 'precio_reventa',
        descripcion: productData.descripcion || '',
        beneficios: productData.beneficios || '',
        indicaciones: productData.indicaciones || '',
        active: productData.active !== false,
        image_url: productData.image_url || null,
      }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, productData) {
    const { data, error } = await supabase
      .from('productos')
      .update({
        linea: productData.linea,
        producto: productData.producto,
        tipo: productData.tipo,
        ph: productData.ph,
        tamanio: productData.tamanio,
        precio_bacha: Number(productData.precio_bacha) || 0,
        precio_reventa: Number(productData.precio_reventa) || 0,
        precio_salon: Number(productData.precio_salon) || 0,
        precio_sugerido: Number(productData.precio_sugerido) || 0,
        precio_visible: productData.precio_visible,
        descripcion: productData.descripcion,
        beneficios: productData.beneficios,
        indicaciones: productData.indicaciones,
        active: productData.active,
        image_url: productData.image_url,
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async toggleActive(id, active) {
    const { data, error } = await supabase
      .from('productos')
      .update({ active })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(imageUrl) {
    if (!imageUrl) return;
    const urlParts = imageUrl.split(`${BUCKET}/`);
    if (urlParts.length < 2) return;
    const filePath = urlParts[1];
    await supabase.storage.from(BUCKET).remove([filePath]);
  },
};
