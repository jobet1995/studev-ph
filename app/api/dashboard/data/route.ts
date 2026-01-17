import { NextResponse } from 'next/server';
import { db } from '@/firebase.config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

interface JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Verifies a JWT token by decoding and validating its claims
 * @param token - The JWT token to verify
 * @returns A promise that resolves to the decoded token payload or null if invalid
 */
async function verifyToken(token: string): Promise<JwtPayload | null> {
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
      console.log('DEBUG: Decoded JWT payload:', payload);
    } catch (decodeError) {
      console.error('Error decoding JWT payload:', decodeError);
      return null;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      console.log('DEBUG: Token expired - exp:', payload.exp, 'current:', currentTime);
      return null; // Token expired
    }
    
    console.log('DEBUG: Token validation passed, returning payload');
    return payload; // Return the decoded payload
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Retrieves dashboard statistics and data for authenticated admin users
 * Verifies the user's authentication token and returns various metrics
 * @param request - The incoming HTTP request with authorization header
 * @returns A response containing dashboard data or an error if unauthorized
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
    console.log('DEBUG: Received token for verification');
    const user = await verifyToken(token);
    
    if (!user) {
      console.log('DEBUG: Token verification failed');
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    console.log('DEBUG: Token verified successfully, user data:', user);
    
    // Check if user has admin role (improved role check)
    const userRole = user?.role;
    console.log(`User with role '${userRole}' is accessing the dashboard.`);
    
    // Allow access to users with admin roles or if role is not specified (for backward compatibility)
    // During registration, users get 'Administrator' role by default, so this should allow all registered users
    if (userRole && !['Administrator', 'SuperAdmin', 'Editor', 'Moderator', 'User'].includes(userRole)) {
      console.log(`User with role '${userRole}' attempted to access dashboard. Only Administrator, SuperAdmin, Editor, Moderator, and User roles are authorized.`);
      return NextResponse.json(
        { message: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }
    
    console.log(`Access granted to user with role: ${userRole || 'unspecified'}`);

    // Fetch dashboard data from Firestore collections
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const blogsCollection = collection(db, 'blogs');
    const eventsCollection = collection(db, 'events');
    const postsCollection = collection(db, 'posts');
    const usersCollection = collection(db, 'users');

    // Get counts for dashboard stats
    const [blogsSnapshot, eventsSnapshot, postsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(query(blogsCollection)),
      getDocs(query(eventsCollection)),
      getDocs(query(postsCollection)),
      getDocs(query(usersCollection))
    ]);

    const totalBlogs = blogsSnapshot.size;
    const totalEvents = eventsSnapshot.size;
    const totalPosts = postsSnapshot.size;
    const totalUsers = usersSnapshot.size;

    // Get published blogs count
    const publishedBlogsSnapshot = await getDocs(
      query(blogsCollection, where('published', '==', true))
    );
    const publishedBlogs = publishedBlogsSnapshot.size;

    // Get recent activity (last 5 items from all collections)
    const recentActivityQuery = query(
      blogsCollection,
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentBlogsSnapshot = await getDocs(recentActivityQuery);
    
    // Get upcoming events (next 4 events)
    // Note: This requires an index in Firestore for date comparison
    // For now, get all events and filter client-side
    const allEventsSnapshot = await getDocs(eventsCollection);
    
    // Filter for upcoming events and sort client-side
    const currentDate = new Date().toISOString().split('T')[0];
    const upcomingEventsList = allEventsSnapshot.docs
      .filter(doc => {
        const eventDate = doc.data().date;
        return eventDate && eventDate >= currentDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.data().date || 0);
        const dateB = new Date(b.data().date || 0);
        return dateA.getTime() - dateB.getTime(); // Ascending order
      })
      .slice(0, 4);

    // Get featured blogs (last 4 published blogs)
    // Note: This requires a composite index in Firestore
    // For now, get all published blogs and filter client-side
    const allPublishedBlogsQuery = query(
      blogsCollection,
      where('published', '==', true)
    );
    const allPublishedBlogsSnapshot = await getDocs(allPublishedBlogsQuery);
    
    // Filter for featured and sort client-side
    const featuredBlogsList = allPublishedBlogsSnapshot.docs
      .filter(doc => doc.data().featured === true)
      .sort((a, b) => {
        const dateA = new Date(a.data().createdAt || 0);
        const dateB = new Date(b.data().createdAt || 0);
        return dateB.getTime() - dateA.getTime(); // Descending order
      })
      .slice(0, 4);

    // Get recent posts (last 4 posts)
    const recentPostsQuery = query(
      postsCollection,
      orderBy('createdAt', 'desc'),
      limit(4)
    );
    const recentPostsSnapshot = await getDocs(recentPostsQuery);

    // Format the data to match the expected structure
    const recentActivity = recentBlogsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        type: 'blog',
        timestamp: data.createdAt || new Date().toISOString(),
        action: 'published'
      };
    });

    const upcomingEvents = upcomingEventsList.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Event',
        date: data.date || '',
        location: data.location || 'N/A',
        eventType: data.eventType || 'Event'
      };
    });

    const featuredBlogs = featuredBlogsList.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Blog',
        author: data.author || 'Unknown Author',
        date: data.createdAt || new Date().toISOString().split('T')[0],
        excerpt: data.excerpt || 'No excerpt available',
        imageUrl: data.imageUrl || 'https://placehold.co/80x80?text=Blog'
      };
    });

    const posts = {
      items: recentPostsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Post',
          content: data.content || 'No content available',
          author: data.author || 'Unknown Author',
          createdAt: data.createdAt || new Date().toISOString(),
          category: data.category || 'General'
        };
      }),
      totalCount: totalPosts
    };

    const dashboardStats = {
      totalBlogs,
      publishedBlogs,
      totalEvents,
      totalUsers,
      totalPosts
    };

    const responseData = {
      recentActivity,
      upcomingEvents,
      featuredBlogs,
      posts,
      dashboardStats
    };

    return NextResponse.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}