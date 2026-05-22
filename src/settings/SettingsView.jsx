import React, { useState } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

function SettingsView({ setIsAdmin, isAdmin }) {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // TARGET SECURITY ACCESS TOKEN KEY DEFINITION
  const STATIC_ADMIN_KEY = process.env.REACT_APP_ADMIN_KEY; // Change this string value to your private secret pass code

  const handleVerify = (e) => {
    e.preventDefault();
    console.log('Verifying access code:', accessCode); // Debug log for entered code
    console.log('Expected admin key:', STATIC_ADMIN_KEY); // Debug log for expected key
    if (accessCode === STATIC_ADMIN_KEY) {
      localStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
      setStatusMessage('success');
      setTimeout(() => {
        navigate('/'); // Route back to catalog home with unlocked controls
      }, 1500);
    } else {
      setStatusMessage('error');
      setAccessCode('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    setStatusMessage('');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200/80 p-6 rounded-2xl space-y-5 shadow-sm mt-8">
      <div className="flex items-center gap-2 text-slate-500">
        <Link to="/" className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"><ArrowLeft size={18} /></Link>
        <h2 className="font-bold text-slate-800 tracking-tight text-base">Configuration Console</h2>
      </div>

      {isAdmin ? (
        <div className="space-y-4 text-center py-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 mb-2">
            <CheckCircle size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Admin Mode Active</h3>
          <p className="text-slate-500 text-xs px-4 leading-relaxed">
            You have unlocked authorization access permissions. The "Add Bag" button layout profile is now functional inside your lookbook control panels.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full mt-4 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-semibold p-3 rounded-xl transition text-sm cursor-pointer"
          >
            Revoke Access Session
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-600 mb-1.5 font-semibold tracking-wide text-xs uppercase">
              Admin Entry Key *
            </label>
            <input 
              type="password" 
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              required 
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all duration-200 tracking-widest text-center" 
              placeholder="••••••••••••••" 
            />
          </div>

          {statusMessage === 'error' && (
            <p className="text-xs text-red-600 bg-red-50/60 border border-red-100 p-2.5 rounded-xl font-medium text-center">
              Incorrect security access key. Check entry settings logs.
            </p>
          )}

          {statusMessage === 'success' && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl font-medium text-center animate-pulse">
              Key Verified! Opening administrative dashboard panels...
            </p>
          )}

          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold p-3.5 rounded-xl transition-all duration-200 tracking-wide text-sm shadow-sm mt-2 cursor-pointer"
          >
            Authenticate Credentials
          </button>
        </form>
      )}
    </div>
  );
}

export default SettingsView;