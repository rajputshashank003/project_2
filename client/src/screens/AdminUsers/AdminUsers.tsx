import React from 'react';
import { useAdminUsers } from './useAdminUsers';
import { AdminUsersContext } from './context';
import { Users, Search } from 'lucide-react';
import { DESIGNATIONS } from '../../utils/constants';
import { getInitials, formatDate } from '../../utils/helpers';

const AdminUsersContent: React.FC = () => {
  const ctx = React.useContext(AdminUsersContext);
  if (!ctx) return null;
  const { filteredUsers, isLoading, searchQuery, setSearchQuery, handleDesignationChange } = ctx;

  return (
    <div className="page-wrapper">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <Users className="h-3 w-3" />
          Admin Panel
        </div>
        <h1 className="section-heading">Registered Users</h1>
        <p className="section-subheading">View and manage all registered members</p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input id="users-search" type="text" placeholder="Search by name, phone…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Joined On</th>
                <th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.phone}</td>
                  <td className="text-slate-500">{formatDate(u.joinedAt)}</td>
                  <td>
                    <select
                      value={u.designation}
                      onChange={(e) => handleDesignationChange(u.id, e.target.value as any)}
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                      {DESIGNATIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminUsers: React.FC = () => {
  const state = useAdminUsers();
  return (
    <AdminUsersContext.Provider value={state}>
      <AdminUsersContent />
    </AdminUsersContext.Provider>
  );
};

export default AdminUsers;
