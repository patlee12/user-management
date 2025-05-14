import ProfileCard from '@/components/account/profile-card';
import { ProfileEntity } from '@user-management/types';
import { serverFetchWithCookies } from '@/lib/serverFetchWithCookies';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile: ProfileEntity =
    await serverFetchWithCookies<ProfileEntity>('/user/profile');

  return (
    <main className="h-full w-full bg-background text-foreground p-4 sm:p-8 flex items-center justify-center">
      <ProfileCard profile={profile} />
    </main>
  );
}
