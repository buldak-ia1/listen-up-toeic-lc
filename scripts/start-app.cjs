const { spawn } = require('child_process')
const fs = require('fs')

const APP_URL = 'http://127.0.0.1:4173'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BUNDLED_PNPM = 'C:\\Users\\admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\fallback\\pnpm.cmd'

async function isReady() {
  try {
    return (await fetch(APP_URL)).ok
  } catch {
    return false
  }
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await isReady()) return true
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return false
}

async function main() {
  let server
  if (!await isReady()) {
    const pnpm = fs.existsSync(BUNDLED_PNPM) ? BUNDLED_PNPM : 'pnpm.cmd'
    server = spawn(pnpm, ['dev', '--host', '127.0.0.1', '--port', '4173'], { cwd: process.cwd(), stdio: 'inherit', shell: true })
    if (!await waitUntilReady()) throw new Error('앱 서버를 시작하지 못했습니다.')
  }

  const browserCommand = fs.existsSync(CHROME_PATH) ? CHROME_PATH : 'cmd.exe'
  const browserArgs = fs.existsSync(CHROME_PATH) ? [APP_URL] : ['/c', 'start', '', APP_URL]
  spawn(browserCommand, browserArgs, { detached: true, stdio: 'ignore' }).unref()
  console.log(`ListenUp이 열렸습니다: ${APP_URL}`)
  if (!server) process.exit(0)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
