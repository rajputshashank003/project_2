import React, { useRef } from 'react';
import { useAdminNoticeboard } from './useAdminNoticeboard';
import { AdminNoticeboardContext } from './context';
import { Bell, Trash2, ToggleLeft, ToggleRight, Image } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const AdminNoticeboardContent: React.FC = () => {
  const ctx = React.useContext(AdminNoticeboardContext);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const { notices, isLoading, form, imagePreview, isSubmitting, errors, handleFormChange, handleImageUpload, handleSubmit, handleToggleActive, handleDelete } = ctx;

  return (
    <div className="page-wrapper">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <Bell className="h-3 w-3" />
          Admin Panel
        </div>
        <h1 className="section-heading">Noticeboard</h1>
        <p className="section-subheading">Publish announcements visible on the home page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add notice form */}
        <div className="card-md">
          <h2 className="text-base font-bold text-slate-900 mb-5">New Notice</h2>

          <div className="space-y-4">
            <div>
              <label className="form-label">Title *</label>
              <input id="notice-title" type="text" placeholder="Notice title…" value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} className={`form-input ${errors.title ? 'border-red-400' : ''}`} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="form-label">Content *</label>
              <textarea id="notice-content" rows={4} placeholder="Notice details…" value={form.content} onChange={(e) => handleFormChange('content', e.target.value)} className={`form-input resize-none ${errors.content ? 'border-red-400' : ''}`} />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
            </div>

            <div>
              <label className="form-label">Image (optional)</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              {imagePreview ? (
                <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <button id="notice-image-btn" type="button" onClick={() => fileRef.current?.click()} className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                  <Image className="h-5 w-5" />
                  <span className="text-sm">Add image</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="form-label mb-0">Publish immediately</label>
              <button type="button" onClick={() => handleFormChange('isActive', !form.isActive)} className="text-emerald-600">
                {form.isActive ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-slate-400" />}
              </button>
            </div>

            <button id="publish-notice-btn" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? 'Publishing…' : 'Publish Notice'}
            </button>
          </div>
        </div>

        {/* Notice list */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Published Notices ({notices.length})</h2>
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" /></div>
          ) : notices.length === 0 ? (
            <div className="card text-center text-slate-400 py-12">No notices yet. Create your first one!</div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className={`card py-4 ${!n.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    {n.imageUrl && (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 text-sm truncate">{n.title}</span>
                        <span className={`badge ${n.isActive ? 'badge-approved' : 'badge-pending'} shrink-0`}>
                          {n.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2">{n.content}</p>
                      <span className="text-xs text-slate-400 mt-1 block">{formatDate(n.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggleActive(n.id, n.isActive)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title={n.isActive ? 'Hide' : 'Show'}>
                        {n.isActive ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminNoticeboard: React.FC = () => {
  const state = useAdminNoticeboard();
  return (
    <AdminNoticeboardContext.Provider value={state}>
      <AdminNoticeboardContent />
    </AdminNoticeboardContext.Provider>
  );
};

export default AdminNoticeboard;
