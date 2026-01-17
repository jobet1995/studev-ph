import { NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Define JWT payload interface
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  position: string;
  exp?: number;
  iat?: number;
  tokenType: 'access' | 'refresh'; // Differentiate between access and refresh tokens
  // Add any other expected JWT claims as needed
}

/**
 * Refreshes the user's authentication tokens using a valid refresh token.
 * Verifies the refresh token, validates user status, and generates new access and refresh tokens.
 * Updates the refresh token in the database for security (rotation).
 * @param request - The incoming HTTP request containing the refresh token in the Authorization header
 * @returns A response with new access and refresh tokens, or an error if validation fails
 */
export async function POST(request: Request) {
  try {
    // Extract refresh token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized: Missing or invalid refresh token' },
        { status: 401 }
      );
    }
    

    
    const refreshToken = authHeader.substring(7);
    
    // Verify the refresh JWT token using the same secret as in auth
    let refreshPayload: JwtPayload;
    try {
      const jwtModule = await import('jsonwebtoken');
      const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret_key';
      
      refreshPayload = jwtModule.default.verify(refreshToken, jwtSecret) as JwtPayload;
      
      // Ensure this is a refresh token (not an access token)
      if (refreshPayload.tokenType !== 'refresh') {
        return NextResponse.json(
          { message: 'Invalid token type: Expected refresh token' },
          { status: 401 }
        );
      }
    } catch (error: unknown) {
      console.error('Refresh token verification error:', error);
      return NextResponse.json(
        { message: 'Unauthorized: Invalid or expired refresh token' },
        { status: 401 }
      );
    }
    
    const userId = refreshPayload.userId;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid refresh token' },
        { status: 401 }
      );
    }
    
    // Fetch user data from Firestore to confirm user still exists and is active
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const userData = userSnap.data();
    
    // Check if the user is still active
    if (userData.status !== 'active') {
      return NextResponse.json(
        { message: 'Account is inactive' },
        { status: 401 }
      );
    }
    
    // Generate new access token with shorter expiration (e.g., 15 minutes)
    let newAccessToken = null;
    let newRefreshToken = null;
    
    try {
      const jwtModule = await import('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret_key';
      
      // Create new access token payload
      const accessPayload = {
        userId,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        tokenType: 'access' as const
      };
      
      // Create new refresh token payload (longer expiration)
      const refreshPayloadNew = {
        userId,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        tokenType: 'refresh' as const
      };
      
      // Sign new tokens
      newAccessToken = jwtModule.default.sign(accessPayload, jwtSecret, { expiresIn: '15m' });
      newRefreshToken = jwtModule.default.sign(refreshPayloadNew, refreshSecret, { expiresIn: '7d' }); // 7 days
      
      // Update the refresh token in the database for rotation and security
      await updateDoc(userRef, {
        refreshToken: newRefreshToken, // Store the new refresh token
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Set expiry for the refresh token
      });
      
    } catch (error: unknown) {
      console.error('Token generation error:', error);
      return NextResponse.json(
        { message: 'Error generating new tokens' },
        { status: 500 }
      );
    }
    
    // Return new tokens
    return NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: newAccessToken, // New access token
        refreshToken: newRefreshToken, // New refresh token (optional, for rotation)
        user: {
          id: userId,
          email: refreshPayload.email,
          role: refreshPayload.role,
          position: refreshPayload.position
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    });
    
  } catch (_error: unknown) {
    console.error('Token refresh error:', _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}