// ─────────────────────────────────────────────────────────────
// Componentes compartidos: Icon, Donut, ProgressBar, etc.
// ─────────────────────────────────────────────────────────────
const { useState, useEffect, useRef, useMemo } = React;

// Icono de categoría dentro de una baldosa redondeada con el color de la categoría
function CatIcon({ cat, size = 44, radius = 14, iconScale = 0.55 }) {
  const inner = Math.round(size * iconScale);
  return (
    <div style={{
      width:size, height:size, borderRadius:radius, flexShrink:0,
      background: cat.color + '1A', color: cat.color,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={cat.icon} />
      </svg>
    </div>
  );
}

// Donut chart (SVG). slices: [{value, color, label}]. Renderiza un anillo.
function Donut({ slices, size = 188, stroke = 26, gap = 0.018, children, animate = true }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [t, setT] = useState(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) return;
    let raf, start;
    const dur = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setT(eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const frac = (s.value / total);
    const len = Math.max(0, (frac - gap) * c) * t;
    const dash = `${len} ${c - len}`;
    const el = (
      <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
        stroke={s.color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={-offset * c * t + 0.001}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    );
    offset += frac;
    return el;
  });

  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#00000008" strokeWidth={stroke} />
        {arcs}
      </svg>
      {children && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', textAlign:'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value, max, color, track = '#00000010', height = 6 }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <div style={{ height, borderRadius:99, background:track, overflow:'hidden', width:'100%' }}>
      <div style={{ height:'100%', width:`${pct*100}%`, background:color, borderRadius:99,
        transition:'width .5s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

// Botón flotante / chevrons / glyphs simples
function Glyph({ d, size = 22, stroke = 2, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p,i)=><path key={i} d={p}/>) : <path d={d} />}
    </svg>
  );
}

const GLYPHS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v9h14v-9',
  chart: 'M4 19V5m0 14h16M8 15v-3m4 3V9m4 6v-5',
  plus: 'M12 5v14M5 12h14',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5 9-10',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  arrowUp: 'M12 19V6M6 12l6-6 6 6',
  arrowDown: 'M12 5v13M6 12l6 6 6-6',
  spark: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M18 18l-2.5-2.5M6 18l2.5-2.5M18 6l-2.5 2.5',
};

Object.assign(window, { CatIcon, Donut, ProgressBar, Glyph, GLYPHS });
