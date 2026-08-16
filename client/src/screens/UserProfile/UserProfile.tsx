import React, { useState } from 'react';
import { User, FileText, CreditCard, HeartPulse, Edit2, Check, X } from 'lucide-react';
import { useUserProfile } from './useUserProfile';
import { UserProfileContext } from './context';
import { DonationList } from './components/DonationList';
import { IdCardList } from './components/IdCardList';
import { useAuth } from '../../context/AuthContext';
import { updateMyProfile } from '../../utils/api_request/auth';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const UserProfileContent: React.FC = () => {
  const ctx = React.useContext(UserProfileContext);
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'Unknown');
  const [isSaving, setIsSaving] = useState(false);

  if (!ctx) return null;
  const { activeTab, setActiveTab, donationTotal, idCardTotal } = ctx;

  const handleStartEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setBloodGroup(user?.bloodGroup || 'Unknown');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Full name is required'); return; }
    if (!email.trim()) { toast.error('Email is required'); return; }
    setIsSaving(true);
    try {
      const updated = await updateMyProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        bloodGroup: bloodGroup.trim(),
      });
      updateUser({
        name: updated.name,
        email: updated.email,
        bloodGroup: updated.bloodGroup,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-wrapper max-w-4xl py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-card border border-slate-100 mb-6 sm:mb-8">
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                <User className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{user?.name || 'Member Profile'}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                  <span className="font-medium">+91 {user?.phone}</span>
                  {user?.email && (
                    <React.Fragment>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <span className="truncate">{user.email}</span>
                    </React.Fragment>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    {user?.role === 'admin' ? 'Admin' : (user?.designation || 'Member')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <HeartPulse className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Blood Group: {user?.bloodGroup || 'Not Specified'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartEdit}
              className="btn-outline py-2 px-4 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto self-stretch sm:self-center"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Edit Profile Details</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Blood Group *</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-input bg-white"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-outline py-2 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
              >
                {isSaving ? (
                  <React.Fragment>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving...
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Check className="h-3.5 w-3.5" />
                    Save Changes
                  </React.Fragment>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs: Responsive Segmented Control */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-6 max-w-md mx-auto sm:max-w-none sm:flex sm:bg-transparent sm:border-b sm:border-slate-200 sm:rounded-none sm:p-0 sm:gap-6">
        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-none sm:pb-3 sm:border-b-2 transition-all ${
            activeTab === 'donations'
              ? 'bg-white text-emerald-700 shadow-sm sm:shadow-none sm:bg-transparent sm:border-emerald-600'
              : 'text-slate-500 hover:text-slate-800 sm:border-transparent'
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">My Donations &amp; Certificates</span>
          <span className="sm:hidden">Donations</span>
          {donationTotal > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {donationTotal}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('idcards')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-none sm:pb-3 sm:border-b-2 transition-all ${
            activeTab === 'idcards'
              ? 'bg-white text-emerald-700 shadow-sm sm:shadow-none sm:bg-transparent sm:border-emerald-600'
              : 'text-slate-500 hover:text-slate-800 sm:border-transparent'
          }`}
        >
          <CreditCard className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">My ID Cards</span>
          <span className="sm:hidden">ID Cards</span>
          {idCardTotal > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {idCardTotal}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-slate-100">
        {activeTab === 'donations' ? <DonationList /> : <IdCardList />}
      </div>
    </div>
  );
};

const UserProfile: React.FC = () => {
  const profileState = useUserProfile();

  return (
    <UserProfileContext.Provider value={profileState}>
      <UserProfileContent />
    </UserProfileContext.Provider>
  );
};

export default UserProfile;
