import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

// Define event interface
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  eventType: string;
  description?: string;
  endDate?: string | null;
  capacity?: number | null;
  isVirtual?: boolean;
  registrationUrl?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
 * Type guard to check if object conforms to JwtPayload interface
 * @param {unknown} obj - Object to validate
 * @returns {obj is JwtPayload} True if object matches JwtPayload structure
 * @description Validates that an object has the correct structure for a JWT payload.
 * Checks all required and optional fields with proper TypeScript types.
 */
function isJwtPayload(obj: unknown): obj is JwtPayload {
  if (!obj || typeof obj !== 'object') return false;
  
  const payload = obj as Record<string, unknown>;
  
  return (
    (typeof payload.userId === 'undefined' || typeof payload.userId === 'string') &&
    (typeof payload.email === 'undefined' || typeof payload.email === 'string') &&
    (typeof payload.role === 'undefined' || typeof payload.role === 'string') &&
    (typeof payload.position === 'undefined' || typeof payload.position === 'string') &&
    (typeof payload.exp === 'undefined' || typeof payload.exp === 'number') &&
    (typeof payload.iat === 'undefined' || typeof payload.iat === 'number') &&
    (typeof payload.tokenType === 'undefined' || 
     payload.tokenType === 'access' || 
     payload.tokenType === 'refresh')
  );
}

/**
 * Verifies a JWT token by decoding and validating its claims
 * @param token - The JWT token to verify
 * @returns A promise that resolves to the decoded token payload or null if invalid
 */
/**
 * Verifies a JWT token by decoding and validating its claims
 * @param {string} token - The JWT token to verify
 * @returns {Promise<JwtPayload | null>} A promise that resolves to the decoded token payload or null if invalid
 * @description Attempts to decode a real JWT token and validates its structure and expiration.
 * In production, this should verify the token signature and validate claims against your auth system.
 */
