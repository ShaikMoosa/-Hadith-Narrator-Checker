import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"
// import Nodemailer from "next-auth/providers/nodemailer"
// import { createTransport } from "nodemailer"
// import { text } from "@/lib/authSendRequest"
// import { VerificationEmail } from "@/components/email/VerificationEmail"
// import { render } from '@react-email/render';


// Extend the Session type to include supabaseAccessToken
declare module 'next-auth' {
	interface Session {
		supabaseAccessToken?: string
	}
}

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth(authConfig)