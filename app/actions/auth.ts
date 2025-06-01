'use server'

import { signIn, signOut } from "@/lib/auth"

export async function handleSignIn() {
	// Use Google provider for sign-in and redirect to app
	await signIn("google", { redirectTo: "/app" })
	//redirect to app
	// redirect("/app")
	// await signIn("nodemailer", { redirectTo: "/app" })
}

export async function handleSignOut() {
	await signOut({ redirectTo: "/" })
} 