import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';
import { registerPayloadSchema } from '@/server/validation/user';
import { resendVerificationSchema } from '@/server/validation/verification';
import {
  codeSentResponse,
  getClientIp,
  getVerificationForResend,
  startVerification,
} from '@/server/phone-verification';

/** Повторно надсилає код для тієї ж реєстрації (з таймером і лімітами як при першій відправці). */
async function resendCode(req: Request) {
  const { verificationId } = resendVerificationSchema.parse(await req.json());

  const previous = await getVerificationForResend(verificationId, 'REGISTER');
  const payload = registerPayloadSchema.parse(previous.payload);

  const verification = await startVerification({
    phone: payload.phone,
    purpose: 'REGISTER',
    payload,
    ip: getClientIp(req),
  });

  return NextResponse.json(codeSentResponse(verification, payload.phone));
}

export const { POST } = withErrorHandling({ POST: resendCode });
