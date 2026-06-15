// ─────────────────────────────────────────────────────────────
// AjustesSheet — gastos fijos editables + restablecer datos + Drive sync
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react'
import { Glyph, GLYPHS } from './components'
import { fmt, fmtNum } from './data'

export default function AjustesSheet({
  open, onClose, tx, cats, jornal, onSetJornal, onEditTx, onManageCats, onReset,
  onExport, onImport, driveConnected, syncStatus, onConnectDrive, onDisconnectDrive
}) {
  const CAT = Object.fromEntries((cats || []).map(c => [c.id, c]))
  const [confirm, setConfirm] = useState(false)
  const [jornalDraft, setJornalDraft] = useState('')
  const [editingJornal, setEditingJornal] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { if (!open) { setConfirm(false); setEditingJornal(false) } }, [open])
  useEffect(() => { setJornalDraft(jornal ? String(jornal).replace('.', ',') : '') }, [jornal, open])

  const commitJornal = () => {
    const v = parseFloat(String(jornalDraft).replace(',', '.')) || 0
    onSetJornal(Math.round(v * 100) / 100)
    setEditingJornal(false)
  }

  const fixed = tx.filter((t) => t.fixed).sort((a, b) => b.amount - a.amount)
  const totalFijos = fixed.reduce((s, t) => s + t.amount, 0)

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        onImport(data)
      } catch (err) {
        alert('Error al leer el archivo. Asegúrate de que es un JSON válido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 190, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(26,23,18,.4)',
        opacity: open ? 1 : 0, transition: 'opacity .3s', backdropFilter: open ? 'blur(2px)' : 'none'
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg)',
        borderRadius: '34px 34px 0 0', transform: open ? 'translateY(0)' : 'translateY(105%)',
        transition: 'transform .42s cubic-bezier(.32,.72,0,1)', maxHeight: '92%', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(26,23,18,.18)'
      }}>

        <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: '#00000018' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 4px', flexShrink: 0 }}>
          <span style={{ width: 60 }} />
          <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Ajustes</span>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 60, textAlign: 'right', fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>Hecho</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 18px calc(env(safe-area-inset-bottom) + 24px)' }}>
          {/* Jornal mensual (editable) */}
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.03em', padding: '0 4px 9px' }}>Ingresos</div>
          <div style={{ background: 'var(--paper)', borderRadius: 22, padding: '15px 16px', marginBottom: 18, boxShadow: '0 1px 2px rgba(40,28,16,.04)', display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3E6B5714', color: '#3E6B57', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Glyph d={['M3 7h18v10H3z', 'M3 11h18', 'M7 15h3']} size={20} stroke={1.9} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Jornal mensual</div>
              <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>Tu ingreso de cada mes</div>
            </div>
            {editingJornal
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input autoFocus value={jornalDraft} inputMode="decimal"
                  onChange={(e) => setJornalDraft(e.target.value.replace(/[^0-9,.]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitJornal() }}
                  style={{
                    width: 86, border: 'none', outline: 'none', background: '#00000008', borderRadius: 10, padding: '8px 10px', textAlign: 'right',
                    fontFamily: 'var(--display)', fontSize: 17, fontWeight: 600, color: 'var(--ink)'
                  }} />
                <button onClick={commitJornal} style={{ all: 'unset', cursor: 'pointer', width: 34, height: 34, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Glyph d={GLYPHS.check} size={18} stroke={2.4} color="#fff" />
                </button>
              </div>
              : <button onClick={() => setEditingJornal(true)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{fmt(jornal || 0)}</span>
                <Glyph d={GLYPHS.edit} size={16} stroke={1.9} color="var(--ink-soft)" />
              </button>
            }
          </div>

          {/* resumen gastos fijos */}
          <div style={{ borderRadius: 24, background: 'var(--hero)', color: '#F4EFE6', padding: '18px 20px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 13, color: 'rgba(244,239,230,.6)' }}>Total gastos fijos al mes</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 5 }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 600, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(totalFijos, 2)}</span>
              <span style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'rgba(244,239,230,.7)' }}>€</span>
            </div>
            <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'rgba(244,239,230,.5)', marginTop: 6 }}>{fixed.length} recurrentes · se repiten cada mes</div>
          </div>

          {/* lista editable */}
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.03em', padding: '0 4px 9px' }}>Gastos fijos · toca para editar</div>
          <div style={{ background: 'var(--paper)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(40,28,16,.04)' }}>
            {fixed.map((t, i) => {
              const cat = CAT[t.cat]
              if (!cat) return null
              return (
                <button key={t.id} onClick={() => onEditTx(t)} style={{
                  all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px',
                  borderBottom: i < fixed.length - 1 ? '0.5px solid rgba(60,50,40,.10)' : 'none', width: '100%', boxSizing: 'border-box'
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + '14', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon} /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t.desc}</div>
                    <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>{cat.name}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmt(t.amount)}</span>
                  <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0, marginLeft: 4 }}><path d="M1 1l6 6-6 6" stroke="rgba(60,50,40,.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )
            })}
            {fixed.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--ink-soft)' }}>Sin gastos fijos todavía</div>
            )}
          </div>

          {/* Categorías */}
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.03em', padding: '24px 4px 9px' }}>Categorías</div>
          <div style={{ background: 'var(--paper)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(40,28,16,.04)' }}>
            <button onClick={onManageCats} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3E6B5714', color: '#3E6B57', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Glyph d={['M4 6h7v7H4z', 'M13 6h7v4h-7z', 'M13 13h7v5h-7z', 'M4 15h7v3H4z']} size={20} stroke={1.9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Gestionar categorías</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>Añadir, editar o borrar · {(cats || []).length} categorías</div>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}><path d="M1 1l6 6-6 6" stroke="rgba(60,50,40,.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          {/* Google Drive sync */}
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.03em', padding: '24px 4px 9px' }}>Sincronización</div>
          <div style={{ background: 'var(--paper)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(40,28,16,.04)' }}>
            {driveConnected
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3E6B5714', color: '#3E6B57', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Glyph d={GLYPHS.check} size={20} stroke={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Google Drive conectado</div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: '#3E6B57', marginTop: 1 }}>
                    {syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Error de sincronización' : 'Datos sincronizados'}
                  </div>
                </div>
                <button onClick={onDisconnectDrive} style={{ all: 'unset', cursor: 'pointer', fontFamily: 'var(--ui)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                  Desconectar
                </button>
              </div>
              : <button onClick={onConnectDrive} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#4285F414', color: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 19.5h20L12 2zM2 19.5l5-8.5m5 8.5L7 11m10 8.5l-5-8.5" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Conectar con Google Drive</div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>Guarda tus datos en la nube</div>
                </div>
                <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }}><path d="M1 1l6 6-6 6" stroke="rgba(60,50,40,.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            }
          </div>

          {/* Exportar / Importar */}
          <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.03em', padding: '24px 4px 9px' }}>Datos</div>
          <div style={{ background: 'var(--paper)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(40,28,16,.04)' }}>
            <button onClick={onExport} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', width: '100%', boxSizing: 'border-box', borderBottom: '0.5px solid rgba(60,50,40,.10)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3E6B5714', color: '#3E6B57', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Glyph d={GLYPHS.arrowDown} size={20} stroke={1.9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Exportar datos</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>Descarga un archivo JSON</div>
              </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', width: '100%', boxSizing: 'border-box', borderBottom: '0.5px solid rgba(60,50,40,.10)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#4E7E8614', color: '#4E7E86', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Glyph d={GLYPHS.arrowUp} size={20} stroke={1.9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Importar datos</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>Carga un archivo JSON guardado</div>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />

            {/* Reset */}
            {!confirm
              ? <button onClick={() => setConfirm(true)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#D85C3214', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Glyph d={['M3 12a9 9 0 1 0 3-6.7', 'M3 4v4h4']} size={21} stroke={1.9} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Restablecer todo a cero</div>
                  <div style={{ fontFamily: 'var(--ui)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>Borra movimientos y jornal</div>
                </div>
              </button>
              : <div style={{ padding: '16px 16px' }}>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>¿Restablecer todo a cero?</div>
                <div style={{ fontFamily: 'var(--ui)', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 14, lineHeight: 1.45 }}>Se borrarán todos los movimientos y tu jornal volverá a 0. Las categorías vuelven a las de origen.</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setConfirm(false)} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '11px', borderRadius: 13, background: '#00000008', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Cancelar</button>
                  <button onClick={() => { onReset(); setConfirm(false); onClose() }} style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center', padding: '11px', borderRadius: 13, background: 'var(--accent)', fontFamily: 'var(--ui)', fontSize: 14, fontWeight: 700, color: '#fff' }}>Restablecer</button>
                </div>
              </div>
            }
          </div>

          <div style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 20, opacity: .7 }}>Finanzas Personales · datos guardados en este dispositivo</div>
        </div>
      </div>
    </div>
  )
}
