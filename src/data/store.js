export const LINEAS = [
  'Argan Recovery',
  'Biotina Therapy',
  'Keratina Revitalize',
  'Neutro Balance',
  'Extra Acida Intense',
];

export const TIPOS = ['Shampoo', 'Máscara', 'Ampollas'];

export const TAMANIOS_SHAMPOO = ['1000ml', '250ml'];
export const TAMANIOS_MASCARA = ['1000gr', '270gr'];
export const TAMANIOS_AMPOLLAS = ['15ml x 12 unidades'];

export const PRECIO_FIELDS = [
  { key: 'precio_bacha', label: 'Precio Bacha' },
  { key: 'precio_reventa', label: 'Precio Reventa' },
  { key: 'precio_salon', label: 'Precio Salón' },
  { key: 'precio_sugerido', label: 'Precio Sugerido' },
];

export const PRECIO_VISIBLE_OPTIONS = [
  { key: 'precio_bacha', label: 'Bacha' },
  { key: 'precio_reventa', label: 'Reventa' },
  { key: 'precio_salon', label: 'Salón' },
  { key: 'precio_sugerido', label: 'Sugerido' },
];

export const SELLER_PHONE = "5491154922800";

export function formatPrice(n) {
  const num = Number(n);
  if (!num || num === 0) return '-';
  return "$" + num.toLocaleString("es-AR");
}

export function getTamaniosForTipo(tipo) {
  switch (tipo) {
    case 'Shampoo': return TAMANIOS_SHAMPOO;
    case 'Máscara': return TAMANIOS_MASCARA;
    case 'Ampollas': return TAMANIOS_AMPOLLAS;
    default: return [];
  }
}

export function getProductsByLinea(products) {
  const grouped = {};
  LINEAS.forEach(l => { grouped[l] = []; });
  products.forEach(p => {
    if (grouped[p.linea]) grouped[p.linea].push(p);
  });
  return grouped;
}
