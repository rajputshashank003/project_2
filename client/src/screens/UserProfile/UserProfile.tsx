import React from 'react';
import { User, FileText, CreditCard } from 'lucide-react';
import { useUserProfile } from './useUserProfile';
import { UserProfileContext } from './context';
import { DonationList } from './components/DonationList';
import { IdCardList } from './components/IdCardList';
import { useAuth } from '../../context/AuthContext';

const UserProfileContent: React.FC = () => {
  const ctx = React.useContext(UserProfileContext);
  const { user } = useAuth();
  if (!ctx) return null;

  const { activeTab, setActiveTab, donationTotal, idCardTotal } = ctx;

  return (
    <div className="page-wrapper max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Member Profile'}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                <span>+91 {user?.phone}</span>
                {user?.email && (
                  <React.Fragment>
                    <span className="text-slate-300">•</span>
                    <span>{user.email}</span>
                  </React.Fragment>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                  {user?.role === 'admin' ? 'Admin' : (user?.designation || 'Member')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4">
        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'donations'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Donations & Certificates</span>
          {donationTotal > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
              {donationTotal}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('idcards')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'idcards'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>My ID Cards</span>
          {idCardTotal > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">
              {idCardTotal}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
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
