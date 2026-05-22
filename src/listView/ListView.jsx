import React, { useState, useEffect } from 'react';
import {  Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Image as ImageIcon, Filter } from 'lucide-react';

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

export default ListView;