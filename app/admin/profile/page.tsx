'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Define TypeScript interfaces
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  coverPhoto?: string;
  createdAt: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role: string;
  bio: string;
  timezone: string;
  language: string;
  avatar: File | null;
  coverPhoto: File | null;
}

/**
 * Admin profile page component for viewing and editing user profile information
 * @returns {JSX.Element} The admin profile page
 */
const ProfilePage = () => {
  // Mock user data - in a real app, this would come from an API or context
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add state for image previews
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user profile data from the API
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Fetch user profile from API
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Try to parse error response, fallback to text if JSON fails
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            // If JSON parsing fails, get text response
            const errorText = await response.text();
            console.error('Error parsing profile response:', parseError);
            throw new Error(errorText || `Failed to fetch profile: Status ${response.status}`);
          }
          throw new Error(errorData.message || `Failed to fetch profile: Status ${response.status}`);
        }
        
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Error parsing profile response:', parseError);
          throw new Error(`Failed to parse response: ${errorText}`);
        }
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch profile');
        }
        
        const userData = result.data.user;
        
        // Process the received user data
        // Check for profile picture in different possible fields
        const profilePicture = userData.profilePicture || userData.avatar || userData.photoURL || '';
        // Check for cover photo in different possible fields
        const coverPhoto = userData.coverPhoto || userData.cover_image || userData.cover || '';
        
        const processedProfile: UserProfile = {
          id: userData.id || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          position: userData.position || '',
          role: userData.role || '',
          bio: userData.bio || '',
          timezone: userData.timezone || 'Asia/Manila',
          language: userData.language || 'en',
          avatar: profilePicture,
          coverPhoto: coverPhoto,
          createdAt: userData.createdAt || new Date().toISOString(),
        };
        
        setUserProfile(processedProfile);
        
        // Also update localStorage with fresh data
        localStorage.setItem('admin_user', JSON.stringify(userData));
        
        setLoading(false);
      } catch (err: unknown) {
        setError('Failed to load profile data');
        setLoading(false);
        console.error('Error loading profile:', err);
      }
    };
    
    fetchUserProfile();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  
  // Effect to populate form data when entering edit mode
  useEffect(() => {
    if (isEditing && userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        position: userProfile.position || '',
        role: userProfile.role || '',
        bio: userProfile.bio || '',
        timezone: userProfile.timezone || 'Asia/Manila',
        language: userProfile.language || 'en',
        avatar: null, // Don't pre-populate with existing avatar file
        coverPhoto: null // Don't pre-populate with existing cover photo file
      });
    }
  }, [isEditing, userProfile]);
  // Helper function to validate file size
  const validateFileSize = (file: File | null, maxSizeInMB: number, fieldName: string): boolean => {
    if (!file) return true;
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert(`${fieldName} file size exceeds ${maxSizeInMB}MB limit. Please choose a smaller file.`);
      return false;
    }
    return true;
  };
  
  const [formData, setFormData] = useState<FormData>(() => {
    // Initialize form data based on user profile if available
    if (userProfile) {
      return {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        position: userProfile.position || '',
        role: userProfile.role || '',
        bio: userProfile.bio || '',
        timezone: userProfile.timezone || 'Asia/Manila',
        language: userProfile.language || 'en',
        avatar: null,
        coverPhoto: null,
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      role: '',
      bio: '',
      timezone: 'Asia/Manila',
      language: 'en',
      avatar: null,
      coverPhoto: null,
    };
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if ((name === 'avatar' || name === 'coverPhoto') && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size before processing
      const maxSize = name === 'avatar' ? 5 : 10; // 5MB for avatar, 10MB for cover
      const fieldName = name === 'avatar' ? 'Avatar' : 'Cover photo';
      
      if (!validateFileSize(file, maxSize, fieldName)) {
        // Reset the file input to clear the selection
        e.target.value = '';
        return;
      }
      
      // Create preview URL for the new file
      const previewUrl = URL.createObjectURL(file);
      
      // Set the appropriate preview state
      if (name === 'avatar') {
        setAvatarPreview(previewUrl);
      } else if (name === 'coverPhoto') {
        setCoverPhotoPreview(previewUrl);
      }
      
      setFormData({
        ...formData,
        [name]: file
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error when user starts typing
    if (formErrors[name as keyof FormData]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };


  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (userProfile && userProfile.avatar && userProfile.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(userProfile.avatar);
      }
      if (userProfile && userProfile.coverPhoto && userProfile.coverPhoto.startsWith('blob:')) {
        URL.revokeObjectURL(userProfile.coverPhoto);
      }
      // Clean up preview URLs
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (coverPhotoPreview) {
        URL.revokeObjectURL(coverPhotoPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on unmount, not on state changes

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }
    
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!userProfile) {
      setError('User profile not loaded');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create FormData object to handle file uploads
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('timezone', formData.timezone);
      formDataToSend.append('language', formData.language);
      
      // Add files if they exist
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }
      if (formData.coverPhoto) {
        formDataToSend.append('coverPhoto', formData.coverPhoto);
      }
      
      // Send update request to API
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      if (!response.ok) {
        // Try to parse error response, fallback to text if JSON fails
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, get text response
          const errorText = await response.text();
          console.error('Error parsing profile update response:', parseError);
          throw new Error(errorText || `Failed to update profile: Status ${response.status}`);
        }
        throw new Error(errorData.message || `Failed to update profile: Status ${response.status}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        const errorText = await response.text();
        console.error('Error parsing profile response:', parseError);
        throw new Error(`Failed to parse response: ${errorText}`);
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      // Clean up preview URLs after successful upload since we'll be using the Firebase URLs
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      if (coverPhotoPreview) {
        URL.revokeObjectURL(coverPhotoPreview);
        setCoverPhotoPreview(null);
      }
      
      // Update the user profile with response data
      const updatedUserData = result.data.user;
      setUserProfile({
        ...userProfile,
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        email: updatedUserData.email,
        position: updatedUserData.position,
        role: updatedUserData.role,
        bio: updatedUserData.bio,
        timezone: updatedUserData.timezone,
        language: updatedUserData.language,
        avatar: updatedUserData.profilePicture,
        coverPhoto: updatedUserData.coverPhoto
      });
      
      // Update user data in localStorage
      localStorage.setItem('admin_user', JSON.stringify(updatedUserData));
      
      setIsEditing(false);
    } catch (updateErr: unknown) {
      console.error('Error updating profile:', updateErr);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    
    // Clean up preview URLs
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (coverPhotoPreview) {
      URL.revokeObjectURL(coverPhotoPreview);
      setCoverPhotoPreview(null);
    }
    
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        position: userProfile.position || '',
        role: userProfile.role || '',
        bio: userProfile.bio || '',
        timezone: userProfile.timezone || 'Asia/Manila',
        language: userProfile.language || 'en',
        avatar: null,
        coverPhoto: null
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-0">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-800 p-8 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative flex flex-col md:flex-row items-center">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <Image 
                src={userProfile?.avatar || '/placeholder-profile.png'}
                alt="User Avatar"
                width={150}
                height={150}
                className="w-32 h-32 rounded-full object-cover border-2 border-indigo-200 shadow-lg"
              />
              <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 border-2 border-white">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User Profile'}
              </h1>
              <p className="text-indigo-200 text-lg mb-2">
                {userProfile?.position || 'Loading position...'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-30 text-gray-800 backdrop-blur-sm">
                  <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Philippines
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-30 text-gray-800 backdrop-blur-sm">
                  <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {isEditing ? (
            // Edit Form
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Personal Information</h2>
                </div>
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  />
                  {formErrors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  />
                  {formErrors.lastName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black ${
                      formErrors.position ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  />
                  {formErrors.position && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.position}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black ${
                      formErrors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  >
                    <option value="" className="text-gray-500">Select a role</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Editor">Editor</option>
                    <option value="Moderator">Moderator</option>
                    <option value="User">User</option>
                  </select>
                  {formErrors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.role}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Profile Picture</h3>
                  <div className="flex items-center mb-6">
                    <div className="mr-6">
                      <Image
                        src={avatarPreview || userProfile?.avatar || '/placeholder-profile.png'}
                        alt="Profile Preview"
                        width={150}
                        height={150}
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleChange}
                        className="text-sm text-gray-600
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100 transition-colors duration-200"
                      />
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6 pb-2 border-b border-gray-200">Cover Photo</h3>
                  <div className="mb-6">
                    <div className="mb-4">
                      {coverPhotoPreview ? (
                        <div className="w-full h-48 relative rounded-lg overflow-hidden">
                          <Image
                            src={coverPhotoPreview}
                            alt="Cover Preview"
                            fill
                            sizes="100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : userProfile?.coverPhoto ? (
                        <div className="w-full h-48 relative rounded-lg overflow-hidden">
                          <Image
                            src={userProfile.coverPhoto}
                            alt="Current Cover Photo"
                            fill
                            sizes="100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg border border-dashed border-gray-400 flex items-center justify-center text-gray-500">
                          No cover photo uploaded
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="coverPhoto"
                        name="coverPhoto"
                        accept="image/*"
                        onChange={handleChange}
                        className="text-sm text-gray-600
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100 transition-colors duration-200"
                      />
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black"
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black"
                      style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                    >
                      <option value="Asia/Manila">(GMT+08:00) Philippines Time</option>
                      <option value="UTC">(GMT+00:00) UTC</option>
                      <option value="America/New_York">(GMT-05:00) Eastern Time</option>
                      <option value="Asia/Tokyo">(GMT+09:00) Japan Standard Time</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-black"
                      style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
                    >
                      <option value="en">English</option>
                      <option value="tl">Tagalog</option>
                      <option value="zh">Chinese</option>
                      <option value="hil">Hiligaynon</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-5 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // Profile Display
            <div>
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-gray-600">Basic details about your account</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="mt-1 text-gray-900">{userProfile?.email || 'Loading...'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Position</h3>
                      <p className="mt-1 text-gray-900">{userProfile?.position || 'Loading...'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7m-1 0a1 1 0 10-2 0 1 1 0 002 0zM5 7m-1 0a1 1 0 10-2 0 1 1 0 002 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Role</h3>
                      <p className="mt-1 text-gray-900">{userProfile?.role || 'Loading...'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Profile Picture</h3>
                    <div className="flex items-center">
                      <Image 
                        src={userProfile?.avatar || '/placeholder-profile.png'}
                        alt="User Avatar"
                        width={150}
                        height={150}
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-md"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">About</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-900">
                        {userProfile?.bio || 'No bio provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {userProfile?.coverPhoto && (
                <div className="mb-10">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Cover Photo</h3>
                    <div className="h-48 rounded-lg overflow-hidden">
                      <div className="w-full h-full relative">
                        <Image
                          src={userProfile.coverPhoto}
                          alt="Cover Photo"
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timezone:</span>
                      <span className="text-gray-900 font-medium">
                        {userProfile?.timezone === 'Asia/Manila' && '(GMT+08:00) Philippines Time'}
                        {userProfile?.timezone === 'UTC' && '(GMT+00:00) UTC'}
                        {userProfile?.timezone === 'America/New_York' && '(GMT-05:00) Eastern Time'}
                        {userProfile?.timezone === 'Asia/Tokyo' && '(GMT+09:00) Japan Standard Time'}
                        {!userProfile?.timezone && 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="text-gray-900 font-medium">
                        {userProfile?.language === 'en' && 'English'}
                        {userProfile?.language === 'tl' && 'Tagalog'}
                        {userProfile?.language === 'zh' && 'Chinese'}
                        {userProfile?.language === 'hil' && 'Hiligaynon'}
                        {!userProfile?.language && 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;