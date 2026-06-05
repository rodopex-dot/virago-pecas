import { createHmac } from 'crypto'

const SECRET = process.env.CAPTCHA_SECRET || 'virago-captcha-secret-fallback'

export function generateCaptcha(): { question: string; token: string } {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  const expected = a + b
  const hash = createHmac('sha256', SECRET)
    .update(`${a}+${b}=${expected}`)
    .digest('hex')
    .slice(0, 12)
  return {
    question: `Quanto é ${a} + ${b}?`,
    token: `${a}.${b}.${hash}`,
  }
}

export function verifyCaptcha(token: string, answer: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const a = parseInt(parts[0])
    const b = parseInt(parts[1])
    const hash = parts[2]
    if (isNaN(a) || isNaN(b)) return false
    const expected = a + b
    const expectedHash = createHmac('sha256', SECRET)
      .update(`${a}+${b}=${expected}`)
      .digest('hex')
      .slice(0, 12)
    if (hash !== expectedHash) return false
    return parseInt(answer.trim()) === expected
  } catch {
    return false
  }
}
