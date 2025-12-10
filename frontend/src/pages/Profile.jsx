import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../store/useAuth.jsx';
import EmployeeOverview from '../components/Profile/EmployeeOverview';
import ManagerOverview from '../components/Profile/ManagerOverview';
import AdminOverview from '../components/Profile/AdminOverview';


// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${api.defaults.baseURL.replace('/api', '')}/${path}`;
};

function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/me');
      setProfile(res.data?.user || null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || ''
      }));
    }
  }, [profile]);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size too large (max 5MB)' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/user/me', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data.user);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const payload = {};

      if (activeTab === 'security') {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        payload.password = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put('/user/me', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setProfile(res.data.user);

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Update failed'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile && loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-900/40 overflow-hidden relative">
              {profile?.avatar ? (
                <img src={getImageUrl(profile.avatar)} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                getInitials(profile?.name)
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-white">Change</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{profile?.name}</h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30 capitalize">
                {profile?.role}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'general'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'security'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'preferences'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
            >
              Preferences
            </button>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 border-b border-slate-800 pb-4">
                {activeTab === 'general' && 'General Information'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'preferences' && 'User Preferences'}
              </h2>

              {message.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                  {message.text}
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-6 max-w-xl">
                  {/* Active Role-Based Overview */}
                  {profile?.role === 'employee' && <EmployeeOverview profile={profile} />}
                  {profile?.role === 'manager' && <ManagerOverview profile={profile} />}
                  {profile?.role === 'admin' && <AdminOverview profile={profile} />}

                  {/* Divider for Profile Details */}
                  <div className="border-t border-slate-800 pt-6 mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Details</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                        {profile?.role === 'admin' ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name !== undefined ? formData.name : profile?.name}
                            onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="flex-1 bg-slate-950/30 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300">
                                {profile?.name}
                              </div>

                              {profile?.profileUpdateRequest?.status === 'pending' ? (
                                <div className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-center gap-2">
                                  <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Change Pending: "{profile.profileUpdateRequest.value}"
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const newName = prompt("Enter new name:");
                                    if (newName && newName !== profile.name) {
                                      // Call API to request update
                                      api.post('/user/request-update', { name: newName })
                                        .then(res => {
                                          setProfile(res.data.user);
                                          alert("Request submitted for approval.");
                                        })
                                        .catch(err => alert("Failed to submit request"));
                                    }
                                  }}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
                                >
                                  Request Edit
                                </button>
                              )}
                            </div>
                            {profile?.profileUpdateRequest?.status === 'rejected' && (
                              <p className="text-xs text-rose-400">Previous request was rejected.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="w-full bg-slate-950/30 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed">
                      {profile?.email}
                    </div>
                  </div>

                  {profile?.role === 'admin' && (
                    <div className="pt-4">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          setLoading(true);
                          try {
                            const res = await api.put('/user/me', { name: formData.name });
                            setProfile(res.data.user);
                            setMessage({ type: 'success', text: 'Profile updated successfully' });
                          } catch (err) {
                            setMessage({ type: 'error', text: 'Failed to update profile' });
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 max-w-xl">
                  {/* Password Update - Available for everyone */}
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <h3 className="text-lg font-medium text-white border-b border-slate-800 pb-2">Password Update</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>

                  {/* Admin Specific Security Options */}
                  {profile?.role === 'admin' && (
                    <div className="pt-6 border-t border-slate-800 space-y-6">
                      <h3 className="text-lg font-medium text-white border-b border-slate-800 pb-2">Admin Security Panel</h3>

                      <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div>
                          <h4 className="text-white font-medium">Enforce Two-Factor Auth</h4>
                          <p className="text-sm text-slate-400">Require MFA for all admins and managers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={profile?.preferences?.twoFactorEnabled ?? false}
                            onChange={async (e) => {
                              const newVal = e.target.checked;
                              const oldProfile = { ...profile };
                              setProfile(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, twoFactorEnabled: newVal }
                              }));

                              try {
                                await api.put('/user/me', {
                                  preferences: { twoFactorEnabled: newVal }
                                });
                                setMessage({ type: 'success', text: `Two-Factor Auth ${newVal ? 'Enabled' : 'Disabled'}` });
                              } catch (err) {
                                setProfile(oldProfile);
                                setMessage({ type: 'error', text: 'Failed to update setting' });
                              }
                            }}
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6 max-w-xl">
                  {/* Common Preferences */}
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-sm text-slate-400">Receive weekly digests and major updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={profile?.preferences?.emailNotifications ?? true}
                        onChange={async (e) => {
                          const newVal = e.target.checked;
                          // Optimistic update
                          const oldProfile = { ...profile };
                          setProfile(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailNotifications: newVal }
                          }));

                          try {
                            await api.put('/user/me', {
                              preferences: { emailNotifications: newVal }
                            });
                          } catch (err) {
                            // Revert on failure
                            setProfile(oldProfile);
                            setMessage({ type: 'error', text: 'Failed to update preference' });
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <div>
                      <h4 className="text-white font-medium">Dark Mode</h4>
                      <p className="text-sm text-slate-400">Sync with system theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={profile?.preferences?.darkMode ?? true}
                        onChange={async (e) => {
                          const newVal = e.target.checked;
                          const oldProfile = { ...profile };
                          setProfile(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, darkMode: newVal }
                          }));

                          try {
                            await api.put('/user/me', {
                              preferences: { darkMode: newVal }
                            });
                          } catch (err) {
                            setProfile(oldProfile);
                            setMessage({ type: 'error', text: 'Failed to update preference' });
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Manager Specific Preferences */}
                  {profile?.role === 'manager' && (
                    <div className="pt-6 border-t border-slate-800">
                      <h3 className="text-lg font-medium text-white mb-4">Manager Settings</h3>
                      <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div>
                          <h4 className="text-white font-medium">Weekly Team Report</h4>
                          <p className="text-sm text-slate-400">Receive a summary of team IDP progress</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={profile?.preferences?.weeklyReports ?? true}
                            onChange={async (e) => {
                              const newVal = e.target.checked;
                              const oldProfile = { ...profile };
                              setProfile(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, weeklyReports: newVal }
                              }));

                              try {
                                await api.put('/user/me', {
                                  preferences: { weeklyReports: newVal }
                                });
                                setMessage({ type: 'success', text: 'Preference updated' });
                              } catch (err) {
                                setProfile(oldProfile);
                                setMessage({ type: 'error', text: 'Failed to update preference' });
                              }
                            }}
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Admin Specific Preferences */}
                  {profile?.role === 'admin' && (
                    <div className="pt-6 border-t border-slate-800">
                      <h3 className="text-lg font-medium text-white mb-4">Global Preferences</h3>
                      <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div>
                          <h4 className="text-white font-medium">System Branding</h4>
                          <p className="text-sm text-slate-400">Display custom company logo on login</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={profile?.preferences?.systemBranding ?? true}
                            onChange={async (e) => {
                              const newVal = e.target.checked;
                              const oldProfile = { ...profile };
                              setProfile(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, systemBranding: newVal }
                              }));

                              try {
                                await api.put('/user/me', {
                                  preferences: { systemBranding: newVal }
                                });
                                setMessage({ type: 'success', text: 'Preference updated' });
                              } catch (err) {
                                setProfile(oldProfile);
                                setMessage({ type: 'error', text: 'Failed to update preference' });
                              }
                            }}
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
