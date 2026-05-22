import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft } from 'lucide-react';

function AddView() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !files || files.length === 0) {
      alert('Fill out title, category, and attach images.');
      return;
    }
    setProcessing(true);

    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const targetFile = files[i];
        const uniqueKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const parsedExtension = targetFile.name.split('.').pop();
        const assetLocationPath = `${uniqueKey}.${parsedExtension}`;

        // 1. Send file payload straight to storage bucket
        const { error: uploadError } = await supabase.storage
          .from('catalog')
          .upload(assetLocationPath, targetFile);

        console.log('Upload response for', targetFile.name, JSON.stringify(uploadError));

        if (uploadError) throw uploadError;

        /* ==========================================================================
           FORCE INJECTION FIX: Bypass the SDK helper and build a clean URL manually.
           This explicitly adds "/public/" right into the database entry array.
           ========================================================================== */
        const manualPublicUrl = `https://dwpjigwsiiqfmkctjfvd.supabase.co/storage/v1/object/public/catalog/${assetLocationPath}`;
        uploadedUrls.push(manualPublicUrl);
      }

      // 2. Commit metadata and explicit public links to products table
      const { error: dbError } = await supabase.from('products').insert([
        { title, category, description, images: uploadedUrls }
      ]);

      if (dbError) throw dbError;
      navigate('/');
    } catch (error) {
      alert(`Upload pipeline failed: ${error.message || error}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
   <div className="max-w-md mx-auto bg-white border border-slate-200/80 p-6 rounded-2xl space-y-5 shadow-sm">
  <div className="flex items-center gap-2 text-slate-500">
    <Link to="/" className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"><ArrowLeft size={18} /></Link>
    <h2 className="font-bold text-slate-800 tracking-tight text-base">Catalog Entry Manager</h2>
  </div>
  <form onSubmit={handleSubmit} className="space-y-4 text-sm">
    <div>
      <label className="block text-slate-600 mb-1.5 font-semibold tracking-wide text-xs uppercase">Bag Title *</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all duration-200" placeholder="e.g., Classic Tote" />
    </div>
    <div>
      <label className="block text-slate-600 mb-1.5 font-semibold tracking-wide text-xs uppercase">Category *</label>
      <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all duration-200" placeholder="e.g., Tote, Backpack" />
    </div>
    <div>
      <label className="block text-slate-600 mb-1.5 font-semibold tracking-wide text-xs uppercase">Product Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all duration-200 resize-none" placeholder="Dimensions, pockets, structural details..." />
    </div>
    <div>
      <label className="block text-slate-600 mb-1.5 font-semibold tracking-wide text-xs uppercase">Images * ({files?.length || 0} attached)</label>
      <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} required className="w-full text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 text-xs file:cursor-pointer transition-all duration-200 file:shadow-sm" />
    </div>
    <button type="submit" disabled={processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold p-3.5 rounded-xl transition-all duration-200 disabled:opacity-40 tracking-wide text-sm shadow-sm mt-2">
      {processing ? 'Uploading Images & Data...' : 'Save Product'}
    </button>
  </form>
</div>
  );
}

export default AddView;