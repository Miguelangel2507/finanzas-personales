// ─────────────────────────────────────────────────────────────
// Dashboard — hero, donut por categoría, lista de categorías
// ─────────────────────────────────────────────────────────────
// Tarjeta de categoría reutilizable
function CatCard({ c, spent, onOpen, tag }) {
  const over = c.budget > 0 && spent > c.budget;
  return (
    <button onClick={() => onOpen(c.id)} style={{
      all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13,
      background: 'var(--paper)', borderRadius: 20, padding: '13px 15px',
      boxShadow: '0 1px 2px rgba(40,28,16,.04)' }}>
      <CatIcon cat={c} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 7 }}>
            {c.name}
            {tag && <span style={{ fontFamily: 'var(--ui)', fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--ink-soft)', background: '#00000008', padding: '2px 6px', borderRadius: 6 }}>{tag}</span>}
          </span>
          <span style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 600, color: over ? 'var(--accent)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}>{window.fmt(spent)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, margin: '7px 0 7px' }}>
          <ProgressBar value={spent} max={c.budget || spent || 1} color={over ? 'var(--accent)' : c.color} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)' }}>{c.sub}</span>
          <span style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: over ? 'var(--accent)' : 'var(--ink-soft)' }}>
            {c.budget > 0 ? over ? `+${window.fmt(spent - c.budget)}` : `${window.fmt(c.budget - spent)} libre` : 'sin presupuesto'}
          </span>
        </div>
      </div>
    </button>);
}

// Cabecera de sección de gastos con total
function SectionHead({ title, hint, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '22px 24px 10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
        {hint && <span style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)' }}>{hint}</span>}
      </div>
      {total != null && <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{window.fmt(total)}</span>}
    </div>);
}