async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    // Validate input token
    if (!token) {
      return null;
    }

    // Decode and validate real JWT token
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return null;
      }

      // Decode the payload segment
      let payloadStr = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // Ensure proper base64 padding
      while (payloadStr.length % 4) {
        payloadStr += '=';
      }
      
      // Parse the JSON payload
      const decodedPayload = JSON.parse(decodeURIComponent(escape(atob(payloadStr))));
      
      // Validate payload structure against JwtPayload interface
      if (isJwtPayload(decodedPayload)) {
        const currentTime = Math.floor(Date.now() / 1000);
        // Check token expiration
        if (!decodedPayload.exp || decodedPayload.exp > currentTime) {
          return decodedPayload;
        } else {
          console.warn('Token has expired');
          return null;
        }
      } else {
        console.warn('Token payload does not match expected structure');
        return null;
      }
    } catch (decodeError: unknown) {
      console.error('Failed to decode JWT token:', decodeError);
      return null;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * GET request handler to fetch all events
 * Verifies admin access and returns event data from Firestore
 * @param {NextRequest} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} JSON response with events data or error
 * @description Requires valid admin token in Authorization header.
 * Fetches all events from Firestore and returns them in standardized format.
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
    console.log('GET - Received token:', token);
    const user: JwtPayload | null = await verifyToken(token);
    console.log('GET - Decoded user:', user);

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

    // Check if user has admin role - using JwtPayload interface
    const userRole: string | undefined = user?.role;
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

    // Fetch all events from Firestore
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

    const eventsCollection = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsCollection);

    const events = eventsSnapshot.docs.map(doc => {
      const eventData = doc.data();
      return {
        id: doc.id,
        title: eventData.title,
        date: eventData.date,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
        endDate: eventData.endDate,
        capacity: eventData.capacity,
        isVirtual: eventData.isVirtual,
        registrationUrl: eventData.registrationUrl,
        imageUrl: eventData.imageUrl,
        createdAt: eventData.createdAt,
        updatedAt: eventData.updatedAt
      };
    });

    return NextResponse.json({
      data: events,
      meta: {
        count: events.length,
        timestamp: new Date().toISOString()
      },
      status: 'success'
    });
  } catch (error) {
    console.error('Error fetching events:', error);
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
 * POST request handler to create a new event
 * Verifies admin access and creates event data in Firestore
 * @param {NextRequest} request - The incoming HTTP request with event data
 * @returns {Promise<NextResponse>} JSON response with created event or error
 * @description Requires valid admin token and validates event data before creation.
 * Supports all event fields including title, date, location, type, and optional metadata.
 */
export async function POST(request: NextRequest) {
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
    const user: JwtPayload | null = await verifyToken(token);

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

    // Check if user has admin role - using JwtPayload interface
    const userRole: string | undefined = user?.role;
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
    const { title, date, location, eventType, description, endDate, capacity, isVirtual, registrationUrl, imageUrl } = body;

    if (!title || !date || !location || !eventType) {
      return NextResponse.json(
        {
          error: {
            message: 'Missing required fields: title, date, location, eventType',
            code: 'BAD_REQUEST',
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes = ['CONFERENCE', 'MEETUP', 'WORKSHOP', 'WEBINAR', 'HACKATHON'];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid event type',
            code: 'BAD_REQUEST',
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Create event in Firestore
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

    const eventsCollection = collection(db, 'events');
    const newEvent = {
      title,
      date,
      location,
      eventType,
      description: description || '',
      endDate: endDate || null,
      capacity: capacity || null,
      isVirtual: isVirtual || false,
      registrationUrl: registrationUrl || null,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(eventsCollection, newEvent);

    return NextResponse.json({
      data: {
        id: docRef.id,
        ...newEvent
      },
      message: 'Event created successfully',
      status: 'success',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
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
 * PUT request handler to update an event
 * Verifies admin access and updates event data in Firestore
 * @param {NextRequest} request - The incoming HTTP request with update data
 * @returns {Promise<NextResponse>} JSON response with update confirmation or error
 * @description Requires valid admin token and validates update data.
 * Only allows updates to whitelisted fields to maintain data integrity.
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
    const user: JwtPayload | null = await verifyToken(token);

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

    // Check if user has admin role - using JwtPayload interface
    const userRole: string | undefined = user?.role;
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
    const { eventId, updates } = body as { eventId: string; updates: Partial<Event> };

    if (!eventId || !updates) {
      return NextResponse.json(
        {
          error: {
            message: 'Event ID and updates are required',
            code: 'BAD_REQUEST',
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Validate updates object
    const allowedFields = [
      'title', 'date', 'location', 'eventType', 'description', 'endDate', 
      'capacity', 'isVirtual', 'registrationUrl', 'imageUrl'
    ];

    const filteredUpdates: Partial<Event> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        (filteredUpdates as Record<string, unknown>)[key] = value;
      }
    }

    // Update event in Firestore
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

    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      data: {
        eventId,
        updates: filteredUpdates
      },
      message: 'Event updated successfully',
      status: 'success',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
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
 * DELETE request handler to delete an event
 * Verifies admin access and deletes event data from Firestore
 * @param {NextRequest} request - The incoming HTTP request with event ID
 * @returns {Promise<NextResponse>} JSON response with deletion confirmation or error
 * @description Requires valid admin token and event ID.
 * Permanently removes the specified event from the database.
 */
export async function DELETE(request: NextRequest) {
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
    const user: JwtPayload | null = await verifyToken(token);

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

    // Check if user has admin role - using JwtPayload interface
    const userRole: string | undefined = user?.role;
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
    const { eventId } = body as { eventId: string };

    if (!eventId) {
      return NextResponse.json(
        {
          error: {
            message: 'Event ID is required',
            code: 'BAD_REQUEST',
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Delete event from Firestore
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

    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);

    return NextResponse.json({
      data: {
        eventId
      },
      message: 'Event deleted successfully',
      status: 'success',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting event:', error);
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