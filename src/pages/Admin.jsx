import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice, LINEAS, TIPOS, getTamaniosForTipo, PRECIO_FIELDS, PRECIO_VISIBLE_OPTIONS } from "../data/store";
import { productsService } from "../services/productsService";
import { configService } from "../services/configService";
import "../styles/admin.css";

function Badge({ status }) {
  return <span className={`admin-badge ${status}`}>{status}</span>;
}

function Input({ label, ...props }) {
  return (
    <div className="admin-input-group">
      {label && <label className="admin-label">{label}</label>}
      <input {...props} className="admin-input" style={props.style} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="admin-input-group">
      {label && <label className="admin-label">{label}</label>}
      <select {...props} className="admin-select">{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  return (
    <button {...props} className={`admin-btn ${variant} ${small ? 'small' : ''}`} style={props.style}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`admin-modal ${wide ? 'wide' : ''}`}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    linea: product?.linea || LINEAS[0],
    producto: product?.producto || "",
    tipo: product?.tipo || TIPOS[0],
    ph: product?.ph || "-",
    tamanio: product?.tamanio || "",
    precio_bacha: product?.precio_bacha || "",
    precio_reventa: product?.precio_reventa || "",
    precio_salon: product?.precio_salon || "",
    precio_sugerido: product?.precio_sugerido || "",
    precio_visible: product?.precio_visible || "precio_reventa",
    descripcion: product?.descripcion || "",
    beneficios: product?.beneficios || "",
    indicaciones: product?.indicaciones || "",
    active: product?.active !== false,
    image_url: product?.image_url || null,
  });
  const [imgPreview, setImgPreview] = useState(product?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const tamanios = getTamaniosForTipo(form.tipo);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await productsService.uploadImage(file);
      setImgPreview(url);
      set("image_url", url);
    } catch (err) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit() {
    if (!form.producto || !form.linea || !form.tipo) return alert("Completá línea, producto y tipo");
    if (!form.tamanio) return alert("Seleccioná un tamaño");
    onSave({ ...form, id: product?.id || null });
  }

  return (
    <div className="admin-form">
      <div className="admin-img-upload">
        <div className="admin-img-preview" onClick={() => fileRef.current.click()}>
          {imgPreview
            ? <img src={imgPreview} alt="" />
            : (form.tipo === 'Shampoo' ? '🧴' : form.tipo === 'Máscara' ? '💆' : '💧')}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        <div className="admin-img-actions">
          <Btn small variant="ghost" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? '⏳ Subiendo...' : '📎 Subir foto'}
          </Btn>
          {imgPreview && (
            <Btn small variant="danger" onClick={() => { setImgPreview(null); set("image_url", null); }}>
              ✕ Quitar imagen
            </Btn>
          )}
        </div>
      </div>

      <div className="admin-form-row">
        <Select label="Línea *" value={form.linea} onChange={e => set("linea", e.target.value)}>
          {LINEAS.map(l => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Select label="Tipo *" value={form.tipo} onChange={e => { set("tipo", e.target.value); set("tamanio", ""); }}>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Producto *" value={form.producto} onChange={e => set("producto", e.target.value)} placeholder="Shampoo, Máscara..." />
        <Input label="pH" value={form.ph} onChange={e => set("ph", e.target.value)} placeholder="5.5" />
        <Select label="Tamaño *" value={form.tamanio} onChange={e => set("tamanio", e.target.value)}>
          <option value="">Seleccionar...</option>
          {tamanios.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Precio visible en catálogo" value={form.precio_visible} onChange={e => set("precio_visible", e.target.value)}>
          {PRECIO_VISIBLE_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </Select>
      </div>

      <div>
        <div className="admin-prices-title">Precios</div>
        <div className="admin-form-row">
          {PRECIO_FIELDS.map(f => (
            <Input key={f.key} label={f.label} type="number" value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} placeholder="0" />
          ))}
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-input-group">
          <label className="admin-label">Estado</label>
          <div className="admin-form-toggle">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => set("active", v)}
                className={`admin-form-toggle-btn ${form.active === v ? 'selected' : ''}`}>
                {v ? "✓ Activo" : "✗ Oculto"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Input label="Descripción" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} placeholder="Descripción del producto" />
      <Input label="Beneficios" value={form.beneficios} onChange={e => set("beneficios", e.target.value)} placeholder="Hidratación - Brillo - Reparación" />
      <Input label="Indicaciones" value={form.indicaciones} onChange={e => set("indicaciones", e.target.value)} placeholder="Cabello dañado - Frizz" />

      <div className="admin-form-footer">
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={handleSubmit} disabled={uploading}>{isEdit ? "Guardar cambios" : "Crear producto"}</Btn>
      </div>
    </div>
  );
}

function ProductsSection() {
  const { products, refreshProducts } = useApp();
  const [modal, setModal] = useState(null);

  async function saveProduct(formData) {
    try {
      if (formData.id) {
        await productsService.update(formData.id, formData);
      } else {
        await productsService.create(formData);
      }
      await refreshProducts();
      setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("¿Eliminar este producto permanentemente?")) return;
    try {
      await productsService.delete(id);
      await refreshProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function toggleActive(product) {
    try {
      await productsService.toggleActive(product.id, !product.active);
      await refreshProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Productos</div>
          <div className="admin-section-subtitle">{products.length} cargados en base de datos</div>
        </div>
        <Btn onClick={() => setModal("new")}>+ Nuevo producto</Btn>
      </div>

      <div className="admin-stats">
        {[
          { label: "Total", val: products.length, icon: "📦" },
          { label: "Activos", val: products.filter(p => p.active).length, icon: "✅" },
          { label: "Con imagen", val: products.filter(p => p.image_url).length, icon: "🖼️" },
          { label: "Líneas", val: [...new Set(products.map(p => p.linea))].length, icon: "🏷️" },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-value">{s.val}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap">
        {products.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📦</div>
            <div className="admin-empty-text">No hay productos aún. ¡Creá el primero!</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {["Producto", "Línea", "Tamaño", "Precio visible", "Estado", ""].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-thumb">
                        {p.image_url ? <img src={p.image_url} alt="" /> : (p.tipo === 'Shampoo' ? '🧴' : p.tipo === 'Máscara' ? '💆' : '💧')}
                      </div>
                      <div>
                        <div className="admin-product-name">{p.producto}</div>
                        <div className="admin-product-meta">{p.tipo} · pH {p.ph}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-linea-cell">{p.linea}</td>
                  <td className="admin-tamanio-cell">{p.tamanio}</td>
                  <td className="admin-price-cell">
                    {formatPrice(p[p.precio_visible] || p.precio_reventa || 0)}
                    <div className="admin-price-label">{PRECIO_VISIBLE_OPTIONS.find(o => o.key === p.precio_visible)?.label || 'Reventa'}</div>
                  </td>
                  <td>
                    <button onClick={() => toggleActive(p)} className={`admin-active-toggle ${p.active ? 'active' : 'inactive'}`}>
                      {p.active ? "● Activo" : "○ Oculto"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Btn small variant="ghost" onClick={() => setModal(p)}>Editar</Btn>
                      <Btn small variant="danger" onClick={() => deleteProduct(p.id)}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Nuevo producto" : `Editar: ${modal.producto}`} onClose={() => setModal(null)} wide>
          <ProductForm product={modal === "new" ? null : modal} onSave={saveProduct} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function OrdersSection() {
  const { orders, loadOrders, updateOrderStatus } = useApp();
  const [filter, setFilter] = useState("todos");

  useEffect(() => { loadOrders(); }, []);

  function sendWA(order) {
    const msg = `Hola ${order.cliente_nombre}! ✅ Confirmamos tu pedido:\n\n` +
      order.items.map(i => `• ${i.name} (${i.tipo}) ${i.tamanio} x${i.qty}`).join("\n") +
      `\n\nTotal: ${formatPrice(order.total)}\nTe avisamos cuando esté listo. ✨`;
    window.open(`https://wa.me/${order.cliente_telefono}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const counts = {
    todos: orders.length,
    pendiente: orders.filter(o => o.status === "pendiente").length,
    confirmado: orders.filter(o => o.status === "confirmado").length,
    enviado: orders.filter(o => o.status === "enviado").length,
  };
  const filtered = filter === "todos" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="admin-section-margin">
        <div className="admin-section-title">Pedidos</div>
        <div className="admin-section-subtitle">{orders.length} pedidos en total</div>
      </div>

      <div className="admin-filters">
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`filter-pill ${filter === k ? 'active' : ''}`}>
            {k.charAt(0).toUpperCase() + k.slice(1)} ({v})
          </button>
        ))}
      </div>

      <div className="admin-stack">
        {filtered.length === 0 && (
          <div className="admin-empty">
            {orders.length === 0
              ? "Los pedidos aparecerán acá cuando los clientes completen su compra"
              : "No hay pedidos en esta categoría"}
          </div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="admin-order-card">
            <div className="admin-order-header">
              <div>
                <div className="admin-order-title-row">
                  <span className="admin-order-client">{order.cliente_nombre}</span>
                  <Badge status={order.status} />
                </div>
                <div className="admin-order-meta">
                  {order.cliente_telefono && `${order.cliente_telefono} · `}
                  {new Date(order.created_at).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="admin-order-total">{formatPrice(order.total)}</div>
            </div>
            <div className="admin-order-items">
              {order.items.map((item, i) => (
                <span key={i} className="admin-order-item-tag">
                  {item.name} ({item.tipo}) {item.tamanio} ×{item.qty}
                </span>
              ))}
            </div>
            <div className="admin-order-actions">
              <Btn small variant="green" onClick={() => sendWA(order)}>
                <svg className="admin-wa-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Confirmar por WA
              </Btn>
              {order.status === "pendiente" && <Btn small variant="success" onClick={() => updateOrderStatus(order.id, "confirmado")}>✓ Confirmar</Btn>}
              {order.status === "confirmado" && <Btn small variant="ghost" onClick={() => updateOrderStatus(order.id, "enviado")}>🚚 Marcar enviado</Btn>}
              {order.status !== "cancelado" && <Btn small variant="danger" onClick={() => updateOrderStatus(order.id, "cancelado")}>Cancelar</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection() {
  const { config, refreshConfig } = useApp();
  const [cfg, setCfg] = useState({
    shop_name: "Vexa",
    phone: "5491154922800",
    currency: "ARS",
    welcome_msg: "Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista",
    precio_visible: "precio_reventa",
    min_order: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setCfg({
        shop_name: config.shop_name || "Vexa",
        phone: config.phone || "5491154922800",
        currency: config.currency || "ARS",
        welcome_msg: config.welcome_msg || "",
        precio_visible: config.precio_visible || "precio_reventa",
        min_order: config.min_order || 0,
      });
    }
  }, [config]);

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  async function handleSave() {
    try {
      await configService.update(cfg);
      await refreshConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div>
      <div className="admin-section-title admin-section-margin">Configuración</div>
      <div className="admin-stack-lg">
        <div className="admin-settings-card">
          <div className="admin-settings-title">🏪 Datos del negocio</div>
          <div className="admin-settings-grid">
            <Input label="Nombre" value={cfg.shop_name} onChange={e => set("shop_name", e.target.value)} />
            <Input label="Teléfono WhatsApp" value={cfg.phone} onChange={e => set("phone", e.target.value)} placeholder="5491155667788" />
            <Input label="Pedido mínimo" type="number" value={cfg.min_order} onChange={e => set("min_order", e.target.value)} />
            <Select label="Moneda" value={cfg.currency} onChange={e => set("currency", e.target.value)}>
              <option value="ARS">ARS – Peso argentino</option>
              <option value="USD">USD – Dólar</option>
              <option value="BRL">BRL – Real</option>
            </Select>
          </div>
        </div>

        <div className="admin-settings-card">
          <div className="admin-settings-title">💰 Precio visible en catálogo</div>
          <Select label="Mostrar precio" value={cfg.precio_visible} onChange={e => set("precio_visible", e.target.value)}>
            {PRECIO_VISIBLE_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </Select>
          <div className="admin-settings-info blue">
            Este precio es el que se muestra en el catálogo público para todos los productos.
          </div>
        </div>

        <div className="admin-settings-card">
          <div className="admin-settings-title"><span className="admin-whatsapp-dot">●</span> Mensajes WhatsApp</div>
          <div className="admin-stack">
            <div className="admin-input-group">
              <label className="admin-label">Mensaje de bienvenida</label>
              <textarea value={cfg.welcome_msg} onChange={e => set("welcome_msg", e.target.value)} rows={3}
                className="admin-input admin-textarea" />
            </div>
            <div className="admin-settings-info green">
              <strong>Preview:</strong> "{cfg.welcome_msg}"
            </div>
          </div>
        </div>

        <div className="admin-settings-footer">
          {saved && <span className="admin-settings-saved">✓ Guardado</span>}
          <Btn onClick={handleSave}>Guardar cambios</Btn>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { id: "products", label: "Productos", icon: "📦" },
  { id: "orders", label: "Pedidos", icon: "🛒" },
  { id: "settings", label: "Config", icon: "⚙️" },
];

function AdminApp() {
  const { orders, signOut, user } = useApp();
  const [page, setPage] = useState("products");
  const pending = orders.filter(o => o.status === "pendiente").length;

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-name">✨ Admin Vexa</div>
          <div className="admin-sidebar-brand-email">{user?.email}</div>
        </div>
        <nav className="admin-sidebar-nav">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`admin-nav-btn ${page === n.id ? 'active' : ''}`}>
              <span className="admin-nav-icon">{n.icon}</span>
              {n.label}
              {n.id === "orders" && pending > 0 && (
                <span className="admin-nav-badge">{pending}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/#/" className="admin-sidebar-link">🌐 Ver catálogo</a>
          <button onClick={signOut} className="admin-sidebar-logout">🚪 Cerrar sesión</button>
        </div>
      </div>

      <div className="admin-content">
        {page === "products" && <ProductsSection />}
        {page === "orders" && <OrdersSection />}
        {page === "settings" && <SettingsSection />}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, signIn, loading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [logging, setLogging] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLogging(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError("Credenciales incorrectas");
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-inner">
          <div className="admin-loading-icon">✨</div>
          <div className="admin-loading-text">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">V</div>
          <div className="admin-login-title">Panel Admin</div>
          <div className="admin-login-sub">Vexa Catálogo Mayorista</div>
        </div>
        <form onSubmit={handleLogin} className="admin-login-form">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@vexa.com" required />
          <Input label="Contraseña" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <div className="admin-login-error">{error}</div>}
          <Btn className="admin-btn-block" disabled={logging}>
            {logging ? "Ingresando..." : "Ingresar →"}
          </Btn>
        </form>
      </div>
    </div>
  );

  return <AdminApp />;
}
