import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatPrice, SELLER_PHONE, LINEAS, TIPOS } from "../data/store";
import "../styles/catalogo.css";

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

function ProductCard({ product, precioVisible, onAdd, expanded, onToggleExpand }) {
  const [qty, setQty] = useState(1);
  const price = product[precioVisible] || product.precio_reventa || 0;
  const colors = LINEA_COLORS[product.linea] || LINEA_COLORS['Neutro Balance'];
  const isIncluded = price === 0 && product.descripcion?.includes('Incluido');

  if (isIncluded) return null;

  const beneficios = product.beneficios ? product.beneficios.split(' - ') : [];
  const indicaciones = product.indicaciones ? product.indicaciones.split(' - ') : [];

  return (
    <div
      className={`product-card ${expanded ? 'expanded' : ''}`}
      style={expanded ? { borderColor: colors.accent, borderWidth: 2 } : {}}
      onClick={onToggleExpand}
    >
      <div className="product-card-image" style={{ background: colors.bg }}>
        <span className="product-card-linea-badge" style={{ background: colors.accent }}>
          {product.linea}
        </span>
        <span className={`product-card-expand-icon ${expanded ? 'rotated' : ''}`}>▾</span>
        {product.image_url ? (
          <img src={product.image_url} alt={product.producto} />
        ) : (
          <div className="product-card-emoji">
            <div className="product-card-emoji-icon">
              {product.tipo === 'Shampoo' ? '🧴' : product.tipo === 'Máscara' ? '💆' : '💧'}
            </div>
            <div className="product-card-emoji-label" style={{ color: colors.text }}>{product.tipo}</div>
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div>
          <div className="product-card-tipo">{product.tipo} · pH {product.ph}</div>
          <div className="product-card-name">{product.producto}</div>
          <div className="product-card-size">{product.tamanio}</div>
        </div>

        {product.beneficios && (
          <div className="product-card-benefits">
            {beneficios.slice(0, expanded ? beneficios.length : 3).map((b, i) => (
              <span key={i} className="benefit-tag">{b}</span>
            ))}
          </div>
        )}

        {expanded && (
          <div className="product-card-detail" onClick={e => e.stopPropagation()}>
            {product.descripcion && !product.descripcion.includes('Incluido') && (
              <div>
                <div className="detail-section-label" style={{ color: colors.accent }}>Descripción</div>
                <div className="detail-description">{product.descripcion}</div>
              </div>
            )}
            {beneficios.length > 0 && (
              <div>
                <div className="detail-section-label" style={{ color: colors.accent }}>Beneficios</div>
                <div className="detail-benefits">
                  {beneficios.map((b, i) => (
                    <span key={i} className="detail-benefit-tag" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.accent}30` }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {indicaciones.length > 0 && (
              <div>
                <div className="detail-section-label" style={{ color: colors.accent }}>Indicaciones</div>
                <div className="detail-indications">{indicaciones.join(' · ')}</div>
              </div>
            )}
          </div>
        )}

        <div className="product-card-price">{formatPrice(price)}</div>

        <div className="product-card-actions" onClick={e => e.stopPropagation()}>
          <div className="qty-control">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <button className="add-btn" onClick={() => { onAdd(product, qty); setQty(1); }}>+ Agregar</button>
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
    <div className="cart-sent">
      <div className="cart-sent-icon">✨</div>
      <div className="cart-sent-title">¡Pedido enviado!</div>
      <div className="cart-sent-msg">Se abrió WhatsApp con tu pedido. El vendedor te confirmará en breve.</div>
      <button className="cart-sent-btn" onClick={onClose}>Volver al catálogo</button>
    </div>
  );

  return (
    <div className="cart-view">
      <div className="cart-header">
        <button className="cart-back-btn" onClick={onClose}>← Volver</button>
        <div className="cart-title">
          Tu pedido <span className="cart-title-count">({totalQty} {totalQty === 1 ? "producto" : "productos"})</span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <div className="cart-empty-text">El carrito está vacío</div>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item, i) => (
              <div key={`${item.id}-${i}`} className="cart-item">
                <div className="cart-item-emoji">
                  {item.tipo === 'Shampoo' ? '🧴' : item.tipo === 'Máscara' ? '💆' : '💧'}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-detail">{item.tipo} · {item.tamanio} · {formatPrice(item.price)} c/u</div>
                </div>
                <div className="cart-item-qty">
                  {[-1, 1].map(d => (
                    <button key={d} className="cart-qty-btn" onClick={() => onChangeQty(item, d)}>
                      {d === -1 ? "−" : "+"}
                    </button>
                  ))}
                  <span className="cart-qty-value">{item.qty}</span>
                </div>
                <div className="cart-item-price">{formatPrice(item.price * item.qty)}</div>
                <button className="cart-item-remove" onClick={() => onRemove(item)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <span className="cart-total-label">Total estimado</span>
            <span className="cart-total-value">{formatPrice(total)}</span>
          </div>

          <div className="cart-form">
            <div>
              <div className="cart-form-label">Tu nombre</div>
              <input className="cart-form-input" type="text" placeholder="Nombre" value={name}
                onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <div className="cart-form-label">Tu número de WhatsApp (opcional)</div>
              <input className="cart-form-input" type="tel" placeholder="+54 9 11 1234 5678" value={phone}
                onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <button className="cart-send-btn" onClick={sendToWhatsApp}>
            <WhatsAppIcon size={20} /> Enviar pedido por WhatsApp
          </button>
          <div className="cart-send-hint">Se abrirá WhatsApp con el resumen de tu pedido</div>
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
  const [expandedId, setExpandedId] = useState(null);

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

  if (loading) {
    return (
      <div className="catalogo-loading">
        <div className="catalogo-loading-inner">
          <div className="catalogo-loading-icon">✨</div>
          <div className="catalogo-loading-text">Cargando catálogo Vexa...</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="catalogo-error">
        <div className="catalogo-error-inner">
          <div className="catalogo-error-icon">⚠️</div>
          <div className="catalogo-error-title">Error al cargar</div>
          <div className="catalogo-error-msg">{loadError}</div>
          <button className="retry-btn" onClick={loadData}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo">
      <div className="catalogo-header">
        <div className="catalogo-header-inner">
          <div className="catalogo-brand">
            <div className="catalogo-logo">V</div>
            <div>
              <div className="catalogo-brand-name">Vexa</div>
              <div className="catalogo-brand-sub">CATÁLOGO MAYORISTA</div>
            </div>
          </div>
          <button
            className={`catalogo-cart-btn ${totalItems > 0 ? 'has-items' : ''}`}
            onClick={() => setView(view === "cart" ? "catalog" : "cart")}
          >
            🛒 {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? "s" : ""}` : "Carrito"}
          </button>
        </div>
      </div>

      <div className="catalogo-content">
        {view === "catalog" ? (
          <>
            <div className="catalogo-search-wrap">
              <input
                className="catalogo-search"
                type="text" placeholder="🔍 Buscar producto, línea..."
                value={search} onChange={e => setSearch(e.target.value)}
              />

              <div className="catalogo-filters">
                <button onClick={() => setLineaFilter("todas")} className={`filter-pill ${lineaFilter === "todas" ? 'active' : ''}`}>Todas</button>
                {LINEAS.map(l => (
                  <button key={l} onClick={() => setLineaFilter(lineaFilter === l ? "todas" : l)} className={`filter-pill ${lineaFilter === l ? 'active' : ''}`}>{l}</button>
                ))}
              </div>

              <div className="catalogo-filters">
                <button onClick={() => setTipoFilter("todos")} className={`filter-pill ${tipoFilter === "todos" ? 'active' : ''}`}>Todos</button>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipoFilter(tipoFilter === t ? "todos" : t)} className={`filter-pill ${tipoFilter === t ? 'active' : ''}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="catalogo-count">
              {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              {lineaFilter !== "todas" ? ` en ${lineaFilter}` : ""}
              {tipoFilter !== "todos" ? ` · ${tipoFilter}` : ""}
            </div>

            {filtered.length === 0 ? (
              <div className="catalogo-empty">
                <div className="catalogo-empty-icon">😕</div>
                <div className="catalogo-empty-text">Sin productos para ese filtro</div>
              </div>
            ) : (
              <div className="catalogo-grid">
                {filtered.map(p => (
                  <ProductCard
                    key={p.id} product={p} precioVisible={precioVisible}
                    onAdd={addToCart} expanded={expandedId === p.id}
                    onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  />
                ))}
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

      {toast && <div className="catalogo-toast">{toast}</div>}
    </div>
  );
}
