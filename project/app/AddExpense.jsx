// ─────────────────────────────────────────────────────────────
// AddSheet (añadir/editar gasto, funcional) + CategoryDetail
// ─────────────────────────────────────────────────────────────

// Sugerencias de concepto por categoría
const SUGGEST = {
  casa:['Alquiler','Luz','Agua','Gasolina','Internet','Supermercado','Mascota'],
  autonomo:['Cuota autónomo','Gestoría'],
  ocio:['Cena','Cine','Copas','Salida finde','Concierto'],
  gym:['Cuota gym','Material'],
  fondos:['Aportación fondo'],
  pensiones:['Plan de pensiones'],
  ropa:['Camiseta','Zapatos','Abrigo'],
  regalos:['Cumpleaños','Detalle'],
  higiene:['Cosmética','Peluquería'],
  alimentacion:['Café','Delivery','Restaurante'],
  salud:['Farmacia','Seguro médico','Médico'],
  suscripciones:['Spotify','Netflix','iCloud'],
  formacion:['Curso','Libro'],
};

function AddSheet({ open, onClose, onSave, onDelete, editTx, presetCat }) {
  const { CATEGORIES, CAT } = window.FIN;
  const [amount, setAmount] = useState('0');
  const [catId, setCatId] = useState(presetCat || 'ocio');
  const [desc, setDesc] = useState('');
  const [day, setDay] = useState(14);

  useEffect(() => {
    if (open) {
      if (editTx) { setAmount(String(editTx.amount).replace('.', ',')); setCatId(editTx.cat); setDesc(editTx.desc); setDay(editTx.day); }
      else { setAmount('0'); setCatId(presetCat || 'ocio'); setDesc(''); setDay(14); }
    }
  }, [open, editTx, presetCat]);

  const cat = CAT[catId];
  const numAmount = parseFloat(amount.replace(',', '.')) || 0;

  const press = (k) => {
    setAmount(prev => {
      if (k === 'del') { const n = prev.slice(0,-1); return n === '' ? '0' : n; }
      if (k === ',') { if (prev.includes(',')) return prev; return prev + ','; }
      // límite 2 decimales
      if (prev.includes(',') && prev.split(',')[1].length >= 2) return prev;
      if (prev === '0' && k !== ',') return k;
      if (prev.replace(',','').replace('.','').length >= 7) return prev;
      return prev + k;
    });
  };

  const canSave = numAmount > 0;
  const save = () => {
    if (!canSave) return;
    onSave({ id: editTx ? editTx.id : 't'+Date.now(), cat:catId, desc: desc || cat.name, amount: Math.round(numAmount*100)/100, day });
    onClose();
  };

  const suggestions = SUGGEST[catId] || [];

  return (
    <div style={{ position:'absolute', inset:0, zIndex:200, pointerEvents: open?'auto':'none' }}>
      {/* backdrop */}
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(26,23,18,.4)',
        opacity: open?1:0, transition:'opacity .3s', backdropFilter: open?'blur(2px)':'none' }} />
      {/* sheet */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, background:'var(--bg)',
        borderRadius:'34px 34px 0 0', transform: open?'translateY(0)':'translateY(105%)',
        transition:'transform .42s cubic-bezier(.32,.72,0,1)', maxHeight:'94%', display:'flex', flexDirection:'column',
        boxShadow:'0 -10px 40px rgba(26,23,18,.18)' }}>
        {/* grabber + header */}
        <div style={{ padding:'10px 0 0', display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
          <div style={{ width:40, height:5, borderRadius:99, background:'#00000018' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px 4px', flexShrink:0 }}>
          <button onClick={onClose} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--ui)', fontSize:15, color:'var(--ink-soft)' }}>Cancelar</button>
          <span style={{ fontFamily:'var(--display)', fontSize:16, fontWeight:600, color:'var(--ink)' }}>{editTx?'Editar gasto':'Nuevo gasto'}</span>
          <button onClick={save} style={{ all:'unset', cursor: canSave?'pointer':'default', fontFamily:'var(--ui)', fontSize:15, fontWeight:700, color: canSave?'var(--accent)':'var(--ink-soft)', opacity:canSave?1:.5 }}>Guardar</button>
        </div>

        <div style={{ overflowY:'auto', flex:1, padding:'0 0 8px' }}>
          {/* importe */}
          <div style={{ textAlign:'center', padding:'16px 0 10px' }}>
            <div style={{ display:'inline-flex', alignItems:'baseline', gap:6 }}>
              <span style={{ fontFamily:'var(--display)', fontSize:54, fontWeight:600, color: numAmount>0?'var(--ink)':'#00000028', letterSpacing:'-.03em', fontVariantNumeric:'tabular-nums' }}>{amount}</span>
              <span style={{ fontFamily:'var(--display)', fontSize:30, fontWeight:500, color:'#00000035' }}>€</span>
            </div>
            <div style={{ marginTop:4, fontFamily:'var(--ui)', fontSize:12.5, color:'var(--ink-soft)' }}>
              {cat.type==='inversion'?'Inversión':'Gasto'} · {cat.name}
            </div>
          </div>

          {/* categorías */}
          <div style={{ display:'flex', gap:9, overflowX:'auto', padding:'6px 18px 10px', scrollbarWidth:'none' }}>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>{setCatId(c.id); setDesc('');}} style={{
                all:'unset', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0, width:62 }}>
                <div style={{ width:50, height:50, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
                  background: catId===c.id ? c.color : c.color+'14', color: catId===c.id ? '#fff' : c.color,
                  transition:'all .18s', boxShadow: catId===c.id ? `0 6px 14px -4px ${c.color}88` : 'none' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={c.icon}/></svg>
                </div>
                <span style={{ fontFamily:'var(--ui)', fontSize:10.5, fontWeight: catId===c.id?700:500, color: catId===c.id?'var(--ink)':'var(--ink-soft)', textAlign:'center', lineHeight:1.15 }}>{c.name}</span>
              </button>
            ))}
          </div>

          {/* concepto */}
          <div style={{ padding:'4px 18px 0' }}>
            <div style={{ fontFamily:'var(--ui)', fontSize:12, fontWeight:600, color:'var(--ink-soft)', marginBottom:8, paddingLeft:2 }}>Concepto</div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {suggestions.map(s=>(
                <button key={s} onClick={()=>setDesc(s)} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--ui)', fontSize:13, fontWeight:500,
                  padding:'7px 13px', borderRadius:99, background: desc===s?'var(--ink)':'var(--paper)', color: desc===s?'#F4EFE6':'var(--ink)',
                  boxShadow:'0 1px 2px rgba(40,28,16,.05)', transition:'all .15s' }}>{s}</button>
              ))}
            </div>
          </div>

          {/* día */}
          <div style={{ padding:'16px 18px 4px' }}>
            <div style={{ fontFamily:'var(--ui)', fontSize:12, fontWeight:600, color:'var(--ink-soft)', marginBottom:8, paddingLeft:2 }}>Día de junio</div>
            <div style={{ display:'flex', gap:7, overflowX:'auto', scrollbarWidth:'none', paddingBottom:2 }}>
              {Array.from({length:14},(_,i)=>14-i).map(dd=>(
                <button key={dd} onClick={()=>setDay(dd)} style={{ all:'unset', cursor:'pointer', flexShrink:0, width:42, height:42, borderRadius:13,
                  display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:15, fontWeight:600,
                  background: day===dd?'var(--accent)':'var(--paper)', color: day===dd?'#fff':'var(--ink)', boxShadow:'0 1px 2px rgba(40,28,16,.05)' }}>{dd}</button>
              ))}
            </div>
          </div>

          {editTx && (
            <button onClick={()=>{onDelete(editTx.id); onClose();}} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              margin:'18px 18px 4px', padding:'12px', borderRadius:16, background:'#D85C3212', color:'var(--accent)', fontFamily:'var(--ui)', fontSize:14, fontWeight:600 }}>
              <Glyph d={GLYPHS.trash} size={17} stroke={1.9} /> Eliminar gasto
            </button>
          )}
        </div>

        {/* teclado numérico */}
        <div style={{ flexShrink:0, padding:'8px 16px calc(env(safe-area-inset-bottom) + 20px)', background:'var(--bg)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9 }}>
            {['1','2','3','4','5','6','7','8','9',',','0','del'].map(k=>(
              <button key={k} onClick={()=>press(k)} style={{ all:'unset', cursor:'pointer', height:52, borderRadius:16,
                display:'flex', alignItems:'center', justifyContent:'center', background: (k==='del'||k===',')?'transparent':'var(--paper)',
                fontFamily:'var(--display)', fontSize:23, fontWeight:600, color:'var(--ink)',
                boxShadow: (k==='del'||k===',')?'none':'0 1px 2px rgba(40,28,16,.06)' }}>
                {k==='del' ? <Glyph d={'M22 6H9l-6 6 6 6h13a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM16 10l-4 4M12 10l4 4'} size={24} stroke={1.9}/> : k}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Detalle de categoría — lista de transacciones, editar/eliminar
function CategoryDetail({ catId, tx, onBack, onEdit, onAddInCat }) {
  const { CAT } = window.FIN;
  const cat = CAT[catId];
  const list = tx.filter(t=>t.cat===catId).sort((a,b)=>b.day-a.day);
  const spent = list.reduce((s,t)=>s+t.amount,0);
  const over = cat.budget>0 && spent>cat.budget;

  return (
    <div style={{ height:'100%', overflowY:'auto', overflowX:'hidden', padding:'0 0 120px', background:'var(--bg)' }}>
      <div style={{ padding:'6px 18px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ all:'unset', cursor:'pointer', width:40, height:40, borderRadius:99, background:'var(--paper)',
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 2px rgba(40,28,16,.06)' }}>
          <Glyph d={GLYPHS.back} size={20} stroke={2.2} color="var(--ink)" />
        </button>
        <button onClick={()=>onAddInCat(catId)} style={{ all:'unset', cursor:'pointer', width:40, height:40, borderRadius:99, background:cat.color,
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px -3px ${cat.color}99` }}>
          <Glyph d={GLYPHS.plus} size={20} stroke={2.4} color="#fff" />
        </button>
      </div>

      {/* cabecera categoría */}
      <div style={{ padding:'12px 22px 6px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
        <CatIcon cat={cat} size={62} radius={20} iconScale={0.5} />
        <div style={{ fontFamily:'var(--display)', fontSize:22, fontWeight:600, color:'var(--ink)', marginTop:12 }}>{cat.name}</div>
        <div style={{ fontFamily:'var(--ui)', fontSize:13, color:'var(--ink-soft)', marginTop:2 }}>{cat.sub}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:14 }}>
          <span style={{ fontFamily:'var(--display)', fontSize:40, fontWeight:600, color:'var(--ink)', letterSpacing:'-.02em', fontVariantNumeric:'tabular-nums' }}>{window.fmtNum(spent,2)}</span>
          <span style={{ fontFamily:'var(--display)', fontSize:22, color:'var(--ink-soft)' }}>€</span>
        </div>
        {cat.budget>0 && (
          <div style={{ width:'70%', marginTop:14 }}>
            <ProgressBar value={spent} max={cat.budget} color={over?'var(--accent)':cat.color} height={8} />
            <div style={{ fontFamily:'var(--ui)', fontSize:12, color: over?'var(--accent)':'var(--ink-soft)', marginTop:8 }}>
              {over ? `${window.fmt(spent-cat.budget)} por encima del presupuesto` : `${window.fmt(cat.budget-spent)} libres de ${window.fmt(cat.budget)}`}
            </div>
          </div>
        )}
      </div>

      {/* lista */}
      <div style={{ fontFamily:'var(--display)', fontSize:15, fontWeight:600, color:'var(--ink)', padding:'20px 24px 10px' }}>Movimientos · {list.length}</div>
      <div style={{ margin:'0 18px', background:'var(--paper)', borderRadius:22, overflow:'hidden', boxShadow:'0 1px 2px rgba(40,28,16,.04)' }}>
        {list.length===0 && <div style={{ padding:'28px', textAlign:'center', fontFamily:'var(--ui)', fontSize:14, color:'var(--ink-soft)' }}>Sin movimientos todavía</div>}
        {list.map((t,i)=>(
          <button key={t.id} onClick={()=>onEdit(t)} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
            borderBottom: i<list.length-1?'0.5px solid rgba(60,50,40,.10)':'none', width:'100%', boxSizing:'border-box' }}>
            <div style={{ width:38, height:38, borderRadius:11, background:cat.color+'14', color:cat.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon}/></svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--ui)', fontSize:15, fontWeight:600, color:'var(--ink)' }}>{t.desc}</div>
              <div style={{ fontFamily:'var(--ui)', fontSize:12, color:'var(--ink-soft)', marginTop:1 }}>{t.day} jun 2026</div>
            </div>
            <span style={{ fontFamily:'var(--display)', fontSize:16, fontWeight:600, color:'var(--ink)', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', flexShrink:0 }}>−{window.fmt(t.amount)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AddSheet, CategoryDetail });
