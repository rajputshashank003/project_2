import React, { useRef } from 'react';
import { useAdminGallery } from './useAdminGallery';
import { AdminGalleryContext } from './context';
import { Images, Upload, Trash2 } from 'lucide-react';

const AdminGalleryContent: React.FC = () => {
  const ctx = React.useContext(AdminGalleryContext);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const { images, isLoading, uploading, caption, setCaption, handleUpload, handleDelete } = ctx;

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
      <div className="card-md mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="form-label">Caption (optional)</label>
          <input id="gallery-caption" type="text" placeholder="Describe this photo…" value={caption} onChange={(e) => setCaption(e.target.value)} className="form-input" />
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleUpload(f); e.target.value = ''; } }} />
        <button
          id="gallery-upload-btn"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary py-3 px-6 shrink-0 self-end"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Uploading…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </span>
          )}
        </button>
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                {img.caption && <span className="text-white text-xs font-medium mb-2">{img.caption}</span>}
                <button
                  onClick={() => handleDelete(img.id)}
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
