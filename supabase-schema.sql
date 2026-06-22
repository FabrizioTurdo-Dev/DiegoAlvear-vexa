-- ============================================
-- VEXA CATÁLOGO MAYORISTA - Schema Supabase
-- ============================================
-- Ejecutá este script completo en el SQL Editor de Supabase
-- Esto crea las tablas, policies, datos iniciales y bucket de imágenes

-- ============================================
-- 1. TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  linea TEXT NOT NULL,
  producto TEXT NOT NULL,
  tipo TEXT NOT NULL,
  ph TEXT DEFAULT '-',
  tamanio TEXT NOT NULL,
  precio_bacha NUMERIC DEFAULT 0,
  precio_reventa NUMERIC DEFAULT 0,
  precio_salon NUMERIC DEFAULT 0,
  precio_sugerido NUMERIC DEFAULT 0,
  precio_visible TEXT DEFAULT 'precio_reventa',
  descripcion TEXT DEFAULT '',
  beneficios TEXT DEFAULT '',
  indicaciones TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. TABLA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nombre TEXT NOT NULL DEFAULT 'Cliente',
  cliente_telefono TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente',
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. TABLA: config
-- ============================================
CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  shop_name TEXT DEFAULT 'Vexa',
  phone TEXT DEFAULT '5491154922800',
  currency TEXT DEFAULT 'ARS',
  welcome_msg TEXT DEFAULT 'Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista',
  precio_visible TEXT DEFAULT 'precio_reventa',
  min_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. HABILITAR RLS
-- ============================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES: productos
-- ============================================
-- Cualquiera puede leer productos activos
CREATE POLICY "productos_select_public" ON productos
  FOR SELECT USING (active = true);

-- Admin autenticado puede leer todos los productos
CREATE POLICY "productos_select_admin" ON productos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin autenticado puede insertar productos
CREATE POLICY "productos_insert_admin" ON productos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin autenticado puede actualizar productos
CREATE POLICY "productos_update_admin" ON productos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin autenticado puede eliminar productos
CREATE POLICY "productos_delete_admin" ON productos
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 6. POLICIES: pedidos
-- ============================================
-- Cualquiera puede crear un pedido (cliente envía pedido)
CREATE POLICY "pedidos_insert_public" ON pedidos
  FOR INSERT WITH CHECK (true);

-- Solo admin autenticado puede ver pedidos
CREATE POLICY "pedidos_select_admin" ON pedidos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admin autenticado puede actualizar pedidos
CREATE POLICY "pedidos_update_admin" ON pedidos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- 7. POLICIES: config
-- ============================================
-- Cualquiera puede leer la config
CREATE POLICY "config_select_public" ON config
  FOR SELECT USING (true);

-- Solo admin autenticado puede actualizar config
CREATE POLICY "config_update_admin" ON config
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Solo admin autenticado puede insertar config
CREATE POLICY "config_insert_admin" ON config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 8. BUCKET DE IMÁGENES (Supabase Storage)
-- ============================================
-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: cualquiera puede ver imágenes (bucket público)
CREATE POLICY "storage_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos');

-- Policy: admin autenticado puede subir imágenes
CREATE POLICY "storage_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'productos' AND auth.role() = 'authenticated');

-- Policy: admin autenticado puede eliminar imágenes
CREATE POLICY "storage_delete_admin" ON storage.objects
  FOR DELETE USING (bucket_id = 'productos' AND auth.role() = 'authenticated');

