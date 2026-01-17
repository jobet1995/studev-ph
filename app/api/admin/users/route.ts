import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Define user interface
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  phoneNumber?: string;
  role: string;
  status: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  lastLogin?: string;
}

interface JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
  position?: string;
  exp?: number;
  iat?: number;
  tokenType?: 'access' | 'refresh';
}

/**
 * Verifies a JWT token by decoding and validating its claims
 * @param token - The JWT token to verify
 * @returns A promise that resolves to the decoded token payload or null if invalid
 */
async function verifyToken(token: string) {
  try {
    // For now, we'll just check if the token exists and is valid
    // In a production app, you would properly decode and verify the JWT
    if (!token) {
      return null;
    }

    // Basic token validation - check if it has the expected format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload to check for expiration and other claims
    // Replace '-' with '+' and '_' with '/' for base64url decoding
    let payloadStr = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Ensure proper padding
    while (payloadStr.length % 4) {
      payloadStr += '=';
    }

    let payload: JwtPayload;
    try {
      payload = JSON.parse(decodeURIComponent(escape(atob(payloadStr))));
    } catch (decodeError) {
      console.error('Error decoding JWT payload:', decodeError);
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      return null; // Token expired
    }

    return payload; // Return the decoded payload
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * GET request handler to fetch all users
 * Verifies admin access and returns user data
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized: Missing or invalid token',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized: Invalid token',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = user?.role;
    if (!userRole || !['Administrator', 'SuperAdmin'].includes(userRole)) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized: Insufficient permissions',
            code: 'FORBIDDEN',
            timestamp: new Date().toISOString()
          }
        },
        { status: 403 }
      );
    }

    // Fetch all users from Firestore
    if (!db) {
      return NextResponse.json(
        {
          error: {
            message: 'Database connection failed',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
          }
        },
        { status: 500 }
      );
    }

    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);

    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        position: userData.position,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        status: userData.status,
        bio: userData.bio,
        profilePicture: userData.profilePicture,
        coverPhoto: userData.coverPhoto,
        timezone: userData.timezone,
        language: userData.language,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin
      };
    });

    return NextResponse.json({
      data: users,
      meta: {
        count: users.length,
        timestamp: new Date().toISOString()
      },
      status: 'success'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

/**
 * PUT request handler to update a user
 * Verifies admin access and updates user data
 */
export async function PUT(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized: Missing or invalid token',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized: Invalid token',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = user?.role;
    if (!userRole || !['Administrator', 'SuperAdmin'].includes(userRole)) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized: Insufficient permissions',
            code: 'FORBIDDEN',
            timestamp: new Date().toISOString()
          }
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId, updates } = body as { userId: string; updates: Partial<User> };

    if (!userId || !updates) {
      return NextResponse.json(
        {
          error: {
            message: 'User ID and updates are required',
            code: 'BAD_REQUEST',
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Validate updates object
    const allowedFields = [
      'email', 'firstName', 'lastName', 'position', 'phoneNumber', 
      'role', 'status', 'bio', 'timezone', 'language'
    ];

    const filteredUpdates: Partial<User> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        (filteredUpdates as Record<string, unknown>)[key] = value;
      }
    }

    // Update user in Firestore
    if (!db) {
      return NextResponse.json(
        {
          error: {
            message: 'Database connection failed',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
          }
        },
        { status: 500 }
      );
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, filteredUpdates);

    return NextResponse.json({
      data: {
        userId,
        updates: filteredUpdates
      },
      message: 'User updated successfully',
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}