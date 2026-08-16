import React, { useContext, useRef } from 'react';
import { AdminEventsContext } from '../context';
import { CalendarDays, Plus, Pencil, Trash2, Upload, X, ImageOff } from 'lucide-react';
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';

export const AdminEventsTable: React.FC = () => {
  const ctx = useContext(AdminEventsContext);
  if (!ctx) return null;
  const { events, isLoading, openAdd, openEdit, openDeleteConfirm, deleteTargetId, isDeleting, cancelDelete, confirmDelete } = ctx;

  return (
    <div className="page-wrapper">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <CalendarDays className="h-3 w-3" />
            Admin Panel
          </div>
          <h1 className="section-heading">Events Management</h1>
          <p className="section-subheading">Add, edit, and remove events shown on the public Events page</p>
        </div>
        <button id="add-event-btn" onClick={openAdd} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No events yet. Click "Add Event" to create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col group">
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                {event.images[0] ? (
                  <img src={event.images[0].imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                {event.images.length > 1 && (
                  <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    +{event.images.length - 1} more
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">{event.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(event)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
                  >
                    <Pencil className="h-3.5 w-3.5 text-emerald-600" /> Edit Event
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(event.id)}
                    className="flex items-center justify-center p-2 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventFormModal />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Event?"
        message={`Are you sure you want to delete this event? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

const EventFormModal: React.FC = () => {
  const ctx = useContext(AdminEventsContext);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const { isModalOpen, editTarget, form, formErrors, pendingImages, isSaving, closeModal, handleFormChange, handleAddImage, handleRemoveImage, handleSave, MAX_IMAGES } = ctx;

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={editTarget ? 'Edit Event' : 'Add Event'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button onClick={closeModal} disabled={isSaving} className="btn-outline px-5 py-2">Cancel</button>
          <button id="save-event-btn" onClick={handleSave} disabled={isSaving} className="btn-primary px-6 py-2">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </span>
            ) : (editTarget ? 'Save Changes' : 'Create Event')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="form-label">Event Title *</label>
          <input id="event-title" type="text" placeholder="e.g. Annual Charity Drive 2024" value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} className={`form-input ${formErrors.title ? 'border-red-400' : ''}`} />
          {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
        </div>
        <div>
          <label className="form-label">Description *</label>
          <textarea id="event-description" rows={3} placeholder="Describe the event..." value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} className={`form-input resize-none ${formErrors.description ? 'border-red-400' : ''}`} />
          {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">Event Photos * <span className="text-slate-400 font-normal">({pendingImages.length}/{MAX_IMAGES})</span></label>
            {pendingImages.length < MAX_IMAGES && (
              <React.Fragment>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleAddImage(f); e.target.value = ''; } }} />
                <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Add Photo
                </button>
              </React.Fragment>
            )}
          </div>
          {formErrors.images && <p className="text-red-500 text-xs mb-2">{formErrors.images}</p>}
          {pendingImages.length === 0 ? (
            <React.Fragment>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleAddImage(f); e.target.value = ''; } }} />
              <button type="button" onClick={() => fileRef.current?.click()} className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${formErrors.images ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'}`}>
                <Upload className={`h-6 w-6 ${formErrors.images ? 'text-red-400' : 'text-slate-400'}`} />
                <span className="text-sm font-medium text-slate-600">Click to upload event photo</span>
                <span className="text-xs text-slate-400">JPG, PNG or WebP · Max 5MB · Up to 3 photos</span>
              </button>
            </React.Fragment>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <img src={img.type === 'new' ? img.previewUrl : img.imageUrl} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => handleRemoveImage(i)} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-red-600 text-white transition-colors shadow-sm" title="Remove photo">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {pendingImages.length < MAX_IMAGES && (
                <React.Fragment>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleAddImage(f); e.target.value = ''; } }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors">
                    <Plus className="h-6 w-6" />
                    <span className="text-xs font-semibold">Add Photo</span>
                  </button>
                </React.Fragment>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
