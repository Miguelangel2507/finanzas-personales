// ─────────────────────────────────────────────────────────────
// App root — estado, navegación, tab bar + Drive sync
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SEED_TX, DEFAULT_CATEGORIES, JORNAL as JORNAL_DEFAULT, fmt, fmtNum, CATEGORIES, CAT, ICONS, HISTORY } from './data'
import { Glyph, GLYPHS, CatIcon, Donut, ProgressBar } from './components'
import Dashboard from './Dashboard'
import History from './History'
import { AddSheet, CategoryDetail } from './AddExpense'
import AjustesSheet from './Settings'
import CategoriesManager from './CategoriesManager'
import { initDriveSync, connectDrive, disconnectDrive, syncToDrive, loadFromDrive, isConnected } from './driveSync'

const LS_KEY = 'fin_tx_v2'
const LS_CATS = 'fin_cats_v2'
const LS_JORNAL = 'fin_jornal_v1'

export default function App() {
  const [tx, setTx] = useState(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) return JSON.parse(s) } catch (e) {}
    return SEED_TX
  })

  const [cats, setCats] = useState(() => {
    let loaded = null
    try { const s = localStorage.getItem(LS_CATS); if (s) loaded = JSON.parse(s) } catch (e) {}
    const base = loaded || DEFAULT_CATEGORIES.map(c => ({ ...c }))
    return base.map(c => c.type === 'gasto' && !c.flow ? { ...c, flow: 'diario' } : c)
  })

  const [jornal, setJornal] = useState(() => {
    try { const s = localStorage.getItem(LS_JORNAL); if (s != null) return JSON.parse(s) } catch (e) {}
    return JORNAL_DEFAULT
  })

  // Persist to localStorage on change
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(tx)) } catch (e) {}
  }, [tx])

  useEffect(() => {
    try { localStorage.setItem(LS_CATS, JSON.stringify(cats)) } catch (e) {}
  }, [cats])

  useEffect(() => {
    try { localStorage.setItem(LS_JORNAL, JSON.stringify(jornal)) } catch (e) {}
  }, [jornal])

  // Navigation state
  const [tab, setTab] = useState('home')
  const [detailCat, setDetailCat] = useState(null)
  const [sheet, setSheet] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [presetCat, setPresetCat] = useState(null)
  const [settings, setSettings] = useState(false)
  const [manageCats, setManageCats] = useState(false)

  // Drive sync state
  const [syncStatus, setSyncStatus] = useState('disconnected')
  const [driveConnected, setDriveConnected] = useState(false)
  const [showSyncBanner, setShowSyncBanner] = useState(false)
  const syncTimerRef = useRef(null)
  const bannerTimerRef = useRef(null)

  const handleSyncStatus = useCallback((status) => {
    setSyncStatus(status)
    setDriveConnected(status === 'connected' || status === 'syncing')
    if (status === 'syncing' || status === 'error') {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
      setShowSyncBanner(true)
    } else if (status === 'connected') {
      setShowSyncBanner(true)
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
      bannerTimerRef.current = setTimeout(() => setShowSyncBanner(false), 3000)
    } else {
      setShowSyncBanner(false)
    }
  }, [])

  // Initialize Drive sync on mount
  useEffect(() => {
    initDriveSync(handleSyncStatus)
  }, [handleSyncStatus])

  // Debounced Drive sync (2 second delay after data changes)
  const debouncedSync = useCallback(() => {
    if (!isConnected()) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      syncToDrive({ tx, cats, jornal })
    }, 2000)
  }, [tx, cats, jornal])

  useEffect(() => {
    debouncedSync()
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current) }
  }, [debouncedSync])

  // Transaction operations
  const saveTx = (t) => setTx(prev => {
    const i = prev.findIndex(x => x.id === t.id)
    if (i >= 0) { const n = [...prev]; n[i] = t; return n }
    return [...prev, t]
  })
  const delTx = (id) => setTx(prev => prev.filter(x => x.id !== id))

  const openNew = () => { setEditTx(null); setPresetCat(detailCat || null); setSheet(true) }
  const openEdit = (t) => { setEditTx(t); setPresetCat(null); setSheet(true) }
  const openAddInCat = (c) => { setEditTx(null); setPresetCat(c); setSheet(true) }

  // Category operations
  const addCat = (c) => setCats(prev => [...prev, c])
  const updateCat = (c) => setCats(prev => prev.map(x => x.id === c.id ? c : x))
  const deleteCat = (id) => { setCats(prev => prev.filter(x => x.id !== id)); setTx(prev => prev.filter(t => t.cat !== id)) }

  // Reset everything
  const reset = () => { setTx([]); setCats(DEFAULT_CATEGORIES.map(c => ({ ...c }))); setJornal(0) }

  // Export data as JSON file
  const handleExport = () => {
    const data = { tx, cats, jornal, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finanzas-personales-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import data from JSON file
  const handleImport = (data) => {
    try {
      if (data.tx && Array.isArray(data.tx)) setTx(data.tx)
      if (data.cats && Array.isArray(data.cats)) setCats(data.cats)
      if (typeof data.jornal === 'number') setJornal(data.jornal)
      setSettings(false)
    } catch (e) {
      alert('Error al importar los datos.')
    }
  }

  // Drive connect/disconnect
  const handleConnectDrive = async () => {
    await connectDrive()
  }

  const handleDisconnectDrive = () => {
    disconnectDrive()
    setDriveConnected(false)
    setSyncStatus('disconnected')
  }

  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Status bar safe area */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px))', flexShrink: 0 }}>
        {/* Drive sync status bar — auto-dismisses after 3s on success */}
        {showSyncBanner && (
          <div style={{
            background: syncStatus === 'error' ? '#D85C3220' : '#3E6B5718',
            padding: '4px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 11.5, fontFamily: 'var(--ui)', color: syncStatus === 'error' ? 'var(--accent)' : '#3E6B57'
          }}>
            <span>
              {syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Error de sincronización' : '✓ Sincronizado con Drive'}
            </span>
            <button onClick={handleDisconnectDrive} style={{
              all: 'unset', cursor: 'pointer', fontSize: 11, fontWeight: 600, opacity: 0.7,
              color: syncStatus === 'error' ? 'var(--accent)' : '#3E6B57'
            }}>Desconectar</button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, overflow: 'hidden', paddingTop: '8px' }}>
        {detailCat
          ? <CategoryDetail catId={detailCat} tx={tx} cats={cats} onBack={() => setDetailCat(null)} onEdit={openEdit} onDelete={delTx} onAddInCat={openAddInCat} />
          : tab === 'home'
            ? <Dashboard tx={tx} cats={cats} jornal={jornal} onOpenCategory={setDetailCat} onOpenSettings={() => setSettings(true)} onOpenAdd={openNew} />
            : <History tx={tx} jornal={jornal} />
        }
      </div>

      {/* fade superior bajo la status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '58px', zIndex: 30, pointerEvents: 'none',
        background: 'linear-gradient(var(--bg) 60%, transparent)'
      }} />

      {/* Tab bar */}
      {!detailCat && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'var(--hero)', borderRadius: 99,
            padding: '7px 8px', boxShadow: '0 12px 30px -8px rgba(26,23,18,.5)'
          }}>
            <TabBtn label="Inicio" active={tab === 'home'} onClick={() => setTab('home')} d={GLYPHS.home} />
            <button onClick={openNew} style={{
              all: 'unset', cursor: 'pointer', width: 52, height: 52, borderRadius: 99, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px -4px var(--accent)', margin: '0 1px'
            }}>
              <Glyph d={GLYPHS.plus} size={26} stroke={2.4} color="#fff" />
            </button>
            <TabBtn label="Histórico" active={tab === 'history'} onClick={() => setTab('history')} d={GLYPHS.chart} />
          </div>
        </div>
      )}

      {/* AddSheet */}
      <AddSheet
        open={sheet}
        onClose={() => setSheet(false)}
        onSave={saveTx}
        onDelete={delTx}
        editTx={editTx}
        presetCat={presetCat}
        cats={cats}
      />

      {/* Ajustes */}
      <AjustesSheet
        open={settings}
        onClose={() => setSettings(false)}
        tx={tx}
        cats={cats}
        jornal={jornal}
        onSetJornal={setJornal}
        onEditTx={(t) => { setSettings(false); setTimeout(() => openEdit(t), 260) }}
        onManageCats={() => { setSettings(false); setTimeout(() => setManageCats(true), 260) }}
        onReset={reset}
        onExport={handleExport}
        onImport={handleImport}
        driveConnected={driveConnected}
        syncStatus={syncStatus}
        onConnectDrive={handleConnectDrive}
        onDisconnectDrive={handleDisconnectDrive}
      />

      {/* Gestor de categorías */}
      <CategoriesManager
        open={manageCats}
        onClose={() => setManageCats(false)}
        tx={tx}
        cats={cats}
        onAdd={addCat}
        onUpdate={updateCat}
        onDelete={deleteCat}
      />
    </div>
  )
}

function TabBtn({ label, active, onClick, d }) {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
      padding: '12px 16px', borderRadius: 99, background: active ? 'rgba(244,239,230,.12)' : 'transparent', transition: 'background .2s'
    }}>
      <Glyph d={d} size={21} stroke={2} color={active ? '#F4EFE6' : 'rgba(244,239,230,.5)'} />
      <span style={{ fontFamily: 'var(--ui)', fontSize: 13.5, fontWeight: 600, color: active ? '#F4EFE6' : 'rgba(244,239,230,.5)' }}>{label}</span>
    </button>
  )
}
