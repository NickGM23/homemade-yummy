import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/server/withErrorHandling';
import { createOrderSchema } from '@/server/validation/order';
import {
  getClientIp,
  getVerificationForResend,
  startVerification,
} from '@/server/phone-verification';
import { maskPhone } from '@/server/phone';

const resendSchema = z.object({ verificationId: z.string().uuid() });

/** Повторно надсилає код для тієї ж чернетки замовлення (з таймером і лімітами як при першій відправці). */
async function resendCode(req: Request) {
  const { verificationId } = resendSchema.parse(await req.json());

  const previous = await getVerificationForResend(verificationId, 'ORDER');
  const data = createOrderSchema.parse(previous.payload);

  const verification = await startVerification({
    phone: data.phone,
    purpose: 'ORDER',
    payload: data,
    ip: getClientIp(req),
  });

  return NextResponse.json({
    status: 'code_sent',
    verificationId: verification.id,
    maskedPhone: maskPhone(data.phone),
    expiresAt: verification.expiresAt,
    resendAvailableAt: verification.resendAvailableAt,
  });
}

export const { POST } = withErrorHandling({ POST: resendCode });
