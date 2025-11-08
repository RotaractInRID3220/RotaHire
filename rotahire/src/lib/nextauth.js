import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '@/lib/supabaseClient';
import { getUserByUsername, verifyPassword } from '@/services/dbmidService';

// NextAuth configuration for admin authentication
// Uses DBMID API for credential verification and Supabase for permission levels
export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },

      // Authorize admin user via DBMID API and check Supabase permissions
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required');
        }

        try {
          // Fetch user from DBMID API using shared service
          const user = await getUserByUsername(credentials.username);

          if (!user) {
            throw new Error('Invalid username or password');
          }

          // Verify MD5 password hash using shared service
          if (!verifyPassword(credentials.password, user.m_password)) {
            throw new Error('Invalid username or password');
          }

          // Determine admin access based on role_id
          // Roles 1-4: Chairperson (1), MAL (2), Board Member (3), Club Member (4)
          const hasAdminAccess = [1, 2, 3, 4].includes(user.role_id);
          const hasPortalAccess = [1, 2, 3, 4, 5, 6].includes(user.role_id);

          if (!hasAdminAccess) {
            throw new Error('Your account does not have admin access');
          }

          // Fetch permission level from Supabase permissions table
          const { data: permissionData, error: permError } = await supabase
            .from('permissions')
            .select('permission_level')
            .eq('rmis_id', user.membership_id)
            .eq('is_active', true)
            .single();

          const permissionLevel = permissionData?.permission_level || 'basic';

          // Return user object without password
          return {
            id: user.membership_id,
            email: user.m_username,
            name: user.card_name,
            role_id: user.role_id,
            hasAdminAccess,
            hasPortalAccess,
            permission_level: permissionLevel,
            userDeets: {
              m_id: user.m_id,
              membership_id: user.membership_id,
              m_username: user.m_username,
              card_name: user.card_name,
              role_id: user.role_id,
              club_id: user.club_id,
              status: user.status
            }
          };
        } catch (error) {
          console.error('[NextAuth Admin] Authorization error:', error.message);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],

  // Callbacks for JWT and session management
  callbacks: {
    // JWT callback - store user data in token
    async jwt({ token, user }) {
      if (user) {
        token.role_id = user.role_id;
        token.hasAdminAccess = user.hasAdminAccess;
        token.hasPortalAccess = user.hasPortalAccess;
        token.permission_level = user.permission_level;
        token.userDeets = user.userDeets;
      }
      return token;
    },

    // Session callback - add token data to session
    async session({ session, token }) {
      if (session.user) {
        session.user.role_id = token.role_id;
        session.user.hasAdminAccess = token.hasAdminAccess;
        session.user.hasPortalAccess = token.hasPortalAccess;
        session.user.permission_level = token.permission_level;
        session.user.userDeets = token.userDeets;
      }
      return session;
    }
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60 // Update every hour
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60
  },

  // NextAuth URL and secret
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  }
};

export default authOptions;