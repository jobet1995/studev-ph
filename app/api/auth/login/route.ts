import { NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

/**
 * Generates a unique request ID for tracking API requests
 * @returns A unique request ID string
 */
function generateRequestId(): string {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

/**
 * Authenticates a user with email and password, and returns authentication tokens.
 * Verifies user credentials, updates last login timestamp, and generates both access and refresh tokens.
 * @param request - The incoming HTTP request containing email and password in the body
 * @returns A response with user data and authentication tokens, or an error if authentication fails
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user data
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp in the database
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: new Date().toISOString()
    });
    
    // Return user data (without password)
    const { password: userPassword, ...userWithoutPassword } = userData;
    // Verify that password is not exposed in response
    if (userPassword) {
      console.log(`Security check: Password field for user ${userData.email} properly excluded from login response`);
    }
    
    // Generate JWT tokens if available
    let token = null;
    let refreshToken = null;
    try {
      // Dynamically import jsonwebtoken if available
      const jwtModule = await import('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret_key';
      
      // Create payload with user info for access token
      const accessTokenPayload = {
        userId,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        tokenType: 'access' as const
      };
      
      // Create payload with user info for refresh token
      const refreshTokenPayload = {
        userId,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        tokenType: 'refresh' as const
      };
      
      // Sign the tokens with appropriate expirations
      token = jwtModule.default.sign(accessTokenPayload, jwtSecret, { expiresIn: '15m' }); // 15 minutes
      refreshToken = jwtModule.default.sign(refreshTokenPayload, refreshSecret, { expiresIn: '7d' }); // 7 days
    } catch (error: unknown) {
      console.warn('JWT not available, proceeding without token. Install jsonwebtoken for production.', (error as Error).message);
    }
    
    // Construct comprehensive response with standardized format
    const responsePayload = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userId,
          ...userWithoutPassword
        },
        token, // Access token for authentication
        refreshToken, // Refresh token for token renewal
        permissions: ['read', 'write'], // Placeholder for user permissions
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Access token expiration (15 minutes)
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Refresh token expiration (7 days)
      },
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    };
    
    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}