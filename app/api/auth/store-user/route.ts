import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { user, account, profile } = await request.json()
		
		console.log('Storing user in database:', {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image
		})

		// For now, just log the user data
		// We'll implement actual Supabase storage once basic auth is stable
		
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error storing user:', error)
		return NextResponse.json({ error: 'Failed to store user' }, { status: 500 })
	}
} 