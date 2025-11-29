const fs = require('fs')
const path = require('path')
const https = require('https')

const API_BASE = process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:3000/api'
const PROJECT_ROOT = path.resolve(__dirname, '..')

function fetchBranding() {
  const url = API_BASE.replace(/\/api$/i, '') + '/api/mobile/branding'
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve((json && json.branding) || {})
          } catch (e) {
            resolve({})
          }
        })
      })
      .on('error', reject)
  })
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          return download(response.headers.location, dest).then(resolve).catch(reject)
        }
        response.pipe(file)
        file.on('finish', () => file.close(() => resolve()))
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err))
      })
  })
}

async function run() {
  const branding = await fetchBranding()
  const assetsDir = path.join(PROJECT_ROOT, 'assets', 'branding')
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

  let iconPath
  let splashPath

  if (branding.iconUrl) {
    const dest = path.join(assetsDir, 'icon.png')
    try { await download(branding.iconUrl, dest) } catch {}
    if (fs.existsSync(dest)) iconPath = './assets/branding/icon.png'
  }

  if (branding.logoUrl) {
    const dest = path.join(assetsDir, 'splash.png')
    try { await download(branding.logoUrl, dest) } catch {}
    if (fs.existsSync(dest)) splashPath = './assets/branding/splash.png'
  }

  const appJsonPath = path.join(PROJECT_ROOT, 'app.json')
  const raw = fs.readFileSync(appJsonPath, 'utf8')
  const app = JSON.parse(raw)

  if (branding.mobileAppName) {
    app.expo.name = branding.mobileAppName
  }
  if (iconPath) {
    app.expo.icon = iconPath
    app.expo.android = app.expo.android || {}
    app.expo.android.adaptiveIcon = app.expo.android.adaptiveIcon || {}
    app.expo.android.adaptiveIcon.foregroundImage = iconPath
  }
  if (splashPath) {
    app.expo.splash = app.expo.splash || {}
    app.expo.splash.image = splashPath
    app.expo.splash.resizeMode = app.expo.splash.resizeMode || 'contain'
    app.expo.splash.backgroundColor = app.expo.splash.backgroundColor || '#ffffff'
  }

  fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2))
  console.log('Branding assets applied to app.json')
}

run().catch((e) => {
  console.error('Branding assets script failed:', e)
  process.exit(1)
})


