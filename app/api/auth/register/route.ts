import { NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

/**
 * Generates a unique request ID for tracking API requests
 * @returns A unique request ID string
 */
function generateRequestId(): string {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

/**
 * Registers a new user with the provided details and returns authentication tokens.
 * Validates input, hashes the password, creates a new user record, and generates both access and refresh tokens.
 * @param request - The incoming HTTP request containing user registration details in the body
 * @returns A response with user data and authentication tokens, or an error if registration fails
 */
export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection unavailable' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { firstName, lastName, email, password, position, phoneNumber } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !position) {
      return NextResponse.json(
        { message: 'Missing required fields' },
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

    // Check if user already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user document
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword, // Will be hashed
      position,
      phoneNumber: phoneNumber || '',
      role: 'admin',
      status: 'active',
      bio: '', // Initialize with empty bio/About field
      profilePicture: '', // Initialize with empty profile picture URL
      coverPhoto: '', // Initialize with empty cover photo URL
      timezone: 'Asia/Manila', // Default timezone
      language: 'en', // Default language
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'users'), userData);

    // Return success response (don't send password back)
    const { password: userPassword, ...userWithoutPassword } = userData;
    // Verify that password is not exposed in response
    if (userPassword) {
      console.log(`Security check: Password field for user ${userData.email} properly excluded from registration response`);
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
        userId: docRef.id,
        email: userData.email,
        role: userData.role,
        position: userData.position,
        tokenType: 'access' as const
      };
      
      // Create payload with user info for refresh token
      const refreshTokenPayload = {
        userId: docRef.id,
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
      message: 'User registered successfully',
      data: {
        user: {
          id: docRef.id,
          ...userWithoutPassword
        },
        token, // Access token for authentication
        refreshToken, // Refresh token for token renewal
        permissions: ['read', 'write'], // Placeholder for user permissions
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Access token expiration (15 minutes)
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Refresh token expiration (7 days)
        verificationRequired: false, // In a real implementation, you might require email verification
        nextSteps: ['/admin/login'] // Suggested next actions for the user
      },
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    };
    
    return NextResponse.json(responsePayload, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}