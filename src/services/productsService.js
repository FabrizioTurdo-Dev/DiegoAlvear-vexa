// src/services/productsService.js
import { supabase } from '../config/supabase';

export const productsService = {
  // Función para que el admin cargue un producto nuevo
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([
          {
            nombre: productData.nombre,
            descripcion: productData.descripcion,
            precio: parseFloat(productData.precio),
            imagen_url: productData.imagen_url,
            categoria: productData.categoria,
            stock: parseInt(productData.stock) || 0
          }
        ])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al cargar producto:', error.message);
      return { success: false, error: error.message };
    }
  }
};