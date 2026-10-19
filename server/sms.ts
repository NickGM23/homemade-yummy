// Відправка SMS через AlphaSMS (https://docs.alphasms.ua/ru/api/http/send_sms/).
// Локально (без ключа) використовується драйвер `console`, що просто друкує повідомлення в лог.

const ALPHASMS_URL = 'https://api.alphasms.ua/api/http.php';
const REQUEST_TIMEOUT_MS = 10_000;

type SmsDriver = 'alphasms' | 'console';

export function getSmsDriver(): SmsDriver {
  const configured = process.env.SMS_DRIVER;
  if (configured === 'alphasms' || configured === 'console') return configured;
  return process.env.NODE_ENV === 'production' ? 'alphasms' : 'console';
}

async function sendViaAlphaSms(to: string, message: string): Promise<void> {
  const key = process.env.ALPHASMS_API_KEY;
  const from = process.env.ALPHASMS_SENDER;
  if (!key || !from) {
    throw new Error('ALPHASMS_API_KEY / ALPHASMS_SENDER не налаштовано');
  }

  // POST + тіло форми, щоб ключ не потрапляв у query-рядок (а отже — у логи).
  const res = await fetch(ALPHASMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ version: 'http', key, command: 'send', from, to, message }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const text = (await res.text()).trim();

  // Успіх: `id:84523377 sms_count:1`. Помилка: `errors:...` (документація не перелічує коди).
  if (!res.ok || !/^id:\s*\d+/.test(text)) {
    throw new Error(`AlphaSMS: ${res.status} ${text.slice(0, 200)}`);
  }
}

/**
 * @param to телефон у форматі 380XXXXXXXXX
 * @throws якщо шлюз недоступний/відхилив повідомлення
 */
export async function sendSms(to: string, message: string): Promise<void> {
  if (getSmsDriver() === 'console') {
    console.log(`[SMS:console] -> +${to}: ${message}`);
    return;
  }

  await sendViaAlphaSms(to, message);
}
