import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice, LINEAS, TIPOS, getTamaniosForTipo, PRECIO_FIELDS, PRECIO_VISIBLE_OPTIONS } from "../data/store";
import { productsService } from "../services/productsService";
import { ordersService } from "../services/ordersService";
import { configService } from "../services/configService";

const STATUS_COLORS = {
  pendiente:  { bg: "#FFF8E6", text: "#B07D00", border: "#FADA79" },
  confirmado: { bg: "#E8F8EF", text: "#0F6E56", border: "#6DCCA0" },
  enviado:    { bg: "#E6F0FF", text: "#1A4FAB", border: "#7AABF0" },
  cancelado:  { bg: "#FEF0F0", text: "#A32D2D", border: "#F09595" },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pendiente;
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", textTransform: "capitalize",
    }}>{status}</span>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <input {...props} style={{
        padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
        fontSize: 13, background: "#fff", color: "#1a1a1a", outline: "none",
        transition: "border-color 0.15s", ...props.style,
      }}
        onFocus={e => e.target.style.borderColor = "#1a1a1a"}
        onBlur={e => e.target.style.borderColor = "#E8E8E8"}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <select {...props} style={{
        padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8",
        fontSize: 13, background: "#fff", color: "#1a1a1a", outline: "none", cursor: "pointer",
        ...props.style,
      }}>{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  const variants = {
    primary: { background: "#1a1a1a", color: "#fff", border: "none" },
    ghost:   { background: "transparent", border: "1.5px solid #E8E8E8", color: "#666" },
    danger:  { background: "#FEF0F0", color: "#A32D2D", border: "1px solid #F09595" },
    green:   { background: "#25D366", color: "#fff", border: "none" },
    success: { background: "#E8F8EF", color: "#0F6E56", border: "1px solid #6DCCA0" },
  };
  return (
    <button {...props} style={{
      padding: small ? "6px 14px" : "10px 18px",
      borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 700,
      cursor: "pointer", transition: "opacity 0.15s",
      display: "inline-flex", alignItems: "center", gap: 6,
      ...variants[variant], ...props.style,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%",
        maxWidth: wide ? 720 : 480, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #F0F0F0",
          position: "sticky", top: 0, background: "#fff", zIndex: 1,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
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

  async function handleSubmit() {
    if (!form.producto || !form.linea || !form.tipo) return alert("Completá línea, producto y tipo");
    if (!form.tamanio) return alert("Seleccioná un tamaño");
    onSave({ ...form, id: product?.id || null });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div onClick={() => fileRef.current.click()} style={{
          width: 100, height: 100, borderRadius: 12, border: "2px dashed #E8E8E8",
          background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", flexShrink: 0,
          fontSize: imgPreview ? "initial" : 36,
        }}>
          {imgPreview
            ? <img src={imgPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (form.tipo === 'Shampoo' ? '🧴' : form.tipo === 'Máscara' ? '💆' : '💧')}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
          Precios
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PRECIO_FIELDS.map(f => (
            <Input key={f.key} label={f.label} type="number" value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} placeholder="0" />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>Estado</label>
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => set("active", v)} style={{
                flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                border: form.active === v ? "1.5px solid #1a1a1a" : "1.5px solid #E8E8E8",
                background: form.active === v ? "#1a1a1a" : "#fff",
                color: form.active === v ? "#fff" : "#666",
              }}>{v ? "✓ Activo" : "✗ Oculto"}</button>
            ))}
          </div>
        </div>
      </div>

      <Input label="Descripción" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} placeholder="Descripción del producto" />
      <Input label="Beneficios" value={form.beneficios} onChange={e => set("beneficios", e.target.value)} placeholder="Hidratación - Brillo - Reparación" />
      <Input label="Indicaciones" value={form.indicaciones} onChange={e => set("indicaciones", e.target.value)} placeholder="Cabello dañado - Frizz" />

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #F0F0F0" }}>
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

  const totalStock = (p) => {
    return (Number(p.precio_bacha) > 0 ? 1 : 0) + (Number(p.precio_reventa) > 0 ? 1 : 0);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Productos</div>
          <div style={{ fontSize: 12, color: "#999" }}>{products.length} cargados en base de datos</div>
        </div>
        <Btn onClick={() => setModal("new")}>+ Nuevo producto</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total", val: products.length, icon: "📦" },
          { label: "Activos", val: products.filter(p => p.active).length, icon: "✅" },
          { label: "Con imagen", val: products.filter(p => p.image_url).length, icon: "🖼️" },
          { label: "Líneas", val: [...new Set(products.map(p => p.linea))].length, icon: "🏷️" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#999" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, overflow: "hidden" }}>
        {products.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#AAA" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
            <div style={{ fontSize: 14 }}>No hay productos aún. ¡Creá el primero!</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAFA" }}>
                {["Producto", "Línea", "Tamaño", "Precio visible", "Estado", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", borderBottom: "1px solid #F0F0F0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? "1px solid #F8F8F8" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (p.tipo === 'Shampoo' ? '🧴' : p.tipo === 'Máscara' ? '💆' : '💧')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.producto}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{p.tipo} · pH {p.ph}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>{p.linea}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>{p.tamanio}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>
                    {formatPrice(p[p.precio_visible] || p.precio_reventa || 0)}
                    <div style={{ fontSize: 10, color: "#AAA" }}>{PRECIO_VISIBLE_OPTIONS.find(o => o.key === p.precio_visible)?.label || 'Reventa'}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => toggleActive(p)} style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                      border: `1px solid ${p.active ? "#6DCCA0" : "#E8E8E8"}`,
                      background: p.active ? "#E8F8EF" : "#F8F8F8",
                      color: p.active ? "#0F6E56" : "#AAA",
                    }}>{p.active ? "● Activo" : "○ Oculto"}</button>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
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
    pendiente:  orders.filter(o => o.status === "pendiente").length,
    confirmado: orders.filter(o => o.status === "confirmado").length,
    enviado:    orders.filter(o => o.status === "enviado").length,
  };
  const filtered = filter === "todos" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Pedidos</div>
        <div style={{ fontSize: 12, color: "#999" }}>{orders.length} pedidos en total</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: filter === k ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
            background: filter === k ? "#1a1a1a" : "#fff",
            color: filter === k ? "#fff" : "#666",
          }}>{k.charAt(0).toUpperCase() + k.slice(1)} ({v})</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#AAA", fontSize: 14 }}>
            {orders.length === 0
              ? "Los pedidos aparecerán acá cuando los clientes completen su compra"
              : "No hay pedidos en esta categoría"}
          </div>
        )}
        {filtered.map(order => (
          <div key={order.id} style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{order.cliente_nombre}</span>
                  <Badge status={order.status} />
                </div>
                <div style={{ fontSize: 11, color: "#AAA" }}>
                  {order.cliente_telefono && `${order.cliente_telefono} · `}
                  {new Date(order.created_at).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{formatPrice(order.total)}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {order.items.map((item, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  background: "#F8F8F8", color: "#555", border: "1px solid #EEE",
                }}>{item.name} ({item.tipo}) {item.tamanio} ×{item.qty}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Btn small variant="green" onClick={() => sendWA(order)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Confirmar por WA
              </Btn>
              {order.status === "pendiente"  && <Btn small variant="success" onClick={() => updateOrderStatus(order.id, "confirmado")}>✓ Confirmar</Btn>}
              {order.status === "confirmado" && <Btn small variant="ghost"   onClick={() => updateOrderStatus(order.id, "enviado")}>🚚 Marcar enviado</Btn>}
              {order.status !== "cancelado"  && <Btn small variant="danger"  onClick={() => updateOrderStatus(order.id, "cancelado")}>Cancelar</Btn>}
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
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Configuración</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>🏪 Datos del negocio</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

        <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>💰 Precio visible en catálogo</div>
          <Select label="Mostrar precio" value={cfg.precio_visible} onChange={e => set("precio_visible", e.target.value)}>
            {PRECIO_VISIBLE_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </Select>
          <div style={{ marginTop: 8, padding: "10px 14px", background: "#F0F8FF", borderRadius: 8, fontSize: 12, color: "#1A4FAB" }}>
            Este precio es el que se muestra en el catálogo público para todos los productos.
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #F0F0F0", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}><span style={{ color: "#25D366" }}>●</span> Mensajes WhatsApp</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>Mensaje de bienvenida</label>
              <textarea value={cfg.welcome_msg} onChange={e => set("welcome_msg", e.target.value)} rows={3}
                style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E8E8E8", fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none" }} />
            </div>
            <div style={{ background: "#F0FFF8", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#0F6E56" }}>
              <strong>Preview:</strong> "{cfg.welcome_msg}"
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
          {saved && <span style={{ fontSize: 13, color: "#0F6E56", fontWeight: 600 }}>✓ Guardado</span>}
          <Btn onClick={handleSave}>Guardar cambios</Btn>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { id: "products", label: "Productos", icon: "📦" },
  { id: "orders",   label: "Pedidos",   icon: "🛒" },
  { id: "settings", label: "Config",    icon: "⚙️" },
];

function AdminApp() {
  const { orders, signOut, user } = useApp();
  const [page, setPage] = useState("products");
  const pending = orders.filter(o => o.status === "pendiente").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#F7F7F7" }}>
      <div style={{
        width: 210, background: "#fff", borderRight: "1px solid #F0F0F0",
        display: "flex", flexDirection: "column", padding: "20px 12px",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "0 8px", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>✨ Admin Vexa</div>
          <div style={{ fontSize: 11, color: "#AAA" }}>{user?.email}</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
              background: page === n.id ? "#1a1a1a" : "transparent",
              color: page === n.id ? "#fff" : "#555",
              fontSize: 13, fontWeight: page === n.id ? 700 : 400,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
              {n.id === "orders" && pending > 0 && (
                <span style={{ marginLeft: "auto", background: "#E24B4A", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 7px" }}>{pending}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <a href="/#/" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            borderRadius: 8, color: "#AAA", fontSize: 12, textDecoration: "none",
          }}>🌐 Ver catálogo</a>
          <button onClick={signOut} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            borderRadius: 8, color: "#A32D2D", fontSize: 12, border: "none",
            background: "transparent", cursor: "pointer", textAlign: "left",
          }}>🚪 Cerrar sesión</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {page === "products" && <ProductsSection />}
        {page === "orders"   && <OrdersSection />}
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F4F4", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#666" }}>Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F4F4F4", fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 340, boxShadow: "0 4px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: "#1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 auto 12px",
          }}>V</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Panel Admin</div>
          <div style={{ fontSize: 12, color: "#AAA" }}>Vexa Catálogo Mayorista</div>
        </div>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@vexa.com" required />
          <Input label="Contraseña" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <div style={{ fontSize: 12, color: "#A32D2D", textAlign: "center" }}>{error}</div>}
          <Btn style={{ width: "100%", justifyContent: "center", marginTop: 4 }} disabled={logging}>
            {logging ? "Ingresando..." : "Ingresar →"}
          </Btn>
        </form>
      </div>
    </div>
  );

  return <AdminApp />;
}
