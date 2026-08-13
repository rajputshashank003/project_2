import React, { useContext, useRef } from 'react';
import { useAdminTeam } from './useAdminTeam';
import { AdminTeamContext } from './context';
import { Users, Upload, Save, Trash2, UserCircle2, Plus } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import type { TeamMemberSlot } from '../../types/team_member';

const SlotCard: React.FC<{ slot: TeamMemberSlot }> = ({ slot }) => {
  const ctx = useContext(AdminTeamContext);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const { forms, saving, clearing, setSlotField, handlePhotoUpload, handleSave, openClearConfirm, handleRemoveSlot } = ctx;
  const f = forms[slot] || { name: '', designation: '', photoPreview: '', isDirty: false };

  return (
    <div className="card-md flex flex-col gap-5 relative">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slot {slot}</span>
        <div className="flex items-center gap-2">
          {slot > 3 && (
            <button
              onClick={() => handleRemoveSlot(slot)}
              className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors"
              title="Remove Slot"
            >
              Remove
            </button>
          )}
          <button
            onClick={() => openClearConfirm(slot)}
            disabled={clearing[slot] || (!f.name && !f.photoPreview)}
            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Photo upload area */}
      <div className="flex flex-col items-center">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handlePhotoUpload(slot, f); e.target.value = ''; } }} />
        <button
          id={`upload-photo-slot-${slot}`}
          onClick={() => fileRef.current?.click()}
          className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 flex items-center justify-center transition-colors"
        >
          {f.photoPreview ? (
            <React.Fragment>
              <img src={f.photoPreview} alt={`Slot ${slot}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </React.Fragment>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-emerald-600 transition-colors">
              <UserCircle2 className="h-10 w-10" strokeWidth={1} />
              <Upload className="h-4 w-4" />
            </div>
          )}
        </button>
        <p className="text-xs text-slate-400 mt-2 text-center">Click to upload photo</p>
      </div>

      {/* Name & Designation */}
      <div className="space-y-3">
        <div>
          <label className="form-label">Name</label>
          <input
            id={`team-name-${slot}`}
            type="text"
            placeholder="Full name"
            value={f.name}
            onChange={(e) => setSlotField(slot, 'name', e.target.value)}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Designation</label>
          <input
            id={`team-designation-${slot}`}
            type="text"
            placeholder="e.g. President, Secretary"
            value={f.designation}
            onChange={(e) => setSlotField(slot, 'designation', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <button
        id={`save-slot-${slot}`}
        onClick={() => handleSave(slot)}
        disabled={saving[slot] || !f.isDirty}
        className="btn-primary w-full py-2.5"
      >
        {saving[slot] ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <Save className="h-4 w-4" /> Save Slot {slot}
          </span>
        )}
      </button>
    </div>
  );
};

const AdminTeamContent: React.FC = () => {
  const ctx = useContext(AdminTeamContext);
  if (!ctx) return null;
  const { members, isLoading, clearTarget, cancelClear, confirmClear, clearing, handleAddSlot } = ctx;

  return (
    <div className="page-wrapper">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Users className="h-3 w-3" />
            Admin Panel
          </div>
          <h1 className="section-heading">Team Members</h1>
          <p className="section-subheading">
            Manage leadership team member slots (3 to 5 members) shown on the public About page.
          </p>
        </div>
        <button
          onClick={handleAddSlot}
          disabled={members.length >= 5}
          className="btn-primary py-2 px-4 flex items-center gap-2 self-start disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Member Slot ({members.length}/5)
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <SlotCard key={m.slot} slot={m.slot} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!clearTarget}
        title="Clear Slot?"
        message={`This will remove the photo, name, and designation for Slot ${clearTarget}. Continue?`}
        confirmText="Clear"
        isLoading={!!clearTarget && clearing[clearTarget!]}
        onConfirm={confirmClear}
        onCancel={cancelClear}
      />
    </div>
  );
};

const AdminTeam: React.FC = () => {
  const state = useAdminTeam();
  return (
    <AdminTeamContext.Provider value={state}>
      <AdminTeamContent />
    </AdminTeamContext.Provider>
  );
};

export default AdminTeam;
