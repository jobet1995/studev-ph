import { NextResponse } from 'next/server';
import { db, storage } from '@/firebase.config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Define JWT payload interface
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  position: string;
  exp?: number;
  iat?: number;
  // Add any other expected JWT claims as needed
}

// Define User data interface
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  profilePicture?: string;
  coverPhoto?: string;
  phoneNumber?: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Generates a unique request ID for tracking API requests
 * @returns A unique request ID string
 */
function generateRequestId(): string {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

/**
 * Retrieves the authenticated user's profile information
 * Verifies the user's authentication token and returns their profile data
 * @param request - The incoming HTTP request with authorization header
 * @returns A response containing the user's profile data or an error if unauthorized
 */
export async function GET(request: Request) {
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
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection unavailable' },
        { status: 500 }
      );
    }
    
    // Fetch user data from Firestore
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const userData = userSnap.data() as UserData;
    
    // Return user data without destructuring password since it shouldn't be in profile data
    return NextResponse.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: userId,
          ...userData
        }
      },
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    });
    
  } catch (error: unknown) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Updates the authenticated user's profile information
 * Verifies the user's authentication token and updates their profile data
 * Handles both text fields and file uploads (avatar, cover photo)
 * @param request - The incoming HTTP request with authorization header and form data
 * @returns A response indicating success or failure of the profile update
 */
export async function PUT(request: Request) {
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
    
    // Parse form data to handle file uploads
    // Limit the size of the form data to prevent large payloads
    const contentLength = Number(request.headers.get('content-length'));
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { message: 'Request entity too large. Maximum allowed size is 10MB.' },
        { status: 413 }
      );
    }
    
    const formData = await request.formData();
    
    // Get text fields from form data
    const firstName = formData.get('firstName') as string | null;
    const lastName = formData.get('lastName') as string | null;
    const email = formData.get('email') as string | null;
    const position = formData.get('position') as string | null;
    const role = formData.get('role') as string | null;
    const bio = formData.get('bio') as string | null;
    const timezone = formData.get('timezone') as string | null;
    const language = formData.get('language') as string | null;
    
    // Get file fields
    const avatarFile = formData.get('avatar') as File | null;
    const coverPhotoFile = formData.get('coverPhoto') as File | null;
    
    // Validate file sizes
    if (avatarFile && avatarFile.size > 5 * 1024 * 1024) { // 5MB limit for avatar
      return NextResponse.json(
        { message: 'Avatar file size too large. Maximum allowed size is 5MB.' },
        { status: 400 }
      );
    }
    
    if (coverPhotoFile && coverPhotoFile.size > 10 * 1024 * 1024) { // 10MB limit for cover photo
      return NextResponse.json(
        { message: 'Cover photo file size too large. Maximum allowed size is 10MB.' },
        { status: 400 }
      );
    }
    
    // Fields that can be updated
    const filteredUpdateData: DocumentData = {};
    
    // Add text fields to update data
    if (firstName !== null) filteredUpdateData.firstName = firstName;
    if (lastName !== null) filteredUpdateData.lastName = lastName;
    if (email !== null) filteredUpdateData.email = email;
    if (position !== null) filteredUpdateData.position = position;
    if (role !== null) filteredUpdateData.role = role;
    if (bio !== null) filteredUpdateData.bio = bio;
    if (timezone !== null) filteredUpdateData.timezone = timezone;
    if (language !== null) filteredUpdateData.language = language;
    
    // Variables to hold the URLs after upload
    let avatarUrl: string | undefined;
    let coverPhotoUrl: string | undefined;
    
    // Handle avatar upload if present
    if (avatarFile) {
      try {
        // Check if storage is available
        if (!storage) {
          return NextResponse.json(
            { message: 'Storage service unavailable' },
            { status: 500 }
          );
        }
        
        const fileName = `avatars/${userId}_${Date.now()}_${avatarFile.name}`;
        const storageRef = ref(storage, fileName);
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await avatarFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Upload to Firebase Storage
        await uploadBytes(storageRef, uint8Array, { contentType: avatarFile.type });
        avatarUrl = await getDownloadURL(storageRef);
        
        // Add to update data
        filteredUpdateData.profilePicture = avatarUrl;
      } catch (uploadErr: unknown) {
        console.error('Error uploading avatar to Firebase Storage:', uploadErr);
        return NextResponse.json(
          { message: `Failed to upload avatar: ${(uploadErr as Error).message || 'Upload failed'}` },
          { status: 500 }
        );
      }
    }
    
    // Handle cover photo upload if present
    if (coverPhotoFile) {
      try {
        // Check if storage is available
        if (!storage) {
          return NextResponse.json(
            { message: 'Storage service unavailable' },
            { status: 500 }
          );
        }
        
        const fileName = `covers/${userId}_${Date.now()}_${coverPhotoFile.name}`;
        const storageRef = ref(storage, fileName);
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await coverPhotoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Upload to Firebase Storage
        await uploadBytes(storageRef, uint8Array, { contentType: coverPhotoFile.type });
        coverPhotoUrl = await getDownloadURL(storageRef);
        
        // Add to update data
        filteredUpdateData.coverPhoto = coverPhotoUrl;
      } catch (uploadErr: unknown) {
        console.error('Error uploading cover photo to Firebase Storage:', uploadErr);
        return NextResponse.json(
          { message: `Failed to upload cover photo: ${(uploadErr as Error).message || 'Upload failed'}` },
          { status: 500 }
        );
      }
    }
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection unavailable' },
        { status: 500 }
      );
    }
    
    // Update user data in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, filteredUpdateData);
    
    // Fetch updated user data
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as UserData;
    
    // Return updated user data without destructuring password since it shouldn't be in profile data
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: userId,
          ...userData
        }
      },
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    });
    
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: `Internal server error: ${(error as Error).message || 'Update failed'}` },
      { status: 500 }
    );
  }
}