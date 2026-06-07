// src/data/store.js
// Estado compartido. Los productos reales vienen de Supabase.
// INITIAL_PRODUCTS solo se usa como fallback si Supabase falla.

export const INITIAL_PRODUCTS = [];
export const INITIAL_ORDERS   = [];

// ⚠️  CAMBIÁ ESTE NÚMERO por el tuyo (formato internacional sin +)
// Ejemplo Argentina: 5491155667788  (54 = país, 9 = móvil, 11 = área, 55667788 = número)
export const SELLER_PHONE = "5491154922800";

export const ALL_SIZES_ADULTO = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
export const ALL_SIZES_NINO   = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

export function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}