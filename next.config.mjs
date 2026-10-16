const isDev = process.env.NODE_ENV !== 'production';

const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

// Content-Security-Policy у блокуючому режимі. Якщо після додавання нового зовнішнього сервісу
// (скрипти, API, iframe, картинки) щось перестало працювати — браузер пише в консоль, який
// саме origin заблоковано і за якою директивою; додайте його в список нижче.
//
// 'unsafe-inline' у script-src потрібен, бо Next.js вставляє інлайнові скрипти (hydration,
// JSON-LD). Nonce через middleware зробив би всі сторінки динамічними і зламав ISR/prerender.
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    // Next dev (HMR/React Refresh) використовує eval; у production не потрібен.
    ...(isDev ? ["'unsafe-eval'"] : []),
    // Firebase Auth (gapi) + reCAPTCHA для OTP у checkout.
    'https://apis.google.com',
    'https://www.google.com',
    'https://www.gstatic.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://www.gstatic.com'],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    // Іконки провайдерів в auth-modal + картинки reCAPTCHA.
    'https://github.githubassets.com',
    'https://fonts.gstatic.com',
    'https://www.gstatic.com',
    'https://www.google.com',
  ],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://www.googleapis.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    // HMR websocket у dev.
    ...(isDev ? ['ws://localhost:*'] : []),
  ],
  'frame-src': [
    'https://www.google.com', // reCAPTCHA
    ...(firebaseAuthDomain ? [`https://${firebaseAuthDomain}`] : []),
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

const csp = Object.entries(cspDirectives)
  .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
  .join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Без includeSubDomains/preload: вони зачіпають усі піддомени і майже не скасовуються.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'Content-Security-Policy', value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
