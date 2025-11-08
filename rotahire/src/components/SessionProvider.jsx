'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { userDeetsAtom } from '@/app/state/store';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// Component to sync NextAuth session with Jotai state management
function SessionSync() {
  const { data: session } = useSession();
  const setUserDeets = useSetAtom(userDeetsAtom);

  useEffect(() => {
    if (session?.user?.userDeets) {
      setUserDeets(session.user.userDeets);
    }
  }, [session, setUserDeets]);

  return null;
}

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      <SessionSync />
      {children}
    </NextAuthSessionProvider>
  );
}
