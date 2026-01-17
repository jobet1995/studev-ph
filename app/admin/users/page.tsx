'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState<Partial<User>>({});
  const router = useRouter();

  useEffect(() => {
    // Check if user has admin role before attempting to fetch users
    const storedUser = localStorage.getItem('admin_user');
    let userRole = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userRole = parsedUser.role;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Only allow certain roles to access the users page
    const allowedRoles = ['Administrator', 'SuperAdmin'];
    if (userRole && !allowedRoles.includes(userRole)) {
      setError('Unauthorized: Insufficient permissions');
      setLoading(false);
      return;
    }

    // Fetch data from Firebase backend
    const fetchUsers = async () => {
      try {
        // Get auth token
        let token = localStorage.getItem('admin_token');

        // Fetch users data from API
        let response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // If we get a 401/403, try to refresh the token
        if (response.status === 401 || response.status === 403) {
          console.log('Access token expired or invalid, attempting refresh...');

          const refreshResult = await refreshAccessToken();
          if (refreshResult.success) {
            token = refreshResult.newToken;

            // Retry the request with the new token
            response = await fetch('/api/admin/users', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } else {
            // If refresh failed, redirect to login
            setError('Session expired. Please log in again.');
            setTimeout(() => {
              router.push('/admin/login');
            }, 2000);
            return;
          }
        }

        if (!response.ok) {
          // Try to parse error response, fallback to text if JSON fails
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            // If JSON parsing fails, get text response
            const errorText = await response.text();
            console.error('Error parsing users response:', parseError);
            throw new Error(errorText || `Failed to fetch users: Status ${response.status}`);
          }

          // If it's a 401 or 403 error, this might indicate an expired token
          if (response.status === 401 || response.status === 403) {
            throw new Error('Token expired or unauthorized');
          }

          throw new Error(errorData.message || `Failed to fetch users: Status ${response.status}`);
        }

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Error parsing users response:', parseError);
          throw new Error(`Failed to parse response: ${errorText}`);
        }

        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch users');
        }

        setUsers(result.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    // Function to refresh access token
    const refreshAccessToken = async () => {
      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');

        if (!refreshToken) {
          return { success: false, error: 'No refresh token available' };
        }

        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token refresh failed:', errorData.message);
          return { success: false, error: errorData.message };
        }

        const result = await response.json();

        if (result.success && result.data.token) {
          localStorage.setItem('admin_token', result.data.token);
          // Update user data if needed
          if (result.data.user) {
            const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
            localStorage.setItem('admin_user', JSON.stringify({
              ...currentUser,
              ...result.data.user
            }));
          }
          return { success: true, newToken: result.data.token };
        } else {
          return { success: false, error: result.message || 'Token refresh failed' };
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        return { success: false, error: 'Network error during token refresh' };
      }
    };

    fetchUsers();
  }, [router]);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setUpdatedUserData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      bio: user.bio,
      timezone: user.timezone,
      language: user.language,
    });
    setIsModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingUser.id,
          updates: updatedUserData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Failed to update user');
      }

      const result = await response.json();
      if (result.message && result.status === 'success') {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === editingUser.id ? { ...u, ...updatedUserData } : u)
        );
        
        setIsModalOpen(false);
        setEditingUser(null);
      } else {
        throw new Error(result.message || 'Failed to update user');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedUserData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    // Check if the error is a permissions issue
    const isPermissionError = error.includes('Insufficient permissions') || error.includes('403') || error.includes('Unauthorized');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {isPermissionError ? 'Access Restricted' : 'Error Loading Users'}
          </h2>
          <p className="text-gray-600 mb-4">{error || 'An error occurred while loading users.'}</p>

          {isPermissionError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-left">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your account role may not have access to the users management page.
                Contact an administrator to request appropriate permissions.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (isPermissionError) {
                // If it's a permission error, redirect to profile page
                router.push('/admin/profile');
              } else {
                router.refresh();
              }
            }}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {isPermissionError ? 'Go to Profile' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">View and manage all registered users</p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email.split('@')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'SuperAdmin' ? 'bg-red-100 text-red-800' :
                          user.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'Moderator' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit User: {editingUser.firstName} {editingUser.lastName}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={updatedUserData.firstName || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={updatedUserData.lastName || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={updatedUserData.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={updatedUserData.position || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={updatedUserData.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      value={updatedUserData.role || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="User">User</option>
                      <option value="Editor">Editor</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Administrator">Administrator</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={updatedUserData.status || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={updatedUserData.bio || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;