-- ============================================
-- 9. CONFIG INICIAL
-- ============================================
INSERT INTO config (id, shop_name, phone, currency, welcome_msg, precio_visible, min_order)
VALUES ('main', 'Vexa', '5491154922800', 'ARS', 'Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista', 'precio_reventa', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. PRODUCTOS INICIALES (datos reales Vexa)
-- ============================================
INSERT INTO productos (linea, producto, tipo, ph, tamanio, precio_bacha, precio_reventa, precio_salon, precio_sugerido, precio_visible, descripcion, beneficios, indicaciones, active) VALUES

-- Argan Recovery
('Argan Recovery', 'Shampoo', 'Shampoo', '5.5', '1000ml', 5665, 13189, 12504, 19784, 'precio_reventa', 'Para cabello mixto con aceite de argán', 'Elasticidad - Resistencia - Brillo natural - Protección UV', 'Cabellos mixtos - Uso diario', true),
('Argan Recovery', 'Shampoo', 'Shampoo', '5.5', '250ml', 0, 0, 0, 0, 'precio_reventa', 'Para cabello mixto', 'Incluido en precio 1000ml', 'Cabellos mixtos', true),
('Argan Recovery', 'Máscara', 'Máscara', '5', '1000gr', 5445, 12504, 8167, 18756, 'precio_reventa', 'Tratamiento con aceite de argán', 'Regeneración profunda - Elasticidad - Brillo duradero - Anti-envejecimiento capilar', 'Cabello dañado - Envejecimiento capilar', true),
('Argan Recovery', 'Máscara', 'Máscara', '5', '270gr', 0, 0, 0, 0, 'precio_reventa', 'Tratamiento restaurador', 'Incluido en precio 1000gr', 'Cabello dañado', true),
('Argan Recovery', 'Ampollas', 'Ampollas', '5', '15ml x 12 unidades', 1696, 20350, 0, 2544, 'precio_reventa', 'Recuperación profunda con argán puro', 'Hidratación - Resistencia - Elasticidad', 'Tratamiento intensivo', true),

-- Biotina Therapy
('Biotina Therapy', 'Shampoo', 'Shampoo', '5', '1000ml', 8525, 19085, 21010, 28627, 'precio_reventa', 'Reduce y previene caída del cabello', 'Reduce caída - Fortalecimiento - Cuidado raíz a punta', 'Cabello con caída', true),
('Biotina Therapy', 'Shampoo', 'Shampoo', '5', '250ml', 0, 0, 0, 0, 'precio_reventa', 'Reduce y previene caída', 'Incluido en precio 1000ml', 'Cabello con caída', true),
('Biotina Therapy', 'Máscara', 'Máscara', '4', '1000gr', 8910, 21010, 31515, 13365, 'precio_reventa', 'Fortalece fibra capilar', 'Reduce caída - Fortalecimiento - Cuidado integral', 'Cabello con caída - Cabello tratado con formol', true),
('Biotina Therapy', 'Máscara', 'Máscara', '4', '270gr', 0, 0, 0, 0, 'precio_reventa', 'Fortalece fibra capilar', 'Incluido en precio 1000gr', 'Cabello con caída', true),
('Biotina Therapy', 'Ampollas', 'Ampollas', '-', '-', 0, 0, 0, 0, 'precio_reventa', 'Próximamente', 'Fortalecimiento - Reduce caída', 'Tratamiento intensivo caída', false),

-- Keratina Revitalize
('Keratina Revitalize', 'Shampoo', 'Shampoo', '5', '1000ml', 5665, 13189, 12504, 19784, 'precio_reventa', 'Repara fibra capilar dañada', 'Reparación - Fortalecimiento - Anti-frizz - Reestructurante', 'Cabello dañado - Quebradizo - Maltratado', true),
('Keratina Revitalize', 'Shampoo', 'Shampoo', '5', '250ml', 0, 0, 0, 0, 'precio_reventa', 'Reestructurante anti frizz', 'Incluido en precio 1000ml', 'Cabello dañado', true),
('Keratina Revitalize', 'Máscara', 'Máscara', '4', '1000gr', 5445, 12504, 8167, 18756, 'precio_reventa', 'Anti frizz reestructurante', 'Reparación - Reestructuración - Anti-frizz - Flexibilidad', 'Cabello dañado - Frizz - Quebradizo', true),
('Keratina Revitalize', 'Máscara', 'Máscara', '4', '270gr', 0, 0, 0, 0, 'precio_reventa', 'Sella con pH más ácido', 'Incluido en precio 1000gr', 'Cabello dañado', true),
('Keratina Revitalize', 'Ampollas', 'Ampollas', '5', '15ml x 12 unidades', 1696, 20350, 0, 2544, 'precio_reventa', 'Reparación para cabello con frizz', 'Reparación - Fortalecimiento', 'Cabello dañado', true),

-- Neutro Balance
('Neutro Balance', 'Shampoo', 'Shampoo', '7', '1000ml', 3905, 10450, 0, 15675, 'precio_reventa', 'Limpieza profunda para todo tipo de cabellos', 'Limpieza profunda', 'Todos los tipos de cabello - cueros cabelludos sensibles', true),
('Neutro Balance', 'Shampoo', 'Shampoo', '7', '250ml', 0, 0, 0, 0, 'precio_reventa', 'Sensibles y mantiene color', 'Incluido en precio 1000ml', 'Cabellos sensibles', true),

-- Extra Acida Intense
('Extra Acida Intense', 'Máscara', 'Máscara', '3.5', '1000gr', 3905, 8250, 12375, 0, 'precio_reventa', 'Aplicar post coloración en crema', 'Restauración post-color - Sellado fibra capilar - Fijación color - Hidratación profunda', 'Post-coloración - Cabello coloreado', true),
('Extra Acida Intense', 'Máscara', 'Máscara', '3.5', '270gr', 0, 0, 0, 0, 'precio_reventa', 'pH extra ácido fija color', 'Incluido en precio 1000gr', 'Post-coloración', true);

-- ============================================
-- NOTAS PARA EL ADMIN:
-- ============================================
-- 1. Para crear tu usuario admin, andá a Authentication > Users en Supabase
--    y creá un usuario con email y password.
--    Luego en el panel de tu app, logueate con esas credenciales.
--
-- 2. Las imágenes se suben desde el panel admin.
--    Se guardan en el bucket 'productos' de Supabase Storage.
--
-- 3. Los productos con precio 0 son los tamaños secundarios
--    (250ml, 270gr) que se incluyen en el precio del tamaño principal.
--
-- 4. El precio_visible determina qué precio se muestra en el catálogo público.
--    Se puede cambiar desde el panel admin > Configuración.
-- ============================================
