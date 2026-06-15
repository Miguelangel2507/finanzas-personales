// ─────────────────────────────────────────────────────────────
// Histórico — evolución mensual con gráfico de barras + composición
// ─────────────────────────────────────────────────────────────
function History({ tx }) {
  const { HISTORY, JORNAL } = window.FIN;
  const [metric, setMetric] = useState('ahorro'); // 'ahorro' | 'gastos'
  const [sel, setSel] = useState(HISTORY.length - 1);

  const data = HISTORY;
  const vals = data.map(d => metric === 'ahorro' ? d.ahorro : d.gastos);
  const maxV = Math.max(...vals) * 1.15;
  const avg = vals.reduce((s,x)=>s+x,0) / vals.length;

  const totalAhorro = data.reduce((s,d)=>s+d.ahorro,0);
  const bestMonth = data.reduce((a,b)=>b.ahorro>a.ahorro?b:a);
  const avgRate = Math.round((data.reduce((s,d)=>s+d.ahorro/d.jornal,0)/data.length)*100);

  const selData = data[sel];
  const accent = metric === 'ahorro' ? '#3E6B57' : 'var(--accent)';

  const chartH = 150;

  return (
    <div style={{ height:'100%', overflowY:'auto', overflowX:'hidden', padding:'0 0 120px' }}>
      {/* Header */}
      <div style={{ padding:'8px 22px 4px' }}>
        <div style={{ fontFamily:'var(--ui)', fontSize:14, color:'var(--ink-soft)', fontWeight:500 }}>Evolución</div>
        <div style={{ fontFamily:'var(--display)', fontSize:28, fontWeight:600, color:'var(--ink)', letterSpacing:'-.02em', marginTop:2 }}>Histórico 2026</div>
      </div>

      {/* Stat destacada */}
      <div style={{ margin:'14px 18px 0', borderRadius:28, background:'var(--hero)', color:'#F4EFE6', padding:'20px 22px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:-70, left:-30, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(127,179,154,.22), transparent 70%)' }} />
        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--ui)', fontSize:13, color:'rgba(244,239,230,.6)' }}>Ahorro acumulado</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:6 }}>
              <span style={{ fontFamily:'var(--display)', fontSize:38, fontWeight:600, letterSpacing:'-.025em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{window.fmtNum(totalAhorro,0)}</span>
              <span style={{ fontFamily:'var(--display)', fontSize:20, color:'rgba(244,239,230,.7)' }}>€</span>
            </div>
            <div style={{ fontFamily:'var(--ui)', fontSize:12, color:'rgba(244,239,230,.5)', marginTop:7, whiteSpace:'nowrap' }}>en 6 meses · {avgRate}% de media</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(127,179,154,.18)', padding:'6px 11px', borderRadius:99 }}>
            <Glyph d={GLYPHS.arrowUp} size={14} color="#A6D4BE" stroke={2.4} />
            <span style={{ fontFamily:'var(--display)', fontSize:13, fontWeight:600, color:'#A6D4BE' }}>{avgRate}%</span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ margin:'16px 18px 0', borderRadius:28, background:'var(--paper)', padding:'18px 18px 16px',
        boxShadow:'0 1px 2px rgba(40,28,16,.05), 0 8px 24px -16px rgba(40,28,16,.18)' }}>
        {/* segmented */}
        <div style={{ display:'flex', background:'#00000008', borderRadius:13, padding:3, marginBottom:18 }}>
          {[['ahorro','Ahorro'],['gastos','Gastos']].map(([k,l])=>(
            <button key={k} onClick={()=>setMetric(k)} style={{
              all:'unset', cursor:'pointer', flex:1, textAlign:'center', padding:'7px 0', borderRadius:10,
              fontFamily:'var(--ui)', fontSize:13.5, fontWeight:600,
              color: metric===k ? 'var(--ink)' : 'var(--ink-soft)',
              background: metric===k ? 'var(--paper)' : 'transparent',
              boxShadow: metric===k ? '0 1px 3px rgba(40,28,16,.12)' : 'none', transition:'all .2s' }}>{l}</button>
          ))}
        </div>

        {/* valor seleccionado */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:'var(--ui)', fontSize:12.5, color:'var(--ink-soft)' }}>{metric==='ahorro'?'Ahorrado':'Gastado'} en {selData.m}</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontFamily:'var(--display)', fontSize:30, fontWeight:600, color:'var(--ink)', letterSpacing:'-.02em', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{window.fmt(metric==='ahorro'?selData.ahorro:selData.gastos)}</span>
            {selData.current && <span style={{ fontFamily:'var(--ui)', fontSize:11, fontWeight:600, color:accent, background:accent+'18', padding:'3px 8px', borderRadius:99 }}>actual</span>}
          </div>
        </div>

        {/* barras */}
        <div style={{ position:'relative', height:chartH, display:'flex', alignItems:'flex-end', gap:8 }}>
          {/* línea media */}
          <div style={{ position:'absolute', left:0, right:0, bottom:`${(avg/maxV)*chartH}px`, borderTop:'1.5px dashed #00000020', zIndex:1 }}>
            <span style={{ position:'absolute', right:0, top:-16, fontFamily:'var(--ui)', fontSize:9.5, color:'var(--ink-soft)', background:'var(--paper)', padding:'0 4px' }}>media {window.fmtNum(avg,0)}€</span>
          </div>
          {data.map((d,i)=>{
            const v = metric==='ahorro'?d.ahorro:d.gastos;
            const h = Math.max(4,(v/maxV)*chartH);
            const isSel = i===sel;
            return (
              <button key={d.m} onClick={()=>setSel(i)} style={{ all:'unset', cursor:'pointer', flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:7, height:'100%', justifyContent:'flex-end' }}>
                <div style={{ width:'100%', maxWidth:30, height:h, borderRadius:9,
                  background: isSel ? accent : (d.current ? accent+'55' : '#00000010'),
                  transition:'height .5s cubic-bezier(.2,.8,.2,1), background .2s', position:'relative' }}>
                  {isSel && <div style={{ position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)', width:6, height:6, borderRadius:99, background:accent }} />}
                </div>
                <span style={{ fontFamily:'var(--ui)', fontSize:11.5, fontWeight: isSel?700:500, color: isSel?'var(--ink)':'var(--ink-soft)' }}>{d.m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Composición mensual (mini stacked) */}
      <div style={{ margin:'16px 18px 0', borderRadius:28, background:'var(--paper)', padding:'18px 22px 20px',
        boxShadow:'0 1px 2px rgba(40,28,16,.05), 0 8px 24px -16px rgba(40,28,16,.18)' }}>
        <div style={{ fontFamily:'var(--display)', fontSize:17, fontWeight:600, color:'var(--ink)', marginBottom:4 }}>Reparto del jornal</div>
        <div style={{ display:'flex', gap:16, marginBottom:16 }}>
          {[['Gastos','var(--accent)'],['Inversión','#7FB39A'],['Ahorro','#C9BBA6']].map(([l,c])=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:3, background:c }} />
              <span style={{ fontFamily:'var(--ui)', fontSize:11.5, color:'var(--ink-soft)' }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          {data.map(d=>(
            <div key={d.m} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontFamily:'var(--ui)', fontSize:12, fontWeight:600, color:'var(--ink-soft)', width:26 }}>{d.m}</span>
              <div style={{ flex:1, display:'flex', height:9, borderRadius:99, overflow:'hidden', gap:1.5 }}>
                <div style={{ flex:d.gastos, background:'var(--accent)' }} />
                <div style={{ flex:d.inversion, background:'#7FB39A' }} />
                <div style={{ flex:d.ahorro, background:'#C9BBA6' }} />
              </div>
              <span style={{ fontFamily:'var(--display)', fontSize:12, fontWeight:600, color:'var(--ink)', width:46, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{window.fmtNum(d.ahorro,0)}€</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats inferiores */}
      <div style={{ display:'flex', gap:12, margin:'16px 18px 0' }}>
        {[['Mejor mes',bestMonth.m,window.fmt(bestMonth.ahorro)],['Media mensual','',window.fmt(Math.round(totalAhorro/data.length))]].map(([l,sub,v],i)=>(
          <div key={i} style={{ flex:1, background:'var(--paper)', borderRadius:22, padding:'16px 18px', boxShadow:'0 1px 2px rgba(40,28,16,.04)' }}>
            <div style={{ fontFamily:'var(--ui)', fontSize:12.5, color:'var(--ink-soft)' }}>{l}{sub && <span style={{ color:'var(--ink)', fontWeight:600 }}> · {sub}</span>}</div>
            <div style={{ fontFamily:'var(--display)', fontSize:20, fontWeight:600, color:'var(--ink)', marginTop:5, fontVariantNumeric:'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily:'var(--ui)', fontSize:11, color:'var(--ink-soft)', textAlign:'center', margin:'18px 30px 0', opacity:.7, lineHeight:1.5 }}>
        Junio y mayo con tus cifras reales. Meses anteriores de ejemplo hasta que registres más datos.
      </div>
    </div>
  );
}

window.History = History;
