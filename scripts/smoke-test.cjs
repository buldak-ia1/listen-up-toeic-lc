const { chromium } = require('C:\\Users\\admin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright')
const path = require('path')

const APP_URL = 'http://127.0.0.1:4173'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
let activeBrowser

async function capture(page, filename) {
  try {
    await page.screenshot({ path: path.join(process.env.TEMP, filename), fullPage: true })
  } catch (error) {
    console.warn(`optional screenshot skipped: ${error.message}`)
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH })
  activeBrowser = browser
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(7000)
  const errors = []
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
  page.on('requestfailed', (request) => errors.push(`request: ${request.url()} (${request.failure()?.errorText})`))

  await page.goto(APP_URL, { waitUntil: 'networkidle' })
  console.log('home loaded')
  await capture(page, 'listenup-qa-home.png')
  if (await page.title() !== 'ListenUp — TOEIC LC') throw new Error('Unexpected title')
  if (await page.locator('.part-card').count() !== 4) throw new Error('Part cards missing')

  await page.getByRole('button', { name: '문제 풀기' }).click()
  await page.locator('.setup-controls select').nth(0).selectOption('2')
  await page.locator('.setup-controls select').nth(1).selectOption('1')
  await page.locator('.setup-controls select').nth(2).selectOption('6')
  await page.getByLabel('문제 순서').selectOption('random')
  await page.getByRole('button', { name: /이 설정으로 시작/ }).click()
  await page.locator('.practice-shell').waitFor()
  if (!await page.getByText('랜덤 순서').isVisible()) throw new Error('Random shuffle mode missing')
  if (!String(await page.locator('.photo-frame img').getAttribute('src')).includes('/images/test2/')) throw new Error('Test 2 Part 1 photo missing')
  await page.locator('.answer-list button').first().click()
  await page.locator('.feedback-panel').waitFor()
  console.log('practice feedback loaded')
  if (await page.locator('.transcript-panel').count() !== 1) throw new Error('Transcript feedback missing')

  for (let index = 0; index < 6; index += 1) {
    if (index > 0) await page.locator('.answer-list button').first().click()
    await page.locator('.practice-footer .primary-button').click()
  }
  await page.locator('.result-screen').waitFor()
  console.log('result loaded')
  if (await page.locator('.answer-grid button').count() !== 6) throw new Error('Result answer map missing')
  await page.locator('.answer-grid button').first().click()
  await page.locator('.result-review').waitFor()

  await page.goto(APP_URL, { waitUntil: 'networkidle' })
  await page.locator('.nav-item').filter({ hasText: '문제 풀기' }).click()
  await page.locator('.setup-controls select').nth(0).selectOption('10')
  await page.locator('.mode-card').filter({ hasText: '실전 모드' }).click()
  await page.locator('.practice-shell.exam').waitFor()
  console.log('exam loaded')
  if (!await page.getByText('1 / 100').isVisible()) throw new Error('Exam question count missing')
  if (!await page.getByText(/TEST 10/).first().isVisible()) throw new Error('Test 10 exam selection missing')
  if (await page.locator('.audio-player.locked').count() !== 1) throw new Error('Exam audio lock missing')

  for (const label of ['오답 노트', '리스닝 랩', '학습 통계']) {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' })
    await page.locator('.nav-item').filter({ hasText: label }).click()
    await page.waitForTimeout(150)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(APP_URL, { waitUntil: 'networkidle' })
  await capture(page, 'listenup-qa-mobile.png')
  if (!await page.getByRole('button', { name: '메뉴 열기' }).isVisible()) throw new Error('Mobile menu missing')

  await browser.close()
  if (errors.length) throw new Error(errors.join('\n'))
  console.log('Smoke test passed: home, practice, feedback, result, exam, notes, lab, stats, mobile')
}

run().catch((error) => {
  console.error(error)
  activeBrowser?.close().catch(() => {})
  process.exitCode = 1
})
