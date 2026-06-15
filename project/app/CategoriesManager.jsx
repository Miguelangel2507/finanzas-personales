// ─────────────────────────────────────────────────────────────
// CategoriesManager — crear, editar y borrar categorías
// ─────────────────────────────────────────────────────────────
const CAT_COLORS = ['#D85C32', '#E0913C', '#C99A4B', '#3E6B57', '#4E7E86', '#5F8A7A', '#2E7D5B', '#4E7CA8', '#7C6B9C', '#A85B5B', '#B0623F', '#C98A5B', '#8C9A86', '#6B6E78'];

function slug(s) {return (s || 'cat').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 16) || 'cat';}

function CategoriesManager({ open, onClose, tx, onAdd, onUpdate, onDelete }) {
  const { CATEGORIES, ICONS } = window.FIN;
  const [view, setView] = useState('list'); // list | edit
  const [draft, setDraft] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {if (open) {setView('list');setConfirmDel(false);}}, [open]);

  const iconKeys = Object.keys(ICONS);

  const spentByCat = {};
  for (const t of tx) spentByCat[t.cat] = (spentByCat[t.cat] || 0) + t.amount;

  const startNew = () => {
    setDraft({ id: null, name: '', sub: '', budget: '', type: 'gasto', flow: 'diario', color: CAT_COLORS[0], icon: ICONS[iconKeys[0]] });
    setConfirmDel(false);setView('edit');
  };
  const startEdit = (c) => {
    setDraft({ ...c, budget: c.budget ? String(c.budget).replace('.', ',') : '' });
    setConfirmDel(false);setView('edit');
  };

  const save = () => {
    const name = (draft.name || '').trim();
    if (!name) return;
    const budget = parseFloat(String(draft.budget).replace(',', '.')) || 0;
    const payload = {
      id: draft.id || slug(name) + '-' + Date.now().toString(36).slice(-4),
      name, sub: (draft.sub || '').trim() || (draft.type === 'inversion' ? 'Inversión' : draft.flow === 'fijo' ? 'Gasto fijo' : 'Gasto diario'),
      budget, type: draft.type, color: draft.color, icon: draft.icon
    };
    if (draft.type === 'gasto') payload.flow = draft.flow || 'diario';
    if (draft.id) onUpdate(payload);else onAdd(payload);
    setView('list');
  };

  const removeCat = () => {
    onDelete(draft.id);
    setView('list');setConfirmDel(false);
  };

  const D = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 195, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(26,23,18,.4)',
        opacity: open ? 1 : 0, transition: 'opacity .3s' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)',
        borderRadius: '34px 34px 0 0', transform: open ? 'translateY(0)' : 'translateY(105%)',
        transition: 'transform .42s cubic-bezier(.32,.72,0,1)', height: '92%', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(26,23,18,.18)' }}>

        <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: '#00000018' }} />
        </div>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 6px', flexShrink: 0 }}>
          {view === 'edit' ?
          <button onClick={() => setView('list')} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--ui)', fontSize: 15, color: 'var(--ink-soft)', width: 70 }}>‹ Atrás</button> :
          <span style={{ width: 70 }} />}
          <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
            {view === 'edit' ? draft && draft.id ? 'Editar categoría' : 'Nueva categoría' : 'Categorías'}
          </span>
          {view === 'edit' ?
          <button onClick={save} style={{ all: 'unset', cursor: 'pointer', width: 70, textAlign: 'right', fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 700, color: draft && draft.name.trim() ? 'var(--accent)' : 'var(--ink-soft)', opacity: draft && draft.name.trim() ? 1 : .5 }}>Guardar</button> :
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 70, textAlign: 'right', fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>Hecho</button>}
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 18px calc(env(safe-area-inset-bottom) + 24px)' }}>
          {view === 'list' ?
          <React.Fragment>
              <button onClick={startNew} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box',
              background: 'var(--accent)', color: '#fff', borderRadius: 18, padding: '14px 16px', margin: '4px 0 16px', boxShadow: '0 6px 16px -6px var(--accent)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Glyph d={GLYPHS.plus} size={19} stroke={2.4} color="#fff" />
                </div>
                <span style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 700 }}>Nueva categoría</span>
              </button>

              <div style={{ background: 'var(--paper)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(40,28,16,.04)' }}>
                {CATEGORIES.map((c, i) =>
              <button key={c.id} onClick={() => startEdit(c)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '12px 15px',
                borderBottom: i < CATEGORIES.length - 1 ? '0.5px solid rgba(60,50,40,.10)' : 'none', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: c.color + '18', color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={c.icon} /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                      <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>
                        {c.type === 'inversion' ? 'Inversión' : c.flow === 'fijo' ? 'Gasto fijo' : 'Gasto diario'}{c.budget > 0 ? ` · ${window.fmt(c.budget)}/mes` : ' · sin presupuesto'}
                      </div>
                    </div>
                    <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}><path d="M1 1l6 6-6 6" stroke="rgba(60,50,40,.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
              )}
              </div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 16, opacity: .75, lineHeight: 1.5 }}>
                Toca una categoría para editar su nombre, presupuesto, color o icono — o bórrala.
              </div>
            </React.Fragment> :
          draft &&
          <React.Fragment>
              {/* preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 18px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: draft.color + '1A', color: draft.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={draft.icon} /></svg>
                </div>
              </div>

              {/* nombre */}
              <label style={{ display: 'block', fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', padding: '0 4px 7px' }} data-comment-anchor="99cd934364-label-118-15">Nombre</label>
              <input value={draft.name} onChange={(e) => D('name', e.target.value)} placeholder="p. ej. Viajes"
            style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'var(--paper)', borderRadius: 15, padding: '14px 16px',
              fontFamily: 'var(--ui)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', boxShadow: '0 1px 2px rgba(40,28,16,.05)' }} />

              {/* tipo */}
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', padding: '18px 4px 8px' }}>Tipo</div>
              <div style={{ display: 'flex', background: '#00000008', borderRadius: 14, padding: 3 }}>
                {[['gasto', 'Gasto'], ['inversion', 'Inversión']].map(([k, l]) =>
              <button key={k} onClick={() => D('type', k)} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 11,
                fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600, color: draft.type === k ? 'var(--ink)' : 'var(--ink-soft)',
                background: draft.type === k ? 'var(--paper)' : 'transparent', boxShadow: draft.type === k ? '0 1px 3px rgba(40,28,16,.12)' : 'none' }}>{l}</button>
              )}
              </div>

              {/* frecuencia (solo gastos) */}
              {draft.type === 'gasto' &&
              <React.Fragment>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', padding: '18px 4px 8px' }}>Frecuencia</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['fijo', 'Gasto fijo', 'Recurrente cada mes', 'var(--accent)'], ['diario', 'Gasto diario', 'Variable del día a día', '#E0913C']].map(([k, l, sub, col]) =>
                  <button key={k} onClick={() => D('flow', k)} style={{ all: 'unset', cursor: 'pointer', flex: 1, boxSizing: 'border-box', borderRadius: 15, padding: '12px 13px',
                    background: 'var(--paper)', boxShadow: (draft.flow || 'diario') === k ? `0 0 0 2px ${col}` : '0 1px 2px rgba(40,28,16,.05)', transition: 'box-shadow .15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 99, background: col, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--ui)', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{l}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 5, lineHeight: 1.3 }}>{sub}</div>
                  </button>
                  )}
                </div>
              </React.Fragment>
              }

              {/* presupuesto */}
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', padding: '18px 4px 8px' }}>Presupuesto mensual (opcional)</div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--paper)', borderRadius: 15, padding: '0 16px', boxShadow: '0 1px 2px rgba(40,28,16,.05)' }}>
                <input value={draft.budget} onChange={(e) => D('budget', e.target.value.replace(/[^0-9,.]/g, ''))} inputMode="decimal" placeholder="0"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '14px 0', fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }} />
                <span style={{ fontFamily: 'var(--display)', fontSize: 17, color: 'var(--ink-soft)' }}>€</span>
              </div>

              {/* color */}
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', padding: '18px 4px 10px' }}>Color</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, padding: '0 2px' }}>
                {CAT_COLORS.map((col) =>
              <button key={col} onClick={() => D('color', col)} style={{ all: 'unset', cursor: 'pointer', width: 34, height: 34, borderRadius: 11, background: col,
                boxShadow: draft.color === col ? `0 0 0 3px var(--bg), 0 0 0 5px ${col}` : '0 1px 2px rgba(40,28,16,.1)', transition: 'box-shadow .15s' }} />
              )}
              </div>

              {/* icono */}
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', padding: '20px 4px 10px' }}>Icono</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 9 }}>
                {iconKeys.map((k) => {
                const sel = draft.icon === ICONS[k];
                return (
                  <button key={k} onClick={() => D('icon', ICONS[k])} style={{ all: 'unset', cursor: 'pointer', aspectRatio: '1', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: sel ? draft.color : 'var(--paper)', color: sel ? '#fff' : 'var(--ink-soft)', boxShadow: '0 1px 2px rgba(40,28,16,.05)', transition: 'all .15s' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[k]} /></svg>
                    </button>);

              })}
              </div>

              {/* borrar */}
              {draft.id &&
            <div style={{ marginTop: 26 }}>
                  {!confirmDel ?
              <button onClick={() => setConfirmDel(true)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', boxSizing: 'border-box',
                padding: '13px', borderRadius: 15, background: '#D85C3212', color: 'var(--accent)', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600 }}>
                      <Glyph d={GLYPHS.trash} size={17} stroke={1.9} /> Borrar categoría
                    </button> :

              <div style={{ background: 'var(--paper)', borderRadius: 16, padding: '16px', boxShadow: '0 1px 2px rgba(40,28,16,.05)' }}>
                      <div style={{ fontFamily: 'var(--ui)', fontSize: 13.5, color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>¿Borrar "{draft.name}"?</div>
                      <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 14, lineHeight: 1.45 }}>
                        {spentByCat[draft.id] > 0 ? `Se eliminarán también sus ${tx.filter((t) => t.cat === draft.id).length} movimientos.` : 'Esta categoría no tiene movimientos.'}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setConfirmDel(false)} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '11px', borderRadius: 12, background: '#00000008', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Cancelar</button>
                        <button onClick={removeCat} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '11px', borderRadius: 12, background: 'var(--accent)', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 700, color: '#fff' }}>Borrar</button>
                      </div>
                    </div>
              }
                </div>
            }
            </React.Fragment>
          }
        </div>
      </div>
    </div>);

}

window.CategoriesManager = CategoriesManager;