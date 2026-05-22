import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Plus, Grid,ArrowLeft, Image as ImageIcon, Filter } from 'lucide-react';
import SingleView from './singleView/SIngleView';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5 flex justify-between items-center shadow-sm">
          <Link to="/" className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Leu Tote
          </Link>
          <nav className="flex gap-2">
            <Link
              to="/"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
              title="Catalog View"
            >
              <Grid size={20} />
            </Link>
            <Link
              to="/add"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 text-sm px-4 shadow-sm"
              title="Add New Item"
            >
              <Plus size={16} />
              <span>Add Bag</span>
            </Link>
          </nav>
        </header>

        <main className="max-w-4xl mx-auto p-4 pb-24">
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/add" element={<AddView />} />
            <Route path="/product/:id" element={<SingleView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

/* ==========================================================================
   1. CATALOG VIEW WITH ACTIVE FILTERS
   ========================================================================== */
function ListView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCatalog() {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
        const uniqueCategories = ['All', ...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
      }
      setLoading(false);
    }
    fetchCatalog();
  }, []);

  const filteredProducts = activeFilter === 'All'
    ? products
    : products.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase());

  if (loading) return <div className="text-center py-12 text-slate-400 animate-pulse">Loading lookbook catalog...</div>;

  return (
    <div className="space-y-6">
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter size={16} className="text-slate-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 tracking-wide ${activeFilter === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-transparent'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-400 font-medium">
          No bags found in this section. Add one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {filteredProducts.map(product => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <ImageIcon size={32} className="text-slate-300" />
                )}
                <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md text-slate-800 shadow-sm border border-slate-100">
                  {product.category}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between bg-white">
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-slate-600 transition-colors tracking-tight">
                  {product.title}
                </h3>
                <span className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                  {product.images?.length || 0} Images
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   2. ADD VIEW WITH IMAGE UPLOAD CHANNELS
   ========================================================================== */
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

/* ==========================================================================
   3. SHAREABLE SINGLE ITEM VIEW
   ========================================================================== */
