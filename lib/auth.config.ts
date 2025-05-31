import { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default {
	providers: [
		GoogleProvider({
			clientId: process.env.AUTH_GOOGLE_ID!,
			clientSecret: process.env.AUTH_GOOGLE_SECRET!,
		})
	],
	secret: process.env.AUTH_SECRET,
	trustHost: true,
	callbacks: {
		async signIn({ user, account, profile }) {
			// Store user in Supabase when they sign in
			try {
				const response = await fetch('/api/auth/store-user', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ user, account, profile })
				});
				return true;
			} catch (error) {
				console.error('Error storing user:', error);
				return true; // Allow sign in even if storage fails
			}
		}
	}
} satisfies NextAuthConfig