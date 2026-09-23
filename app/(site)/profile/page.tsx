import { prisma } from '@/server/prisma';
import { ProfileForm } from '@/components/shared';
import { getUserSession } from '@/server/get-user-session';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    return redirect('/not-auth');
  }

  console.log('profile_page_tsx - session');
  console.log(session);
  const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

  if (!user) {
    return redirect('/not-auth');
  }

  return <ProfileForm data={user} />;
}
