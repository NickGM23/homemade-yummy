import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { sendSms } from './sms';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('SMS_DRIVER', 'alphasms');
  vi.stubEnv('ALPHASMS_API_KEY', 'secret-key');
  vi.stubEnv('ALPHASMS_SENDER', 'HomeYummy');
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('sendSms (alphasms driver)', () => {
  it('POSTs the key and message in the body, not in the URL', async () => {
    // реальний формат відповіді AlphaSMS — два рядки
    fetchMock.mockResolvedValue(new Response('id:1589351404\nsms_count:1\n', { status: 200 }));

    await sendSms('380991234567', 'Код: 123456');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.alphasms.ua/api/http.php');
    expect(init.method).toBe('POST');

    const body = init.body as URLSearchParams;
    expect(body.get('key')).toBe('secret-key');
    expect(body.get('command')).toBe('send');
    expect(body.get('from')).toBe('HomeYummy');
    expect(body.get('to')).toBe('380991234567');
    expect(body.get('message')).toBe('Код: 123456');
  });

  it.each(['errors:Wrong login/password', 'errors:Operator not supported'])(
    'throws when the gateway answers HTTP 200 with "%s"',
    async (body) => {
      fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

      await expect(sendSms('380991234567', 'x')).rejects.toThrow('AlphaSMS');
    },
  );

  it('throws on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(new Response('id:1 sms_count:1', { status: 500 }));

    await expect(sendSms('380991234567', 'x')).rejects.toThrow('AlphaSMS');
  });

  it('throws when credentials are not configured', async () => {
    vi.stubEnv('ALPHASMS_API_KEY', '');

    await expect(sendSms('380991234567', 'x')).rejects.toThrow('не налаштовано');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('sendSms (console driver)', () => {
  it('logs instead of calling the gateway', async () => {
    vi.stubEnv('SMS_DRIVER', 'console');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await sendSms('380991234567', 'Код: 123456');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Код: 123456'));
    log.mockRestore();
  });
});