function Dashboard({ tx, onOpenCategory, onScrollChange, onOpenSettings, onOpenAdd }) {
  const { JORNAL, MONTH_LABEL, CATEGORIES, CAT } = window.FIN;

  const spentByCat = useMemo(() => {
    const m = {};
    for (const c of CATEGORIES) m[c.id] = 0;
    for (const t of tx) m[t.cat] = (m[t.cat] || 0) + t.amount;
    return m;
  }, [tx]);

  const gastado = CATEGORIES.filter((c) => c.type === 'gasto').reduce((s, c) => s + spentByCat[c.id], 0);
  const invertido = CATEGORIES.filter((c) => c.type === 'inversion').reduce((s, c) => s + spentByCat[c.id], 0);
  const gastosFijos = CATEGORIES.filter((c) => c.type === 'gasto' && c.flow === 'fijo').reduce((s, c) => s + spentByCat[c.id], 0);
  const gastosDiarios = gastado - gastosFijos;
  const libre = JORNAL - gastado - invertido;
  const pct = (n) => JORNAL > 0 ? Math.round(n / JORNAL * 100) : 0;

  // Donut: categorías de gasto con importe > 0, ordenadas desc
  const gastoCats = CATEGORIES.filter((c) => c.type === 'gasto' && spentByCat[c.id] > 0).
  sort((a, b) => spentByCat[b.id] - spentByCat[a.id]);
  const slices = gastoCats.map((c) => ({ value: spentByCat[c.id], color: c.color, id: c.id }));

  // Categorías activas (presupuesto>0 o con gasto) ordenadas por importe
  const activeCats = CATEGORIES.filter((c) => c.budget > 0 || spentByCat[c.id] > 0).
  sort((a, b) => spentByCat[b.id] - spentByCat[a.id]);

  // Clasifica cada categoría de gasto en Fijos o Diarios según su propiedad flow
  const gastoActive = activeCats.filter((c) => c.type === 'gasto');
  const inversionActive = activeCats.filter((c) => c.type === 'inversion');
  const catsFijos = gastoActive.filter((c) => c.flow === 'fijo');
  const catsDiarios = gastoActive.filter((c) => c.flow !== 'fijo');
  const totalFijosCats = catsFijos.reduce((s, c) => s + spentByCat[c.id], 0);
  const totalDiariosCats = catsDiarios.reduce((s, c) => s + spentByCat[c.id], 0);

  const scrollRef = useRef(null);

  return (
    <div ref={scrollRef} onScroll={(e) => onScrollChange && onScrollChange(e.target.scrollTop)}
    style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', padding: '0 0 120px' }}>

      {/* Header */}
      <div style={{ padding: '8px 22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}>Hola de nuevo 👋</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 21, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em', marginTop: 2 }}>{MONTH_LABEL}</div>
        </div>
        <button onClick={onOpenSettings} style={{ all: 'unset', cursor: 'pointer', width: 42, height: 42, borderRadius: 99, background: 'var(--ink)', color: '#F3EDE3',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontWeight: 600, fontSize: 16 }}>FP</button>
      </div>

      {/* Hero card */}
      <div style={{ margin: '0 18px', borderRadius: 30, background: 'var(--hero)', color: '#F4EFE6',
        padding: '24px 24px 22px', boxShadow: '0 18px 40px -18px rgba(40,28,16,.55)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -50, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(216,92,50,.30), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 13.5, fontWeight: 500, color: 'rgba(244,239,230,.62)', letterSpacing: '.01em' }} data-comment-anchor="cd140704fd-div-50-11">Saldo libre este mes</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 7 }}>
            <span style={{ fontFamily: 'var(--display)', fontSize: 46, fontWeight: 600, letterSpacing: '-.025em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{window.fmtNum(libre, 2)}</span>
            <span style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, color: 'rgba(244,239,230,.7)' }}>€</span>
          </div>
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'rgba(244,239,230,.5)', marginTop: 8 }}>
            de {window.fmt(JORNAL)} de jornal · {pct(libre)}% libre
          </div>

          {/* Barra de asignación: Fijos / Diarios / Inversión / Ahorro */}
          <div style={{ display: 'flex', gap: 3, marginTop: 18, height: 8 }}>
            <div style={{ flex: gastosFijos, background: 'var(--accent)', borderRadius: 99 }} />
            <div style={{ flex: gastosDiarios, background: '#E0913C', borderRadius: 99 }} />
            <div style={{ flex: invertido, background: '#7FB39A', borderRadius: 99 }} />
            <div style={{ flex: Math.max(0, libre), background: 'rgba(244,239,230,.32)', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {[['Fijos', gastosFijos, 'var(--accent)'], ['Diarios', gastosDiarios, '#E0913C'], ['Inversión', invertido, '#7FB39A'], ['Ahorro', libre, 'rgba(244,239,230,.55)']].map(([l, v, col]) =>
            <div key={l} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: col, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'rgba(244,239,230,.6)' }}>{l}</span>
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 600, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{window.fmtNum(v, 0)}€</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proyección anual */}
      <div style={{ margin: '14px 18px 0', borderRadius: 24, background: 'var(--paper)', padding: '16px 20px 18px',
        boxShadow: '0 1px 2px rgba(40,28,16,.05), 0 8px 24px -16px rgba(40,28,16,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Proyección anual</span>
          <span style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)' }}>a este ritmo × 12</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['Ahorro / año', libre * 12, '#3E6B57', GLYPHS.spark], ['Inversión / año', invertido * 12, '#7FB39A', GLYPHS.arrowUp]].map(([l, v, col, g]) =>
          <div key={l} style={{ flex: 1, background: col + '0F', borderRadius: 16, padding: '14px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: col + '22', color: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Glyph d={g} size={13} stroke={2.2} />
                </div>
                <span style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 500 }}>{l}</span>
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 21, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>{window.fmtNum(Math.max(0, v), 0)}€</div>
            </div>
          )}
        </div>
        <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.45 }}>
          Hucha de fin de año estimada: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{window.fmt(Math.max(0, (libre + invertido) * 12))}</span>
        </div>
      </div>

      {/* Donut card */}
      <div style={{ margin: '16px 18px 0', borderRadius: 28, background: 'var(--paper)', padding: '20px 22px 22px',
        boxShadow: '0 1px 2px rgba(40,28,16,.05), 0 8px 24px -16px rgba(40,28,16,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>Gasto por categoría</span>
          <span style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--ink-soft)' }}>{gastoCats.length} activas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
          <Donut slices={slices} size={158} stroke={22}>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 11.5, color: 'var(--ink-soft)' }}>Gastado</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 25, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{window.fmtNum(gastado, 0)}€</div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{pct(gastado)}% jornal</div>
          </Donut>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {gastoCats.slice(0, 5).map((c) =>
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--ink)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{gastado > 0 ? Math.round(spentByCat[c.id] / gastado * 100) : 0}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gastos fijos */}
      <SectionHead title="Gastos fijos" hint="Recurrentes cada mes" total={catsFijos.length ? totalFijosCats : null} />
      {catsFijos.length === 0 ?
        <div style={{ margin: '0 18px', background: 'var(--paper)', borderRadius: 20, padding: '20px', textAlign: 'center', fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--ink-soft)' }}>Sin gastos fijos todavía</div> :
        <div style={{ margin: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {catsFijos.map((c) =>
            <CatCard key={c.id} c={c} spent={spentByCat[c.id]} onOpen={onOpenCategory} />
          )}
        </div>
      }

      {/* Gastos diarios */}
      <SectionHead title="Gastos diarios" hint="Variables del día a día" total={catsDiarios.length ? totalDiariosCats : null} />
      {catsDiarios.length === 0 ?
        <div style={{ margin: '0 18px', background: 'var(--paper)', borderRadius: 20, padding: '20px', textAlign: 'center', fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--ink-soft)' }}>Sin gastos diarios todavía</div> :
        <div style={{ margin: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {catsDiarios.map((c) =>
            <CatCard key={c.id} c={c} spent={spentByCat[c.id]} onOpen={onOpenCategory} />
          )}
        </div>
      }

      {/* Inversión */}
      {inversionActive.length > 0 &&
        <React.Fragment>
          <SectionHead title="Inversión" hint="Fondos y pensiones" total={inversionActive.reduce((s, c) => s + spentByCat[c.id], 0)} />
          <div style={{ margin: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inversionActive.map((c) => <CatCard key={c.id} c={c} spent={spentByCat[c.id]} onOpen={onOpenCategory} />)}
          </div>
        </React.Fragment>
      }
    </div>);

}

window.Dashboard = Dashboard;