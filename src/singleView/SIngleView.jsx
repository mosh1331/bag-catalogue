import React, { useState, useEffect } from 'react';
import {Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {  Share2, ArrowLeft, Image as ImageIcon, CheckCircle } from 'lucide-react';

function SingleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // New States for Features
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      if (id) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) setProduct(data);
      }
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  const handleShare = async () => {
    if (!product) return;
    const sharePayload = {
      title: product.title,
      text: `Check out the ${product.title} catalog details.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
      } catch (err) {
        console.warn('Share operation cancelled', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // New Delete Implementation
  const handleDelete = async () => {
    setDeleting(true);
    try {
      // 1. Optional: Extract paths and clean up associated objects from Supabase storage if needed
      // For a simple personal workflow, we delete the database reference record directly:
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      navigate('/');
    } catch (err) {
      alert(`Could not delete item: ${err.message}`);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 animate-pulse">Loading item...</div>;
  if (!product) return <div className="text-center py-12 text-red-400">Product does not exist or has been removed.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <div className="flex items-center gap-2">
          {/* Delete Action Trigger */}
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
          >
            Delete
          </button>
          <button 
            onClick={handleShare} 
            className={`inline-flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {copied ? <CheckCircle size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            {copied ? 'Link Copied!' : 'Share Product'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 bg-white border border-slate-200/80 rounded-3xl p-5 md:p-8 shadow-sm">
        {/* Media View Column */}
        <div className="space-y-4">
          <div 
            onClick={() => product.images?.[activeImage] && setIsLightboxOpen(true)}
            className="aspect-square bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner cursor-zoom-in group relative"
          >
            {product.images?.[activeImage] ? (
              <>
                <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/5 transition-colors duration-200 flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur-md text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">Click to expand</span>
                </div>
              </>
            ) : (
              <ImageIcon size={48} className="text-slate-300" />
            )}
          </div>
          {/* Thumbnails Gallery Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-200 bg-slate-50 ${
                    activeImage === idx 
                      ? 'border-2 border-slate-900 scale-95 shadow-sm opacity-100' 
                      : 'border border-slate-200 opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metadata Copy Column */}
        <div className="flex flex-col justify-between py-2">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-md shadow-2xs">
                {product.category}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
                {product.title}
              </h1>
            </div>
            {product.description && (
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specifications</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. LIGHTBOX FULLSCREEN COMPONENT */}
      {isLightboxOpen && product.images?.[activeImage] && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all"
          >
            CLOSE ESC
          </button>
          <div className="max-w-3xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={product.images[activeImage]} 
              alt={product.title} 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
          {/* Optional internal lightbox image gallery switching navigation */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-md p-2 bg-white/5 backdrop-blur rounded-2xl" onClick={(e) => e.stopPropagation()}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                    activeImage === idx ? 'border-2 border-white scale-95' : 'border border-white/20 opacity-40'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. DELETE CONFIRMATION MODAL OVERLAY */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Permanently delete entry?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                This will wipe "{product.title}" out of your cloud database lookup table logs permanently.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-end text-sm font-semibold pt-2">
              <button
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleView