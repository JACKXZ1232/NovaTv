import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import MovieForm from './pages/MovieForm';
import { Movie } from './types';
import { Film, LayoutGrid, LogOut, ShieldAlert, MonitorPlay, PlusCircle, Sparkles } from 'lucide-react';

function NavigationLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFormMovie, setActiveFormMovie] = useState<Movie | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('novatv_admin_logged');
    navigate('/login');
  };

  const handleAddMovieClick = () => {
    setActiveFormMovie(null);
    setIsFormOpen(true);
  };

  const handleEditMovieClick = (movie: Movie) => {
    setActiveFormMovie(movie);
    setIsFormOpen(true);
  };

  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    setActiveFormMovie(null);
    // Reload dashboard by reloading page or resetting state triggers
    navigate('/');
  };

  const isTabActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Premium Sidebar Layout */}
      <aside className="w-64 bg-surface border-r border-white/5 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-6">
          {/* Logo brand indicator */}
          <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <MonitorPlay className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">
                NOVA<span className="text-primary">TV</span>
              </span>
              <span className="text-[10px] bg-white/10 text-gray-300 font-bold px-1.5 py-0.5 rounded ml-2 select-none">
                WEB
              </span>
            </div>
          </div>

          {/* Navigability options */}
          <nav className="flex flex-col gap-1 px-3">
            <Link
              to="/"
              onClick={() => setIsFormOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg font-bold text-sm tracking-wide transition-all cursor-pointer ${
                isTabActive('/') && !isFormOpen
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Mis Películas</span>
            </Link>

            <Link
              to="/categories"
              onClick={() => setIsFormOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg font-bold text-sm tracking-wide transition-all cursor-pointer ${
                isTabActive('/categories') && !isFormOpen
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Categorías / Filas</span>
            </Link>

            <button
              onClick={handleAddMovieClick}
              className={`flex items-center gap-3 p-3 rounded-lg font-bold text-sm text-left tracking-wide transition-all cursor-pointer ${
                isFormOpen && !activeFormMovie
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Agregar Película</span>
            </button>
          </nav>
        </div>

        {/* User profile action section */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-[#0a0a0a] p-3 rounded-xl border border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20 text-xs">
                👑
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Administrador</p>
                <span className="text-[9px] text-emerald-400 font-bold select-none uppercase tracking-widest mt-1 block">
                  ● En Línea
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content body canvas */}
      <main className="flex-1 bg-[#0a0a0a] p-8 overflow-y-auto">
        {isFormOpen ? (
          <MovieForm
            movieToEdit={activeFormMovie}
            onCancel={() => setIsFormOpen(false)}
            onSaveSuccess={handleSaveSuccess}
          />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onEditMovie={handleEditMovieClick}
                  onAddMovieClick={handleAddMovieClick}
                />
              }
            />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <NavigationLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
