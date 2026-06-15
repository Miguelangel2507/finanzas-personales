// ─────────────────────────────────────────────────────────────
// App root — estado, navegación, tab bar + FAB
// ─────────────────────────────────────────────────────────────
const LS_KEY = 'fin_tx_v2';
const LS_CATS = 'fin_cats_v2';
const LS_JORNAL = 'fin_jornal_v1';

function App() {
  const { SEED_TX, DEFAULT_CATEGORIES, JORNAL: JORNAL_DEFAULT } = window.FIN;
  const [tx, setTx] = useState(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) return JSON.parse(s); } catch(e){}
    return SEED_TX;
  });
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(tx)); } catch(e){} }, [tx]);

  const [cats, setCats] = useState(() => {
    let loaded = null;
    try { const s = localStorage.getItem(LS_CATS); if (s) loaded = JSON.parse(s); } catch(e){}
    const base = loaded || DEFAULT_CATEGORIES.map(c=>({...c}));
    // Normaliza: toda categoría de gasto debe tener flow ('fijo' | 'diario')
    return base.map(c => c.type === 'gasto' && !c.flow ? { ...c, flow: 'diario' } : c);
  });
  useEffect(() => { try { localStorage.setItem(LS_CATS, JSON.stringify(cats)); } catch(e){} }, [cats]);

  const [jornal, setJornal] = useState(() => {
    try { const s = localStorage.getItem(LS_JORNAL); if (s != null) return JSON.parse(s); } catch(e){}
    return JORNAL_DEFAULT;
  });
  useEffect(() => { try { localStorage.setItem(LS_JORNAL, JSON.stringify(jornal)); } catch(e){} }, [jornal]);

  // sincroniza para los componentes que leen window.FIN al renderizar
  window.FIN.CATEGORIES = cats;
  window.FIN.CAT = Object.fromEntries(cats.map(c=>[c.id,c]));
  window.FIN.JORNAL = jornal;

  const [tab, setTab] = useState('home');           // home | history
  const [detailCat, setDetailCat] = useState(null); // categoría abierta
  const [sheet, setSheet] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [presetCat, setPresetCat] = useState(null);
  const [settings, setSettings] = useState(false);
  const [manageCats, setManageCats] = useState(false);

  const saveTx = (t) => setTx(prev => {
    const i = prev.findIndex(x=>x.id===t.id);
    if (i>=0) { const n=[...prev]; n[i]=t; return n; }
    return [...prev, t];
  });
  const delTx = (id) => setTx(prev => prev.filter(x=>x.id!==id));

  const openNew = () => { setEditTx(null); setPresetCat(detailCat || null); setSheet(true); };
  const openEdit = (t) => { setEditTx(t); setPresetCat(null); setSheet(true); };
  const openAddInCat = (c) => { setEditTx(null); setPresetCat(c); setSheet(true); };

  const addCat = (c) => setCats(prev => [...prev, c]);
  const updateCat = (c) => setCats(prev => prev.map(x=>x.id===c.id?c:x));
  const deleteCat = (id) => { setCats(prev => prev.filter(x=>x.id!==id)); setTx(prev => prev.filter(t=>t.cat!==id)); };

  // Restablecer TODO a cero: sin movimientos, categorías por defecto, jornal a 0
  const reset = () => { setTx([]); setCats(DEFAULT_CATEGORIES.map(c=>({...c}))); setJornal(0); };

  return (
    <div style={{ height:'100%', position:'relative', background:'var(--bg)', overflow:'hidden' }}>
      {/* contenido */}
      <div style={{ height:'100%', paddingTop:'56px' }}>
        {detailCat
          ? <CategoryDetail catId={detailCat} tx={tx} onBack={()=>setDetailCat(null)} onEdit={openEdit} onAddInCat={openAddInCat} />
          : tab==='home'
            ? <Dashboard tx={tx} onOpenCategory={setDetailCat} onOpenSettings={()=>setSettings(true)} onOpenAdd={openNew} />
            : <History tx={tx} />
        }
      </div>

      {/* fade superior bajo la status bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'58px', zIndex:30, pointerEvents:'none',
        background:'linear-gradient(var(--bg) 60%, transparent)' }} />

      {/* Tab bar */}
      {!detailCat && (
        <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:40, paddingBottom:'18px',
          display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--hero)', borderRadius:99,
            padding:'7px 8px', boxShadow:'0 12px 30px -8px rgba(26,23,18,.5)' }}>
            <TabBtn label="Inicio" active={tab==='home'} onClick={()=>setTab('home')} d={GLYPHS.home} />
            <button onClick={openNew} style={{ all:'unset', cursor:'pointer', width:52, height:52, borderRadius:99, background:'var(--accent)',
              display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 16px -4px var(--accent)', margin:'0 1px' }}>
              <Glyph d={GLYPHS.plus} size={26} stroke={2.4} color="#fff" />
            </button>
            <TabBtn label="Histórico" active={tab==='history'} onClick={()=>setTab('history')} d={GLYPHS.chart} />
          </div>
        </div>
      )}

      {/* Sheet */}
      <AddSheet open={sheet} onClose={()=>setSheet(false)} onSave={saveTx} onDelete={delTx} editTx={editTx} presetCat={presetCat} />

      {/* Ajustes */}
      <AjustesSheet open={settings} onClose={()=>setSettings(false)} tx={tx}
        jornal={jornal} onSetJornal={setJornal}
        onEditTx={(t)=>{ setSettings(false); setTimeout(()=>openEdit(t), 260); }}
        onManageCats={()=>{ setSettings(false); setTimeout(()=>setManageCats(true), 260); }}
        onReset={reset} />

      {/* Gestor de categorías */}
      <CategoriesManager open={manageCats} onClose={()=>setManageCats(false)} tx={tx}
        onAdd={addCat} onUpdate={updateCat} onDelete={deleteCat} />
    </div>
  );
}

function TabBtn({ label, active, onClick, d }) {
  return (
    <button onClick={onClick} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:7,
      padding:'12px 16px', borderRadius:99, background: active?'rgba(244,239,230,.12)':'transparent', transition:'background .2s' }}>
      <Glyph d={d} size={21} stroke={2} color={active?'#F4EFE6':'rgba(244,239,230,.5)'} />
      <span style={{ fontFamily:'var(--ui)', fontSize:13.5, fontWeight:600, color: active?'#F4EFE6':'rgba(244,239,230,.5)' }}>{label}</span>
    </button>
  );
}

window.App = App;
