import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Share2, CheckCircle, Image as ImageIcon } from 'lucide-react';

// Lightbox Package Core Imports
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// 1. Material UI Core Imports for the Modal
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export function SingleView({isAdmin}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // States
  const [isOpenLightbox, setIsOpenLightbox] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false); // MUI State
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
      text: `Check out the ${product.title} product details.`,
      url: window.location.href
    };

    // If native sharing is supported and a product image exists, try converting it to a File object
    if (navigator.share && product.images?.[0]) {
      try {
        const response = await fetch(product.images[0]);
        const blob = await response.blob();
        const extension = product.images[0].split('.').pop().split('?')[0] || 'jpeg';
        const imageFile = new File([blob], `product-image.${extension}`, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          sharePayload.files = [imageFile];
        }
      } catch (imageFetchError) {
        console.warn('Failed to fetch image for sharing, falling back to text-only share', imageFetchError);
      }
    }

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setOpenDeleteModal(false);
      navigate('/');
    } catch (err) {
      alert(`Could not delete item: ${err.message}`);
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400 animate-pulse">Loading item...</div>;
  if (!product) return <div className="text-center py-12 text-red-400">Product does not exist or has been removed.</div>;

  const lightboxSlides = product.images?.map(url => ({ src: url })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && ( 
          <button 
            onClick={() => setOpenDeleteModal(true)}
            className="inline-flex items-center gap-2 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
          >
            Delete 
          </button>
          )}
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
        <div className="space-y-4">
          <div 
            onClick={() => product.images?.length > 0 && setIsOpenLightbox(true)}
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

      {/* 2. MATERIAL UI DIALOG (MODAL) REPLACEMENT */}
      <Dialog
        open={openDeleteModal}
        onClose={() => !deleting && setOpenDeleteModal(false)}
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '8px',
            fontFamily: 'inherit',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
          }
        }}
      >
        <DialogTitle style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.125rem', paddingBottom: '8px' }}>
          Permanently delete entry?
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5' }}>
            This will wipe "{product.title}" out of your cloud database lookup table logs permanently.
          </DialogContentText>
        </DialogContent>
   <DialogActions style={{ padding: '20px', justifyContent: 'flex-end', gap: '12px', display: 'flex' }}>
  <button
    type="button"
    disabled={deleting}
    onClick={() => setOpenDeleteModal(false)}
    style={{
      padding: '10px 20px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      color: '#475569',
      fontWeight: '600',
      borderRadius: '12px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
    onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
  >
    Cancel
  </button>
  
  <button
    type="button"
    disabled={deleting}
    onClick={handleDelete}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 20px',
      backgroundColor: '#dc2626', // Solid red hex
      color: '#ffffff',
      fontWeight: '600',
      borderRadius: '12px',
      fontSize: '0.875rem',
      border: 'none',
      cursor: deleting ? 'not-allowed' : 'pointer',
      opacity: deleting ? 0.5 : 1,
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}
    onMouseEnter={(e) => { if(!deleting) e.target.style.backgroundColor = '#b91c1c' }}
    onMouseLeave={(e) => { if(!deleting) e.target.style.backgroundColor = '#dc2626' }}
  >
    {deleting ? 'Deleting...' : 'Confirm Delete'}
  </button>
</DialogActions>
      </Dialog>

      {/* Lightbox Module */}
      <Lightbox
        open={isOpenLightbox}
        close={() => setIsOpenLightbox(false)}
        index={activeImage}
        slides={lightboxSlides}
        on={{ view: ({ index }) => setActiveImage(index) }}
      />
    </div>
  );
}

export default SingleView;