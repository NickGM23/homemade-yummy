import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const users = await prisma.user.findMany();

  return NextResponse.json(users);
}

//export async function GET(request: Request) {
//  redirect('https://google.com/');
//}

// export async function POST(req: NextRequest) {
//   const data = await req.json();

//   const user = await prisma.user.create({
//     data,
//   });

//   return NextResponse.json(user);
// }
