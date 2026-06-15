// ─────────────────────────────────────────────────────────────
// Modelo de datos — cifras reales del Excel "Finanzas Personales"
// Jornal 2.375 € · Gastos 1.518,50 € · Inversión 400 € · Ahorro 456,50 €
// ─────────────────────────────────────────────────────────────

export const JORNAL = 2375;
export const MONTH_LABEL = 'Junio 2026';

// Iconos monoline simples (24x24, stroke=currentColor)
export const ICONS = {
  casa:        'M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9',
  autonomo:    'M4 8h16v11H4zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16',
  ocio:        'M5 4h14v10a7 7 0 0 1-14 0zM5 4 3 8m16-4 2 4M9 21h6',
  gym:         'M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10',
  fondos:      'M4 19V5m0 14h16M8 15l3-4 3 2 4-6',
  pensiones:   'M12 3 4 7v5c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V7zM9 12l2 2 4-4',
  ropa:        'M9 4 5 7v3l2 1v9h10v-9l2-1V7l-4-3-3 2z',
  regalos:     'M4 11h16v9H4zM4 7h16v4H4zM12 7v13M12 7S10 3 8 4.5 9 7 12 7zm0 0s2-4 4-2.5S15 7 12 7z',
  higiene:     'M8 3h8l-1 5H9zM9 8v3a3 3 0 0 0 6 0V8M10 21h4',
  alimentacion:'M4 4v6a3 3 0 0 0 6 0V4M7 4v16M17 4c-2 0-3 2-3 5s1 4 3 4 3-1 3-4-1-5-3-5zm0 9v8',
  salud:       'M12 21C5 15 3 11 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 3-2 7-9 13zM12 8v6M9 11h6',
  suscripciones:'M3 5h18v12H3zM3 9h18M7 13h5',
  formacion:   'M3 8l9-4 9 4-9 4zM7 10.5V16c0 1 2.2 2 5 2s5-1 5-2v-5.5M21 8v5',
  ahorros:     'M21 11c0 4-3 7-7 7H8l-3 3v-4a7 7 0 0 1-2-5 7 7 0 0 1 7-7h4a7 7 0 0 1 7 6zM8 11h.01M12 11h.01M16 11h.01',
};

// Categorías con presupuesto real (€/mes) y tipo de flujo
// type: 'gasto' | 'inversion'   (el ahorro libre es derivado)
export const CATEGORIES = [
  { id:'casa',         name:'Casa',            sub:'Bote común · tu parte',     budget:800,   type:'gasto',     flow:'fijo',   color:'#D85C32', icon:ICONS.casa },
  { id:'autonomo',     name:'Cuota autónomo',  sub:'Seguridad Social',          budget:427.5, type:'gasto',     flow:'fijo',   color:'#C2562E', icon:ICONS.autonomo },
  { id:'ocio',         name:'Ocio',            sub:'Salidas, cenas, planes',    budget:200,   type:'gasto',     flow:'diario', color:'#E0913C', icon:ICONS.ocio },
  { id:'gym',          name:'Gym',             sub:'Cuota deporte',             budget:25,    type:'gasto',     flow:'fijo',   color:'#C99A4B', icon:ICONS.gym },
  { id:'fondos',       name:'Fondos',          sub:'Aportación mensual',        budget:200,   type:'inversion', color:'#3E6B57', icon:ICONS.fondos },
  { id:'pensiones',    name:'Plan pensiones',  sub:'Límite 1.500 €/año',        budget:200,   type:'inversion', color:'#4E7E86', icon:ICONS.pensiones },
  { id:'ropa',         name:'Ropa',            sub:'Ropa y calzado',            budget:15,    type:'gasto',     flow:'diario', color:'#B0623F', icon:ICONS.ropa },
  { id:'regalos',      name:'Regalos',         sub:'Cumples, navidades',        budget:15,    type:'gasto',     flow:'diario', color:'#C98A5B', icon:ICONS.regalos },
  { id:'higiene',      name:'Higiene',         sub:'Cosmética, cuidado',        budget:0,     type:'gasto',     flow:'diario', color:'#8C9A86', icon:ICONS.higiene },
  { id:'alimentacion', name:'Alimentación extra', sub:'Cafés, delivery',        budget:0,     type:'gasto',     flow:'diario', color:'#D4763F', icon:ICONS.alimentacion },
  { id:'salud',        name:'Salud',           sub:'Seguro, farmacia',          budget:33,    type:'gasto',     flow:'fijo',   color:'#A85B5B', icon:ICONS.salud },
  { id:'suscripciones',name:'Suscripciones',   sub:'Streaming, apps',           budget:3,     type:'gasto',     flow:'fijo',   color:'#7C6B9C', icon:ICONS.suscripciones },
  { id:'formacion',    name:'Formación',       sub:'Cursos, libros',            budget:0,     type:'gasto',     flow:'diario', color:'#5F8A7A', icon:ICONS.formacion },
];

