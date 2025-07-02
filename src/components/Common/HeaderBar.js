import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Importar o novo useAuth

export default function HeaderBar({ onLogout, onToggleSidebar }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth(); // Obter user e profile do contexto

  return (
    <header className="w-full bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] border-b border-gray-200 shadow-sm py-1 px-3 flex items-center justify-between z-50 relative min-h-[48px] h-12">
      <div className="flex items-center">
        {/* Ícone do menu hambúrguer visível em telas pequenas */}
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden mr-2 p-2 rounded-md text-gray-700 hover:bg-gray-200"
          aria-label="Abrir menu"
        >
          <FaBars />
        </button>
        <div className="flex items-center cursor-pointer select-none" onClick={() => navigate('/dashboard')}>
          <img src="/logob.png" alt="Logo Rapmarketing" className="h-10 w-auto object-contain transition-all duration-300" />
        </div>
      </div>
      <div className="flex items-center gap-2 relative">
        {profile?.avatar_url && <img className="w-8 h-8 rounded-full border border-red-400 shadow-sm object-cover" src={profile.avatar_url} alt="avatar" />}
        <button
          className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm transition-colors focus:outline-none text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {user?.email || 'Usuário'} <FaChevronDown className="ml-1 text-xs" />
        </button>
        {open && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] py-2 z-50 animate-fade-in">
            <button
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium transition-colors text-sm"
              onClick={() => { setOpen(false); navigate('/dashboard'); }}
            >Dashboard</button>
            <button
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors text-sm"
              onClick={() => { setOpen(false); onLogout && onLogout(); }}
            >Sair</button>
          </div>
        )}
      </div>
    </header>
  );
}
