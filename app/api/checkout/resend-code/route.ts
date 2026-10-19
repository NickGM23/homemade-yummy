import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';
import { createOrderSchema } from '@/server/validation/order';
import {
  codeSentResponse,
  getClientIp,
  getVerificationForResend,
  startVerification,
} from '@/server/phone-verification';
import { resendVerificationSchema } from '@/server/validation/verification';

/** Повторно надсилає код для тієї ж чернетки замовлення (з таймером і лімітами як при першій відправці). */
async function resendCode(req: Request) {
  const { verificationId } = resendVerificationSchema.parse(await req.json());

  const previous = await getVerificationForResend(verificationId, 'ORDER');
  const data = createOrderSchema.parse(previous.payload);

  const verification = await startVerification({
    phone: data.phone,
    purpose: 'ORDER',
    payload: data,
    ip: getClientIp(req),
  });

  return NextResponse.json(codeSentResponse(verification, data.phone));
}

export const { POST } = withErrorHandling({ POST: resendCode });