export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const DEFAULT_CATEGORIES = CATEGORIES;

// Transacciones semilla de Junio 2026 — suman EXACTAMENTE las cifras reales
export const SEED_TX = [
  // Casa = 800
  { id:'t1',  cat:'casa', desc:'Alquiler · tu parte', amount:600, day:1, fixed:1 },
  { id:'t2',  cat:'casa', desc:'Internet y móvil',    amount:45,  day:2, fixed:1 },
  { id:'t3',  cat:'casa', desc:'Luz',                 amount:45,  day:5 },
  { id:'t4',  cat:'casa', desc:'Mascota · comida',    amount:20,  day:6 },
  { id:'t5',  cat:'casa', desc:'Agua',                amount:20,  day:9 },
  { id:'t6',  cat:'casa', desc:'Gasolina',            amount:70,  day:11 },
  // Autónomo = 427,5
  { id:'t7',  cat:'autonomo', desc:'Cuota autónomo · SS', amount:427.5, day:1, fixed:1 },
  // Ocio = 200
  { id:'t8',  cat:'ocio', desc:'Cena restaurante',    amount:45,  day:3 },
  { id:'t9',  cat:'ocio', desc:'Cine',                amount:18,  day:7 },
  { id:'t10', cat:'ocio', desc:'Salida finde',        amount:60,  day:8 },
  { id:'t11', cat:'ocio', desc:'Copas',               amount:32,  day:8 },
  { id:'t12', cat:'ocio', desc:'Concierto',           amount:45,  day:13 },
  // Gym = 25
  { id:'t13', cat:'gym', desc:'Cuota gym',            amount:25,  day:1, fixed:1 },
  // Inversión
  { id:'t14', cat:'fondos', desc:'Aportación fondo indexado', amount:200, day:1, fixed:1 },
  { id:'t15', cat:'pensiones', desc:'Plan de pensiones', amount:200, day:1, fixed:1 },
  // Ropa = 15
  { id:'t16', cat:'ropa', desc:'Camiseta',            amount:15,  day:10 },
  // Regalos = 15
  { id:'t17', cat:'regalos', desc:'Regalo cumpleaños',amount:15,  day:4 },
  // Salud = 33
  { id:'t18', cat:'salud', desc:'Seguro médico',      amount:20,  day:2, fixed:1 },
  { id:'t19', cat:'salud', desc:'Farmacia',           amount:13,  day:12 },
  // Suscripciones = 3
  { id:'t20', cat:'suscripciones', desc:'Spotify',    amount:3,   day:1, fixed:1 },
];

// Histórico — Junio es real; meses previos simulados (ancla ~456 € ahorro)
export const HISTORY = [
  { m:'Ene', jornal:2375, gastos:1490, inversion:400, ahorro:485 },
  { m:'Feb', jornal:2375, gastos:1360, inversion:400, ahorro:615 },
  { m:'Mar', jornal:2375, gastos:1605, inversion:400, ahorro:370 },
  { m:'Abr', jornal:2375, gastos:1440, inversion:400, ahorro:535 },
  { m:'May', jornal:2375, gastos:1518.5, inversion:400, ahorro:456.5 },
  { m:'Jun', jornal:2375, gastos:1518.5, inversion:400, ahorro:456.5, current:true },
];

// Formato € español: 1.234,56 € (agrupación manual de miles, robusta sin locale)
export function fmtNum(n, decimals) {
  const num = Number(n) || 0;
  const neg = num < 0;
  const abs = Math.abs(num);
  const d = decimals === undefined ? (Number.isInteger(abs) ? 0 : 2) : decimals;
  const fixed = abs.toFixed(d);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const out = parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
  return (neg ? '-' : '') + out;
}

export function fmt(n, decimals) {
  return fmtNum(n, decimals) + ' €';
}
