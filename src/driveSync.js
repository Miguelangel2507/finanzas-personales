// ─────────────────────────────────────────────────────────────
// Google Drive sync service
// ─────────────────────────────────────────────────────────────

const CLIENT_ID = '133774864120-3or6hpi12h8pc5e9ttsfuaupniauv4a0.apps.googleusercontent.com'
const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FILE_NAME = 'finanzas-personales-data.json'

let tokenClient = null
let accessToken = null
let tokenExpiry = 0
let cachedFileId = null
let statusCallback = null

function setStatus(s) {
  if (statusCallback) statusCallback(s)
}

export function initDriveSync(onStatusChange) {
  statusCallback = onStatusChange

  // Check if GIS is available
  if (typeof window === 'undefined' || !window.google) {
    // GIS not loaded yet, wait for it
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
    accessToken = null
    tokenExpiry = 0
    localStorage.removeItem('drive_connected')
    setStatus('error')
    return
  }
  accessToken = response.access_token
  tokenExpiry = Date.now() + 3600 * 1000
  localStorage.setItem('drive_connected', '1')
  setStatus('connected')
}

function tryAutoReconnect() {
  const wasConnected = localStorage.getItem('drive_connected')
  if (!wasConnected) {
    setStatus('disconnected')
    return
  }
  if (!tokenClient) {
    setStatus('disconnected')
    return
  }
  setStatus('connecting')
  try {
    // Silent refresh — no prompt
    tokenClient.requestAccessToken({ prompt: '' })
  } catch (e) {
    setStatus('disconnected')
  }
}

export async function connectDrive() {
  if (!tokenClient) {
    // Try to init again
    setupTokenClient()
    if (!tokenClient) {
      setStatus('error')
      return
    }
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
    try {
      window.google.accounts.oauth2.revoke(accessToken, () => {})
    } catch (e) {}
  }
  accessToken = null
  tokenExpiry = 0
  cachedFileId = null
  localStorage.removeItem('drive_connected')
  setStatus('disconnected')
}

export function isConnected() {
  return !!accessToken && Date.now() < tokenExpiry
}

async function findFile() {
  if (cachedFileId) return cachedFileId
  if (!isConnected()) return null

  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`)
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) return null
  const data = await res.json()
  const files = data.files || []
  if (files.length > 0) {
    cachedFileId = files[0].id
    return cachedFileId
  }
  return null
}

async function createFile(jsonContent) {
  const metadata = {
    name: FILE_NAME,
    mimeType: 'application/json'
  }
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const close_delim = `\r\n--${boundary}--`

  const body = delimiter
    + 'Content-Type: application/json\r\n\r\n'
    + JSON.stringify(metadata)
    + delimiter
    + 'Content-Type: application/json\r\n\r\n'
    + jsonContent
    + close_delim

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body
    }
  )
  if (!res.ok) return null
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
  return res.ok
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
