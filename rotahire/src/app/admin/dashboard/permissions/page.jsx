'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, UserPlus, Shield, Users, Crown, X, Check, AlertTriangle, Settings, Trash2 } from 'lucide-react';

// Permission level configurations
const PERMISSION_LEVELS = {
  basic: {
    label: 'Basic Admin',
    icon: Users,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Dashboard, Members, Events, Reports'
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'All Basic + User Management, Settings'
  },
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'All Admin + Permissions, System, Payments'
  }
};

export default function PermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [permissions, setPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // Load current permissions on mount
  useEffect(() => {
    if (status === 'loading') return;

    // if (!session || session.user?.permission_level !== 'super_admin') {
    //   router.push('/unauthorized');
    //   return;
    // }

    loadPermissions();
  }, [session, status, router]);

  // Load all current permissions
  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/permissions');
      const result = await response.json();

      if (!result.permissions) {
        throw new Error('Failed to load permissions');
      }

      setPermissions(result.permissions);
    } catch (error) {
      toast.error('Failed to load permissions');
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast.error('Please enter at least 3 characters to search');
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/admin/search-users?name=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      if (!result.users) {
        throw new Error(result.error || 'Search failed');
      }

      setSearchResults(result.users);
      if (result.users.length === 0) {
        toast.info('No users found matching your search');
      }
    } catch (error) {
      toast.error(error.message || 'Search failed');
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Assign permission to user
  const handleAssignPermission = async (permissionLevel) => {
    if (!selectedUser) return;

    try {
      setIsAssigning(true);
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RMIS_ID: selectedUser.RMIS_ID,
          permission_level: permissionLevel,
          card_name: selectedUser.card_name
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to assign permission');
      }

      toast.success(`Permission assigned successfully to ${selectedUser.card_name}`);
      setSelectedUser(null);
      setShowAssignModal(false);
      setSearchResults([]);
      setSearchQuery('');
      loadPermissions(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to assign permission');
      console.error('Error assigning permission:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Remove permission from user
  const handleRemovePermission = async (permission) => {
    if (!confirm(`Are you sure you want to remove ${permission.permission_level} permission from ${permission.card_name}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ RMIS_ID: permission.rmis_id })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove permission');
      }

      toast.success(`Permission removed from ${permission.card_name}`);
      loadPermissions(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to remove permission');
      console.error('Error removing permission:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D81B5D]"></div>
      </div>
    );
  }

  // if (!session || session.user?.permission_level !== 'super_admin') {
  //   return null;
  // }

  // Temporary: Show debug info
  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-['Poppins']">
            User Permissions Management
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Assign and manage admin permissions for Rotaract members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-red-200">
            <Crown className="w-3.5 h-3.5" />
            Super Admin Only
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#D81B5D]/10 rounded-lg">
              <Search className="w-5 h-5 text-[#D81B5D]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Search & Assign Permissions</h2>
              <p className="text-sm text-gray-600">Find members to assign admin permissions</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by member name (min. 3 characters)..."
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:border-[#D81B5D] transition-all text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || searchQuery.length < 3}
              className="h-11 px-6 bg-[#D81B5D] hover:bg-[#B0174A] disabled:bg-[#D81B5D]/60 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-2 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="p-6 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">Search Results ({searchResults.length})</h3>
            </div>
            <div className="space-y-3">
              {searchResults.map((user) => {
                const existingPermission = permissions.find(p => p.rmis_id === user.RMIS_ID);
                const hasPermission = !!existingPermission;

                return (
                  <div
                    key={user.RMIS_ID}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D81B5D] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {user.card_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{user.card_name}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>RMIS: {user.RMIS_ID}</span>
                            <span>•</span>
                            <span>Role: {user.role_id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {hasPermission && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${PERMISSION_LEVELS[existingPermission.permission_level].color}`}>
                            <existingPermission.permission_level.icon className="w-3 h-3" />
                            {PERMISSION_LEVELS[existingPermission.permission_level].label}
                          </span>
                        )}

                        {hasPermission ? (
                          <button
                            onClick={() => handleRemovePermission(existingPermission)}
                            className="inline-flex items-center justify-center h-9 w-9 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                            aria-label="Remove permission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAssignModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 h-9 px-3 bg-[#D81B5D] hover:bg-[#B0174A] text-white rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-2 cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Current Permissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#D81B5D]/10 rounded-lg">
                <Shield className="w-5 h-5 text-[#D81B5D]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Permissions</h2>
                <p className="text-sm text-gray-600">{permissions.length} member{permissions.length !== 1 ? 's' : ''} with admin access</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {permissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions assigned</h3>
              <p className="text-gray-600 text-sm">Search for users above to assign permissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((permission) => {
                const config = PERMISSION_LEVELS[permission.permission_level];
                const Icon = config.icon;

                return (
                  <div
                    key={permission.rmis_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D81B5D] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {(permission.card_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{permission.card_name || 'Unknown User'}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>RMIS: {permission.rmis_id}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                            {config.label}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemovePermission(permission)}
                          className="inline-flex items-center justify-center h-9 w-9 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                          aria-label="Remove permission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Permission Levels Guide - Minimal Premium Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#D81B5D]/10 rounded-md">
              <AlertTriangle className="w-4 h-4 text-[#D81B5D]" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Permission Levels</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(PERMISSION_LEVELS).map(([level, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={level}
                  className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-xl ${config.color} group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900 text-sm">{config.label}</h3>
                      <p className="text-xs text-gray-500 leading-tight line-clamp-2">
                        {config.description.split(', ').slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
  {/* Assignment Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Assign Permission</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Select permission level for {selectedUser.card_name}
              </p>
            </div>

            <div className="p-6 space-y-3">
              {Object.entries(PERMISSION_LEVELS).map(([level, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={level}
                    onClick={() => handleAssignPermission(level)}
                    disabled={isAssigning}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#D81B5D] hover:bg-[#D81B5D]/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color.replace('text-', 'bg-').replace('800', '100')}`}>
                        <Icon className={`w-4 h-4 ${config.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{config.label}</h4>
                        <p className="text-xs text-gray-600">{config.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}