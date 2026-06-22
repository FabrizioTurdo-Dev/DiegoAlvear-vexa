import { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice, SELLER_PHONE, LINEAS, TIPOS } from "../data/store";
import { ordersService } from "../services/ordersService";

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const LINEA_COLORS = {
  'Argan Recovery': { bg: '#FFF8E6', accent: '#D4A843', text: '#8B6914' },
  'Biotina Therapy': { bg: '#F0F8FF', accent: '#4A90D9', text: '#2C5F8A' },
  'Keratina Revitalize': { bg: '#F0FFF8', accent: '#1D9E75', text: '#0F6E56' },
  'Neutro Balance': { bg: '#F8F8F8', accent: '#999', text: '#666' },
  'Extra Acida Intense': { bg: '#FFF0F0', accent: '#D94A4A', text: '#8A2C2C' },
};

function ProductCard({ product, precioVisible, onAdd }) {
  const [qty, setQty] = useState(1);
  const price = product[precioVisible] || product.precio_reventa || 0;
  const colors = LINEA_COLORS[product.linea] || LINEA_COLORS['Neutro Balance'];
  const isIncluded = price === 0 && product.descripcion?.includes('Incluido');

  if (isIncluded) return null;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #F0F0F0",
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{
        background: colors.bg, height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: colors.accent, color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "3px 8px",
          borderRadius: 20, letterSpacing: "0.05em",
        }}>{product.linea}</span>
        {product.image_url ? (
          <img src={product.image_url} alt={product.producto}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 4 }}>
              {product.tipo === 'Shampoo' ? '🧴' : product.tipo === 'Máscara' ? '💆' : '💧'}
            </div>
            <div style={{ fontSize: 11, color: colors.text, fontWeight: 600 }}>{product.tipo}</div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div>
          <div style={{ fontSize: 10, color: "#AAA", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {product.tipo} · pH {product.ph}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{product.producto}</div>
          <div style={{ fontSize: 11, color: "#999" }}>{product.tamanio}</div>
        </div>

        {product.beneficios && (
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>
            {product.beneficios.split(' - ').slice(0, 3).map((b, i) => (
              <span key={i} style={{
                display: "inline-block", background: "#F8F8F8", padding: "2px 6px",
                borderRadius: 4, margin: "1px 2px", fontSize: 10,
              }}>{b}</span>
            ))}
          </div>
        )}

        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginTop: "auto" }}>
          {formatPrice(price)}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #E8E8E8", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
              width: 28, height: 28, border: "none", background: "transparent",
              cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#666",
            }}>−</button>
            <span style={{ width: 28, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{
              width: 28, height: 28, border: "none", background: "transparent",
              cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#666",
            }}>+</button>
          </div>
          <button
            onClick={() => { onAdd(product, qty); setQty(1); }}
            style={{
              flex: 1, padding: "7px", borderRadius: 8, border: "1.5px solid #1a1a1a",
              background: "#1a1a1a", color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#333"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a1a1a"; }}
          >+ Agregar</button>
        </div>
      </div>
    </div>
  );
}

function CartView({ cart, onClose, onChangeQty, onRemove, onSent }) {
  const { addOrder } = useApp();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  async function sendToWhatsApp() {
    const items = cart.map(c => ({
      name: c.name, tipo: c.tipo, tamanio: c.tamanio,
      price: c.price, qty: c.qty,
    }));

    let msg = "Hola! Quiero realizar el siguiente pedido:\n\n";
    cart.forEach(item => {
      msg += `• ${item.name} (${item.tipo}) — ${item.tamanio} x${item.qty} = ${formatPrice(item.price * item.qty)}\n`;
    });
    msg += `\n*Total: ${formatPrice(total)}*`;
    if (name) msg += `\nNombre: ${name}`;
    if (phone) msg += `\nTeléfono: ${phone}`;

    try {
      await addOrder({
        cliente_nombre: name || "Cliente nuevo",
        cliente_telefono: phone,
        items,
        total,
      });
    } catch (err) {
      console.error("Error guardando pedido:", err);
    }

    window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
    onSent();
  }

  if (sent) return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>✨</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>¡Pedido enviado!</div>
      <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Se abrió WhatsApp con tu pedido. El vendedor te confirmará en breve.</div>
      <button onClick={onClose} style={{
        padding: "10px 28px", borderRadius: 10, border: "1.5px solid #1a1a1a",
        background: "#1a1a1a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>Volver al catálogo</button>
    </div>
  );

  return (
    <div style={{ padding: "1rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onClose} style={{
          background: "none", border: "1px solid #E8E8E8", borderRadius: 8,
          padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#666",
        }}>← Volver</button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          Tu pedido <span style={{ color: "#999", fontWeight: 400, fontSize: 13 }}>({totalQty} {totalQty === 1 ? "producto" : "productos"})</span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#AAA" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
          <div style={{ fontSize: 14 }}>El carrito está vacío</div>
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid #F0F0F0", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            {cart.map((item, i) => (
              <div key={`${item.id}-${i}`} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderBottom: i < cart.length - 1 ? "1px solid #F8F8F8" : "none", background: "#fff",
              }}>
                <div style={{ fontSize: 26, minWidth: 36 }}>
                  {item.tipo === 'Shampoo' ? '🧴' : item.tipo === 'Máscara' ? '💆' : '💧'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{item.tipo} · {item.tamanio} · {formatPrice(item.price)} c/u</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[-1, 1].map(d => (
                    <button key={d} onClick={() => onChangeQty(item, d)} style={{
                      width: 26, height: 26, borderRadius: 6, border: "1px solid #E8E8E8",
                      background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{d === -1 ? "−" : "+"}</button>
                  ))}
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, minWidth: 80, textAlign: "right" }}>{formatPrice(item.price * item.qty)}</div>
                <button onClick={() => onRemove(item)} style={{ background: "none", border: "none", cursor: "pointer", color: "#CCC", fontSize: 18, lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", background: "#F8F8F8", borderRadius: 12, marginBottom: 20,
          }}>
            <span style={{ fontSize: 14, color: "#666" }}>Total estimado</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{formatPrice(total)}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>Tu nombre</div>
              <input type="text" placeholder="Nombre" value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, boxSizing: "border-box",
                  border: "1.5px solid #E8E8E8", fontSize: 14, outline: "none",
                }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>Tu número de WhatsApp (opcional)</div>
              <input type="tel" placeholder="+54 9 11 1234 5678" value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, boxSizing: "border-box",
                  border: "1.5px solid #E8E8E8", fontSize: 14, outline: "none",
                }} />
            </div>
          </div>

          <button onClick={sendToWhatsApp} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <WhatsAppIcon size={20} /> Enviar pedido por WhatsApp
          </button>
          <div style={{ textAlign: "center", fontSize: 11, color: "#AAA", marginTop: 8 }}>
            Se abrirá WhatsApp con el resumen de tu pedido
          </div>
        </>
      )}
    </div>
  );
}

