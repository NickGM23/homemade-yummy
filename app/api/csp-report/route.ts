import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';

// Dev-інструмент: збирає звіти Content-Security-Policy-Report-Only у лог сервера, поки політика
// налаштовується (див. `report-uri` у next.config.mjs). Публічний і без ліміту, тому в production
// вимкнений — видалити разом із `report-uri`, коли політику буде переведено в блокуючий режим.
async function receiveReport(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }

  const raw = await req.text();

  try {
    const report = JSON.parse(raw)['csp-report'] ?? {};
    console.warn(
      '[CSP]',
      report['violated-directive'],
      '<-',
      report['blocked-uri'] || '(inline/eval)',
      '| page:',
      report['document-uri'],
      report['source-file'] ? `| source: ${report['source-file']}` : '',
    );
  } catch {
    console.warn('[CSP] unparseable report', raw.slice(0, 300));
  }

  return new NextResponse(null, { status: 204 });
}

export const { POST } = withErrorHandling({ POST: receiveReport });
