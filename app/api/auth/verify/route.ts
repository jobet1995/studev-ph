import { NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { doc, getDoc } from 'firebase/firestore';

// Define JWT payload interface
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  position: string;
  exp?: number;
  iat?: number;
  tokenType?: 'access' | 'refresh'; // Differentiate between access and refresh tokens
  // Add any other expected JWT claims as needed
}

/**
 * Verifies the authenticity and validity of an access token.
 * Checks if the token is valid, not expired, and belongs to an active user account.
 * @param request - The incoming HTTP request containing the access token in the Authorization header
 * @returns A response indicating whether the token is valid, along with user information if valid
 */
export async function POST(request: Request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    // Verify the JWT token using the same secret as in auth
    let payload: JwtPayload;
    try {
      const jwtModule = await import('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      
      payload = jwtModule.default.verify(token, jwtSecret) as JwtPayload;
      
      // Ensure this is an access token (not a refresh token)
      if (payload.tokenType && payload.tokenType === 'refresh') {
        return NextResponse.json(
          { message: 'Invalid token type: Expected access token, got refresh token' },
          { status: 401 }
        );
      }
    } catch (error: unknown) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { message: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const userId = payload.userId;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    // Fetch user data from Firestore to confirm user still exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: userId,
        email: payload.email,
        role: payload.role,
        position: payload.position
      }
    });
    
  } catch (error: unknown) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}