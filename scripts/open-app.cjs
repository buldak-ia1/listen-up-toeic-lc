const { chromium } = require('C:\\Users\\admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright')

const APP_URL = 'http://127.0.0.1:4173'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

async function openApp() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized'],
  })
  const context = await browser.newContext({ viewport: null })
  const page = await context.newPage()
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' })
  await new Promise((resolve) => browser.on('disconnected', resolve))
}

openApp().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
