import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { db } from '../../firebase.config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string;
}

export interface UsersResponse {
  items: User[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
}

/**
 * Fetches users from Firebase Firestore
 * @param {number} page - Page number for pagination
 * @param {number} usersLimit - Number of users per page
 * @returns {Promise<UsersResponse>} Promise that resolves to users data
 */
export const getUsersFromFirebase = async (page: number = 1, usersLimit: number = 10): Promise<UsersResponse> => {
  try {
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Query users collection
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('name'), limit(usersLimit));
    const snapshot = await getDocs(q);
    
    // Transform Firestore documents to User objects
    const users: User[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        status: data.status || 'active',
        lastActive: data.lastActive || undefined,
      });
    });
    
    // For simplicity, returning static pagination info
    // In a real implementation, you'd calculate this properly
    return {
      items: users,
      totalCount: users.length, // This would be fetched separately in a real implementation
      hasNextPage: false, // Simplified for this example
      hasPreviousPage: false, // Simplified for this example
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching users from Firebase:", error);
    throw error;
  }
};

/**
 * Fetches a single user by ID from Firebase Firestore
 * @param {string} userId - ID of the user to fetch
 * @returns {Promise<User | null>} Promise that resolves to user data or null
 */
export const getUserByIdFromFirebase = async (userId: string): Promise<User | null> => {
  try {
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const userDoc = doc(db, 'users', userId);
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        status: data.status || 'active',
        lastActive: data.lastActive || undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user from Firebase:", error);
    throw error;
  }
};

/**
 * Adds a new user to Firebase Firestore
 * @param {Omit<User, 'id'>} userData - User data to add (without ID)
 * @returns {Promise<string>} Promise that resolves to the new user's ID
 */
export const addUserToFirebase = async (userData: Omit<User, 'id'>): Promise<string> => {
  try {
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const usersCollection = collection(db, 'users');
    const docRef = await addDoc(usersCollection, {
      ...userData,
      createdAt: new Date().toISOString(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding user to Firebase:", error);
    throw error;
  }
};

/**
 * Updates an existing user in Firebase Firestore
 * @param {string} userId - ID of the user to update
 * @param {Partial<User>} userData - User data to update
 * @returns {Promise<void>} Promise that resolves when update is complete
 */
export const updateUserInFirebase = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user in Firebase:", error);
    throw error;
  }
};

/**
 * Deletes a user from Firebase Firestore
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<void>} Promise that resolves when deletion is complete
 */
export const deleteUserFromFirebase = async (userId: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const userDoc = doc(db, 'users', userId);
    await deleteDoc(userDoc);
  } catch (error) {
    console.error("Error deleting user from Firebase:", error);
    throw error;
  }
};

/**
 * Signs in user with Google authentication
 * @returns {Promise<User>} Promise that resolves to user data
 */
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  try {
    if (!auth) {
      throw new Error('Authentication service unavailable');
    }
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create a new user
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      // Create new user in Firestore
      if (!db) {
        throw new Error('Database connection failed');
      }
      
      await addDoc(collection(db, 'users'), {
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        role: 'user', // default role
        status: 'active',
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } else {
      // Update last active timestamp
      await updateDoc(userDocRef, {
        lastActive: new Date().toISOString()
      });
    }
    
    // Return user data
    return {
      id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Unknown User',
      email: user.email || '',
      role: 'user',
      status: 'active',
      lastActive: new Date().toISOString()
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};