import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Retrieve configured pass key from environment metadata or fallback secure secret
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || 'novatv_admin_2026';

    if (password === envPass) {
      sessionStorage.setItem('novatv_admin_logged', 'true');
      navigate('/');
    } else {
      setError('Contraseña inválida. Intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-[#E50914]/15 p-4 rounded-full text-primary border border-primary/25">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-center text-white mt-2">
            NOVA<span className="text-primary">TV</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide font-sans text-center">
            Consola del Administrador
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Contraseña Maestra
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Introducir código secreto..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 pl-4 pr-4 py-3 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:border-primary transition-all text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3 text-xs font-medium flex items-center gap-2 animate-pulse">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded-lg select-none cursor-pointer transition-colors text-sm tracking-wider uppercase mt-2 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Acceder al Sistema
          </button>
        </form>

        <p className="text-[10px] text-gray-600 font-semibold tracking-wide text-center">
          NovaTv Streaming Server 📺 © 2026
        </p>
      </div>
    </div>
  );
}
