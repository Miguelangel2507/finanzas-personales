// ─────────────────────────────────────────────────────────────
// Google Drive sync service
// ─────────────────────────────────────────────────────────────

const CLIENT_ID = '133774864120-3or6hpi12h8pc5e9ttsfuaupniauv4a0.apps.googleusercontent.com'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FILE_NAME = 'finanzas-personales-data.json'
const LS_TOKEN = 'drive_token'
const LS_EXPIRY = 'drive_expiry'
const LS_CONNECTED = 'drive_connected'

let tokenClient = null
let accessToken = null
let tokenExpiry = 0
let cachedFileId = null
let statusCallback = null

function setStatus(s) {
  if (statusCallback) statusCallback(s)
}

function saveToken(token, expiry) {
  accessToken = token
  tokenExpiry = expiry
  try {
    localStorage.setItem(LS_TOKEN, token)
    localStorage.setItem(LS_EXPIRY, String(expiry))
    localStorage.setItem(LS_CONNECTED, '1')
  } catch (e) {}
}

function clearToken() {
  accessToken = null
  tokenExpiry = 0
  try {
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_EXPIRY)
    localStorage.removeItem(LS_CONNECTED)
  } catch (e) {}
}

function loadSavedToken() {
  try {
    const token = localStorage.getItem(LS_TOKEN)
    const expiry = parseInt(localStorage.getItem(LS_EXPIRY) || '0', 10)
    if (token && expiry > Date.now() + 60000) {
      accessToken = token
      tokenExpiry = expiry
      return true
    }
  } catch (e) {}
  return false
}

export function initDriveSync(onStatusChange) {
  statusCallback = onStatusChange

  // Restore saved token first — avoids re-login on every app open
  if (loadSavedToken()) {
    setStatus('connected')
    const ensureClient = () => {
      if (window.google?.accounts?.oauth2) {
        setupTokenClient()
      } else {
        const t = setInterval(() => {
          if (window.google?.accounts?.oauth2) { clearInterval(t); setupTokenClient() }
        }, 200)
      }
    }
    if (typeof window !== 'undefined') ensureClient()
    return
  }

  if (typeof window === 'undefined' || !window.google) {
    const checkGIS = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkGIS)
        setupTokenClient()
        tryAutoReconnect()
      }
    }, 200)
    return
  }

  setupTokenClient()
  tryAutoReconnect()
}

function setupTokenClient() {
  if (!window.google?.accounts?.oauth2) return
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: handleTokenResponse,
  })
}

function handleTokenResponse(response) {
  if (response.error) {
    console.error('Drive token error:', response.error)
    clearToken()
    setStatus('error')
    return
  }
  const expiry = Date.now() + 3600 * 1000
  saveToken(response.access_token, expiry)
  setStatus('connected')
}

function tryAutoReconnect() {
  const wasConnected = localStorage.getItem(LS_CONNECTED)
  if (!wasConnected) { setStatus('disconnected'); return }
  if (!tokenClient) { setStatus('disconnected'); return }
  setStatus('connecting')
  try {
    tokenClient.requestAccessToken({ prompt: '' })
  } catch (e) {
    setStatus('disconnected')
  }
}

export async function connectDrive() {
  if (!tokenClient) {
    setupTokenClient()
    if (!tokenClient) { setStatus('error'); return }
  }
  setStatus('connecting')
  try {
    tokenClient.requestAccessToken({ prompt: 'consent' })
  } catch (e) {
    setStatus('error')
  }
}

export function disconnectDrive() {
  if (accessToken && window.google?.accounts?.oauth2) {
    try { window.google.accounts.oauth2.revoke(accessToken, () => {}) } catch (e) {}
  }
  clearToken()
  cachedFileId = null
  setStatus('disconnected')
}

export function isConnected() {
  return !!accessToken && Date.now() < tokenExpiry
}

async function findFile() {
  if (cachedFileId) return cachedFileId
  if (!isConnected()) return null

  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`)
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    const err = await res.text().catch(() => String(res.status))
    throw new Error(`Drive list failed: ${res.status} — ${err}`)
  }
  const data = await res.json()
  const files = data.files || []
  if (files.length > 0) { cachedFileId = files[0].id; return cachedFileId }
  return null
}

async function createFile(jsonContent) {
  const metadata = { name: FILE_NAME, mimeType: 'application/json' }
  const boundary = 'finanzas_bound_3141592'

  // Correct multipart body: no leading CRLF before first boundary
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    jsonContent,
    `--${boundary}--`,
  ].join('\r\n')

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body
    }
  )
  if (!res.ok) {
    const err = await res.text().catch(() => String(res.status))
    throw new Error(`Drive create failed: ${res.status} — ${err}`)
  }
  const data = await res.json()
  cachedFileId = data.id
  return cachedFileId
}

async function updateFile(fileId, jsonContent) {
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: jsonContent
    }
  )
  if (!res.ok) {
    const err = await res.text().catch(() => String(res.status))
    throw new Error(`Drive update failed: ${res.status} — ${err}`)
  }
  return true
}

export async function syncToDrive(data) {
  if (!isConnected()) return false
  setStatus('syncing')

  try {
    const jsonContent = JSON.stringify(data, null, 2)
    const fileId = await findFile()
    if (fileId) {
      await updateFile(fileId, jsonContent)
    } else {
      await createFile(jsonContent)
    }
    setStatus('connected')
    return true
  } catch (e) {
    console.error('Drive sync error:', e)
    setStatus('error')
    return false
  }
}

export async function loadFromDrive() {
  if (!isConnected()) return null

  try {
    const fileId = await findFile()
    if (!fileId) return null

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    console.error('Drive load error:', e)
    return null
  }
}
