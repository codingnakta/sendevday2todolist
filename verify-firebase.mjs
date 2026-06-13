import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

const errors = []
const networkFails = []

page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('requestfailed', req => {
  networkFails.push(`${req.method()} ${req.url()} → ${req.failure()?.errorText}`)
})

console.log('\n--- Step 1: 앱 첫 로딩 ---')
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 })
const url1 = page.url()
const title1 = await page.title()
console.log('URL:', url1)
console.log('Title:', title1)

const hasMockBanner = await page.locator('.mock-banner').isVisible().catch(() => false)
console.log('Mock 배너 표시:', hasMockBanner)

await page.screenshot({ path: 'd:/sendev-firebase/todolist/ss-01-initial.png', fullPage: true })
console.log('스크린샷 저장: ss-01-initial.png')

if (url1.includes('/login')) {
  console.log('\n--- Step 2: 로그인 페이지 확인 → Firebase Auth 연결됨 ---')
  await page.screenshot({ path: 'd:/sendev-firebase/todolist/ss-02-login.png', fullPage: true })

  const loginPage = await page.locator('.auth-container h2').textContent().catch(() => null)
  console.log('로그인 페이지 헤더:', loginPage)

  const registerLink = await page.locator('a[href="/register"]').isVisible().catch(() => false)
  console.log('회원가입 링크 표시:', registerLink)
} else if (url1.includes('/') && !hasMockBanner) {
  console.log('\n--- Step 2: 할 일 목록 페이지 (Firebase 연결, 이미 로그인됨) ---')
} else if (hasMockBanner) {
  console.log('\n--- [경고] Mock 모드 활성화 → .env.local 미반영 ---')
}

console.log('\n--- Step 3: 콘솔 에러 확인 ---')
if (errors.length === 0) {
  console.log('콘솔 에러 없음 ✅')
} else {
  errors.forEach(e => console.log('ERROR:', e))
}

console.log('\n--- Step 4: Firebase 요청 확인 ---')
const firebaseReqs = []
page.on('request', req => {
  if (req.url().includes('firebaseapp.com') || req.url().includes('googleapis.com') || req.url().includes('firebase')) {
    firebaseReqs.push(req.url())
  }
})
await page.reload({ waitUntil: 'networkidle', timeout: 15000 })
if (firebaseReqs.length > 0) {
  console.log(`Firebase 네트워크 요청 감지 (${firebaseReqs.length}건) ✅`)
  firebaseReqs.slice(0, 3).forEach(u => console.log(' -', u.slice(0, 80)))
} else {
  console.log('Firebase 네트워크 요청 없음 (오프라인이거나 Mock 모드)')
}

if (networkFails.length > 0) {
  console.log('\n네트워크 실패:')
  networkFails.forEach(f => console.log(' -', f))
}

await page.screenshot({ path: 'd:/sendev-firebase/todolist/ss-03-final.png', fullPage: true })
console.log('\n최종 스크린샷 저장: ss-03-final.png')

await browser.close()
console.log('\n검증 완료')
