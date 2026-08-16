import React, { useRef } from 'react';
import { useAdminGallery } from './useAdminGallery';
import { AdminGalleryContext } from './context';
import { Images, Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const AdminGalleryContent: React.FC = () => {
  const ctx = React.useContext(AdminGalleryContext);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const {
    images,
    isLoading,
    uploading,
    caption,
    setCaption,
    selectedFile,
    previewUrl,
    handleSelectFile,
    handleClearSelectedFile,
    handleSubmitUpload,
    openDeleteConfirm,
    deleteTargetId,
    isDeleting,
    cancelDelete,
    confirmDelete,
  } = ctx;

  return (
    <div className="page-wrapper">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <Images className="h-3 w-3" />
          Admin Panel
        </div>
        <h1 className="section-heading">Gallery Management</h1>
        <p className="section-subheading">Add and remove photos from the home page gallery</p>
      </div>

      {/* Upload section */}
      <div className="card-md mb-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-emerald-600" />
          Upload New Gallery Photo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="form-label">Caption (optional)</label>
            <input
              id="gallery-caption"
              type="text"
              placeholder="Describe this photo..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Select Photo *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleSelectFile(f);
                e.target.value = '';
              }}
            />

            {previewUrl ? (
              <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{selectedFile?.name}</p>
                  <p className="text-[11px] text-slate-400">Ready to upload</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedFile}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-sm font-medium"
              >
                <Upload className="h-4 w-4 text-emerald-600" />
                Choose Photo File
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="gallery-upload-btn"
            type="button"
            onClick={handleSubmitUpload}
            disabled={uploading || !selectedFile}
            className="btn-primary py-2.5 px-6 flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <React.Fragment>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Uploading…
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Upload className="h-4 w-4" />
                Submit / Upload Photo
              </React.Fragment>
            )}
          </button>
        </div>
      </div>

      {/* Gallery grid */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" /></div>
      ) : images.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">
          <Images className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No images yet. Upload your first photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-2xl aspect-square bg-slate-100">
              <img src={img.imageUrl} alt={img.caption || 'Gallery'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                {img.caption && <span className="text-white text-xs font-medium mb-2">{img.caption}</span>}
                <button
                  onClick={() => openDeleteConfirm(img.id)}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors self-start"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Photo?"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

const AdminGallery: React.FC = () => {
  const state = useAdminGallery();
  return (
    <AdminGalleryContext.Provider value={state}>
      <AdminGalleryContent />
    </AdminGalleryContext.Provider>
  );
};

export default AdminGallery;