export default function Catalogo() {
  const { products, config, loading, loadError, loadData } = useApp();
  const [lineaFilter, setLineaFilter] = useState("todas");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("catalog");
  const [toast, setToast] = useState(null);

  const precioVisible = config?.precio_visible || "precio_reventa";

  const filtered = useMemo(() => products.filter(p => {
    if (!p.active) return false;
    const lineaOk = lineaFilter === "todas" || p.linea === lineaFilter;
    const tipoOk = tipoFilter === "todos" || p.tipo === tipoFilter;
    const searchOk = !search ||
      p.producto.toLowerCase().includes(search.toLowerCase()) ||
      p.linea.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase());
    return lineaOk && tipoOk && searchOk;
  }), [products, lineaFilter, tipoFilter, search]);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  function addToCart(product, qty) {
    setCart(prev => {
      const ex = prev.find(c => c.id === product.id);
      return ex
        ? prev.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, {
            id: product.id, name: product.producto, tipo: product.tipo,
            tamanio: product.tamanio, price: product[precioVisible] || product.precio_reventa || 0,
            qty,
          }];
    });
    showToast(`${product.producto} (${product.tamanio}) agregado ✓`);
  }

  function changeQty(item, delta) {
    setCart(prev => prev.map(c =>
      c.id === item.id ? { ...c, qty: c.qty + delta } : c
    ).filter(c => c.qty > 0));
  }

  function removeItem(item) {
    setCart(prev => prev.filter(c => c.id !== item.id));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const pill = (active) => ({
    padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
    border: active ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
    background: active ? "#1a1a1a" : "#fff",
    color: active ? "#fff" : "#666",
    fontWeight: active ? 700 : 400,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#666" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Cargando catálogo Vexa...</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: "#A32D2D" }}>Error al cargar</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>{loadError}</div>
          <button onClick={loadData} style={{
            padding: "10px 24px", borderRadius: 10, border: "1.5px solid #1a1a1a",
            background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#FAFAFA", minHeight: "100vh" }}>
      <div style={{
        background: "#fff", borderBottom: "1px solid #F0F0F0",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "0 20px",
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "-0.03em",
            }}>V</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Vexa</div>
              <div style={{ fontSize: 10, color: "#AAA", letterSpacing: "0.1em" }}>CATÁLOGO MAYORISTA</div>
            </div>
          </div>
          <button
            onClick={() => setView(view === "cart" ? "catalog" : "cart")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 20, cursor: "pointer",
              border: totalItems > 0 ? "1.5px solid #1a1a1a" : "1px solid #E8E8E8",
              background: totalItems > 0 ? "#1a1a1a" : "#fff",
              color: totalItems > 0 ? "#fff" : "#666",
              fontSize: 13, fontWeight: 700, transition: "all 0.2s",
            }}
          >
            🛒 {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? "s" : ""}` : "Carrito"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {view === "catalog" ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <input
                type="text" placeholder="🔍 Buscar producto, línea..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 16px", borderRadius: 12,
                  border: "1.5px solid #E8E8E8", fontSize: 14, outline: "none",
                  boxSizing: "border-box", marginBottom: 12,
                }}
              />

              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <button onClick={() => setLineaFilter("todas")} style={pill(lineaFilter === "todas")}>Todas</button>
                {LINEAS.map(l => (
                  <button key={l} onClick={() => setLineaFilter(lineaFilter === l ? "todas" : l)} style={pill(lineaFilter === l)}>{l}</button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => setTipoFilter("todos")} style={pill(tipoFilter === "todos")}>Todos</button>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipoFilter(t)} style={pill(tipoFilter === t)}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#BBB", marginBottom: 16 }}>
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              {lineaFilter !== "todas" ? ` en ${lineaFilter}` : ""}
              {tipoFilter !== "todos" ? ` · ${tipoFilter}` : ""}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#AAA" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>😕</div>
                <div style={{ fontSize: 14 }}>Sin productos para ese filtro</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {filtered.map(p => <ProductCard key={p.id} product={p} precioVisible={precioVisible} onAdd={addToCart} />)}
              </div>
            )}
          </>
        ) : (
          <CartView
            cart={cart}
            onClose={() => setView("catalog")}
            onChangeQty={changeQty}
            onRemove={removeItem}
            onSent={() => setCart([])}
          />
        )}
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1a1a1a", color: "#fff", padding: "10px 22px", borderRadius: 20,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap", zIndex: 999,
        }}>{toast}</div>
      )}
    </div>
  );
}
