import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

export default function HeaderBar({ user, avatar, onLogout, className }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <header className={`w-full bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] border-b border-gray-200 shadow-sm py-3 px-6 flex items-center justify-between z-50 relative ${className || ''}`}>
      <div className="flex items-center cursor-pointer select-none" onClick={() => navigate('/dashboard')}>
        <img src="/logob.png" alt="Logo Rapmarketing" className="h-16 w-auto object-contain transition-all duration-300" />
      </div>
      <div className="flex items-center gap-4 relative">
        {avatar && <img className="w-10 h-10 rounded-full border-2 border-red-400 shadow-sm object-cover" src={avatar} alt="avatar" />}
        <button
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm transition-colors focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          {user?.email || 'Usuário'} <FaChevronDown className="ml-2 text-base" />
        </button>
        {open && (
          <div className="absolute right-0 top-14 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] py-2 z-50 animate-fade-in">
            <button
              className="w-full text-left px-5 py-2 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              onClick={() => { setOpen(false); navigate('/dashboard'); }}
            >Dashboard</button>
            <button
              className="w-full text-left px-5 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors"
              onClick={() => { setOpen(false); onLogout && onLogout(); }}
            >Sair</button>
          </div>
        )}
      </div>
    </header>
  );
}
