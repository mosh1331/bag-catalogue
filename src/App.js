import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Plus, Grid,Settings } from 'lucide-react';
import SingleView from './singleView/SIngleView';
import ListView from './listView/ListView';
import AddView from './addView/AddView';
import SettingsView from './settings/SettingsView';

export default function App() {

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

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
            {/* DYNAMIC HEADER INTERACTION ACTIONS RENDER LAYER */}
            {isAdmin ? (
              <Link
                to="/add"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 text-sm px-4 shadow-sm"
                title="Add New Item"
              >
                <Plus size={16} />
                <span>Add Bag</span>
              </Link>
            ) : (
              <Link
                to="/settings"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 flex items-center gap-1.5 text-sm px-3 border border-slate-200/60 bg-white"
                title="Admin Settings"
              >
                <Settings size={16} />
                <span className="font-medium">Settings</span>
              </Link>
            )}
          </nav>
        </header>

        <main className="max-w-4xl mx-auto p-4 pb-24 isolate">
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/add" element={<AddView />} />
            <Route path="/product/:id" element={<SingleView isAdmin={isAdmin} />} />
            <Route path="/settings" element={<SettingsView setIsAdmin={setIsAdmin} isAdmin={isAdmin} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

