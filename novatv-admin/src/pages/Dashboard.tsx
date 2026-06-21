import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Movie, Category } from '../types';
import { MovieTable } from '../components/MovieTable';
import { Film, LayoutGrid, Award, Radio, RefreshCcw, AlertOctagon } from 'lucide-react';

interface DashboardProps {
  onEditMovie: (movie: Movie) => void;
  onAddMovieClick: () => void;
}

export default function Dashboard({ onEditMovie, onAddMovieClick }: DashboardProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const fetchStatsAndMovies = async () => {
    try {
      setLoading(true);
      setErrorLocal(null);

      // Load movies
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (moviesError) throw moviesError;

      // Load categories
      const { data: catsData, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (catsError) throw catsError;

      setMovies(moviesData || []);
      setCategories(catsData || []);
    } catch (err: any) {
      console.error('Error fetching dashboard states:', err);
      setErrorLocal('Ocurrió un error conectando con Supabase. Verifica tu configuración y credenciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndMovies();
  }, []);

  const handleDeleteMovie = async (id: string) => {
    try {
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (error) throw error;
      // Re-fetch list
      await fetchStatsAndMovies();
    } catch (err: any) {
      console.error('Error deleting movie:', err);
      alert('Error al eliminar película. Asegúrate de eliminar dependencias primero.');
    }
  };

  // Compute metric numbers
  const totalCount = movies.length;
  const categoriesCount = categories.length;
  const featuredCount = movies.filter((m) => m.is_featured).length;
  const backupCompletes = movies.filter((m) => m.embed_url_2 || m.embed_url_3).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface p-4 rounded-xl border border-white/5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Catálogo de Películas</h1>
          <p className="text-xs text-gray-400">Panel de Control General de NovaTv</p>
        </div>
        <button
          onClick={fetchStatsAndMovies}
          disabled={loading}
          className="bg-white/5 hover:bg-white/10 disabled:opacity-45 text-gray-300 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refrescar BD
        </button>
      </div>

      {errorLocal && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 shrink-0" />
          <span>{errorLocal}</span>
        </div>
      )}

      {/* Analytics KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Películas</span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-500">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Destacadas</span>
            <span className="text-2xl font-black text-white">{featuredCount}</span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Con Respaldos</span>
            <span className="text-2xl font-black text-white">{backupCompletes}</span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Categorías</span>
            <span className="text-2xl font-black text-white">{categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Item search grid Table */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-white/5 py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-gray-500">Cargando catálogo desde Supabase...</span>
        </div>
      ) : (
        <MovieTable
          movies={movies}
          categories={categories}
          onEdit={onEditMovie}
          onDelete={handleDeleteMovie}
          onAddClick={onAddMovieClick}
        />
      )}
    </div>
  );
}
